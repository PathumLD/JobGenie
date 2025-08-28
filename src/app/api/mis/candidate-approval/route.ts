import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type definitions for the API
interface ApproveCandidateRequest {
  candidateId: string;
}

interface CandidateApprovalResponse {
  message: string;
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    status: string;
    updated_at: Date | null;
  };
}

interface CandidateStatusResponse {
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    status: string;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface ApiErrorResponse {
  error: string;
}

export async function PUT(request: NextRequest): Promise<NextResponse<CandidateApprovalResponse | ApiErrorResponse>> {
  try {
    const body: ApproveCandidateRequest = await request.json();

    if (!body.candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: body.candidateId }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Check if already approved by looking at user status
    const user = await prisma.user.findUnique({
      where: { id: body.candidateId }
    });

    if (user?.status === 'active') {
      return NextResponse.json(
        { error: 'Candidate is already approved' },
        { status: 400 }
      );
    }

    // Update the user status to active (approve the candidate)
    const updatedUser = await prisma.user.update({
      where: { id: body.candidateId },
      data: { 
        status: 'active'
      },
      select: {
        id: true,
        status: true,
        updated_at: true
      }
    });

    // Get candidate info for response
    const candidateInfo = await prisma.candidate.findUnique({
      where: { user_id: body.candidateId },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        updated_at: true
      }
    });

    if (!candidateInfo) {
      return NextResponse.json(
        { error: 'Candidate info not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Candidate profile approved successfully',
      candidate: {
        ...candidateInfo,
        status: updatedUser.status || 'active'
      }
    });

  } catch (error) {
    console.error('Error approving candidate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<CandidateStatusResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Get candidate approval status by checking user status
    const user = await prisma.user.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { user_id: candidateId },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      candidate: {
        ...candidate,
        status: user.status || 'pending_verification'
      }
    });

  } catch (error) {
    console.error('Error fetching candidate approval status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
