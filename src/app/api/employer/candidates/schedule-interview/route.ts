import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

interface ScheduleInterviewRequest {
  candidate_id: string;
  interview_type: 'phone_screening' | 'video_call' | 'ai_video' | 'technical' | 'behavioral' | 'final';
  scheduled_at: string; // ISO string
  duration_minutes?: number;
  meeting_link?: string;
  meeting_id?: string;
  interview_notes?: string;
}

interface ScheduleInterviewResponse {
  success: boolean;
  interview_id: string;
  message: string;
}

interface ScheduleInterviewErrorResponse {
  success: false;
  error: string;
  message: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ScheduleInterviewResponse | ScheduleInterviewErrorResponse>> {
  try {
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ScheduleInterviewErrorResponse,
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as ScheduleInterviewErrorResponse,
        { status: 401 }
      );
    }

    if (decodedToken.role !== 'employer') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Only employers can schedule interviews'
        } as ScheduleInterviewErrorResponse,
        { status: 403 }
      );
    }

    // Parse request body
    const body: ScheduleInterviewRequest = await request.json();
    
    // Validate required fields
    if (!body.candidate_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Candidate ID is required'
        } as ScheduleInterviewErrorResponse,
        { status: 400 }
      );
    }

    if (!body.interview_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Interview type is required'
        } as ScheduleInterviewErrorResponse,
        { status: 400 }
      );
    }

    if (!body.scheduled_at) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Scheduled date and time is required'
        } as ScheduleInterviewErrorResponse,
        { status: 400 }
      );
    }

    // Validate scheduled_at is in the future
    const scheduledDate = new Date(body.scheduled_at);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Interview must be scheduled for a future date and time'
        } as ScheduleInterviewErrorResponse,
        { status: 400 }
      );
    }

    // Check if candidate exists and is interview ready
    const candidate = await prisma.candidate.findUnique({
      where: { user_id: body.candidate_id },
      select: { 
        user_id: true, 
        interview_ready: true,
        first_name: true,
        last_name: true
      }
    });

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Candidate not found'
        } as ScheduleInterviewErrorResponse,
        { status: 404 }
      );
    }

    if (!candidate.interview_ready) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Candidate is not ready for interviews'
        } as ScheduleInterviewErrorResponse,
        { status: 400 }
      );
    }

    // Check if employer exists
    const employer = await prisma.employer.findUnique({
      where: { user_id: decodedToken.userId },
      select: { user_id: true, first_name: true, last_name: true }
    });

    if (!employer) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Employer profile not found'
        } as ScheduleInterviewErrorResponse,
        { status: 404 }
      );
    }

    // For saved candidates, we'll create a direct interview without an application
    // We'll need to create a placeholder application or modify the schema
    // For now, let's create a minimal application record to satisfy the foreign key constraint
    
    // First, let's check if there's already an application for this candidate and employer
    let application = await prisma.application.findFirst({
      where: {
        candidate_id: body.candidate_id,
        job: {
          employer: {
            some: {
              user_id: decodedToken.userId
            }
          }
        }
      }
    });

    // If no application exists, we'll create a placeholder one
    if (!application) {
      // Get the employer's company
      const employerWithCompany = await prisma.employer.findUnique({
        where: { user_id: decodedToken.userId },
        include: { company: true }
      });

      if (!employerWithCompany?.company) {
        return NextResponse.json(
          {
            success: false,
            error: 'NOT_FOUND',
            message: 'Company profile not found for employer'
          } as ScheduleInterviewErrorResponse,
          { status: 404 }
        );
      }

      // Create a placeholder job for the interview
      const placeholderJob = await prisma.job.create({
        data: {
          title: 'Interview Opportunity',
          description: 'Direct interview with saved candidate',
          company_id: employerWithCompany.company.id,
          location: 'Remote',
          employment_type: 'full_time',
          experience_level: 'any',
          salary_min: null,
          salary_max: null,
          currency: null,
          is_active: false, // Mark as inactive since it's just for interview purposes
          created_by: decodedToken.userId
        }
      });

      // Create a placeholder application
      application = await prisma.application.create({
        data: {
          job_id: placeholderJob.id,
          candidate_id: body.candidate_id,
          status: 'interview',
          applied_at: new Date()
        }
      });
    }

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        application_id: application.id,
        interviewer_id: decodedToken.userId,
        interview_type: body.interview_type,
        scheduled_at: scheduledDate,
        duration_minutes: body.duration_minutes || 60,
        meeting_link: body.meeting_link,
        meeting_id: body.meeting_id,
        interview_notes: body.interview_notes,
        status: 'scheduled'
      }
    });

    return NextResponse.json({
      success: true,
      interview_id: interview.id,
      message: `Interview scheduled successfully for ${candidate.first_name} ${candidate.last_name}`
    } as ScheduleInterviewResponse);

  } catch (error) {
    console.error('Error scheduling interview:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to schedule interview'
      } as ScheduleInterviewErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
