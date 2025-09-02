import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Response types
interface JobApplicationResponse {
  message: string;
  application: {
    id: string;
    job_id: string;
    candidate_id: string;
    status: string;
    applied_at: Date;
    cover_letter?: string;
  };
}

interface JobApplicationRequest {
  job_id: string;
  cover_letter?: string;
  resume_id?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<JobApplicationResponse | ApiErrorResponse>> {
  try {
    // 1. Authenticate user
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can apply for jobs.' },
        { status: 403 }
      );
    }

    // 2. Check if candidate is approved by MIS
    const candidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      select: { approval_status: true }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    if (candidate.approval_status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'Application blocked', 
          message: 'Your profile must be approved by MIS before you can apply for jobs. Please wait for approval or contact support if you have questions.' 
        },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body: JobApplicationRequest = await request.json();
    const { job_id, cover_letter, resume_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // 4. Check if job exists and is published
    const job = await prisma.job.findUnique({
      where: { 
        id: job_id,
        status: 'published'
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or not published' },
        { status: 404 }
      );
    }

    // 5. Check if candidate has already applied for this job
    const existingApplication = await prisma.application.findUnique({
      where: {
        job_id_candidate_id: {
          job_id,
          candidate_id: payload.userId
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    // 6. Create job application
    const application = await prisma.application.create({
      data: {
        job_id,
        candidate_id: payload.userId,
        resume_id: resume_id || null,
        cover_letter: cover_letter || null,
        status: 'pending',
        applied_at: new Date(),
        source: 'web_application'
      }
    });

    // 7. Update job applications count
    await prisma.job.update({
      where: { id: job_id },
      data: { applications_count: { increment: 1 } }
    });

    // 8. Create application snapshot
    await prisma.applicationSnapshot.create({
      data: {
        application_id: application.id,
        candidate_id: payload.userId,
        // Add other snapshot fields as needed
      }
    });

    return NextResponse.json({
      message: 'Job application submitted successfully',
      application: {
        id: application.id,
        job_id: application.job_id,
        candidate_id: application.candidate_id,
        status: application.status,
        applied_at: application.applied_at,
        cover_letter: application.cover_letter
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Job application error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
