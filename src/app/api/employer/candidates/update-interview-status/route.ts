import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

interface UpdateInterviewStatusRequest {
  candidate_id: string;
  interview_ready: boolean;
}

interface UpdateInterviewStatusResponse {
  success: boolean;
  message: string;
}

interface UpdateInterviewStatusErrorResponse {
  success: false;
  error: string;
  message: string;
}

export async function PUT(
  request: NextRequest
): Promise<NextResponse<UpdateInterviewStatusResponse | UpdateInterviewStatusErrorResponse>> {
  try {
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as UpdateInterviewStatusErrorResponse,
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
        } as UpdateInterviewStatusErrorResponse,
        { status: 401 }
      );
    }

    // Parse request body
    const body: UpdateInterviewStatusRequest = await request.json();
    
    if (!body.candidate_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Candidate ID is required'
        } as UpdateInterviewStatusErrorResponse,
        { status: 400 }
      );
    }

    if (typeof body.interview_ready !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Interview ready status must be a boolean value'
        } as UpdateInterviewStatusErrorResponse,
        { status: 400 }
      );
    }

    // Update the candidate's interview_ready status
    const updatedCandidate = await prisma.candidate.update({
      where: {
        user_id: body.candidate_id
      },
      data: {
        interview_ready: body.interview_ready
      },
      select: {
        user_id: true,
        interview_ready: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Candidate interview status updated to ${body.interview_ready ? 'ready' : 'not ready'}`
    } as UpdateInterviewStatusResponse);

  } catch (error) {
    console.error('Error updating candidate interview status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update candidate interview status'
      } as UpdateInterviewStatusErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
