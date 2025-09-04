import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for query parameters
const querySchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID format')
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Validate the candidate ID format
    const validation = querySchema.safeParse({ candidateId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid candidate ID format' },
        { status: 400 }
      );
    }

    // Get the candidate's primary resume
    const primaryResume = await prisma.resume.findFirst({
      where: {
        candidate_id: candidateId,
        is_primary: true
      },
      select: {
        id: true,
        candidate_id: true,
        resume_url: true,
        original_filename: true,
        file_size: true,
        file_type: true,
        is_primary: true,
        uploaded_at: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!primaryResume) {
      // If no primary resume, try to get any available resume
      const anyResume = await prisma.resume.findFirst({
        where: {
          candidate_id: candidateId
        },
        select: {
          id: true,
          candidate_id: true,
          resume_url: true,
          original_filename: true,
          file_size: true,
          file_type: true,
          is_primary: true,
          uploaded_at: true,
          created_at: true,
          updated_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (!anyResume) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No resume found for this candidate' 
          },
          { status: 404 }
        );
      }

      // Return the available resume (not primary)
      return NextResponse.json({
        success: true,
        data: {
          resume: anyResume,
          message: 'No primary resume found, showing most recent resume'
        }
      });
    }

    // Return the primary resume
    return NextResponse.json({
      success: true,
      data: {
        resume: primaryResume,
        message: 'Primary resume retrieved successfully'
      }
    });

  } catch (error) {
    console.error('Error fetching candidate resume:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
