import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractUserDataFromHeaders } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

interface CandidateListResponse {
  message: string;
  candidates: Array<{
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    membership_no: string;
    nic: string | null;
    created_at: Date | null;
  }>;
  total: number;
}

export async function GET(request: NextRequest): Promise<NextResponse<CandidateListResponse | ApiErrorResponse>> {
  try {
    // Extract user data from JWT token (set by middleware)
    const userData = extractUserDataFromHeaders(request.headers);
    
    if (!userData.userId || !userData.email || !userData.role || !userData.userType) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if user has admin privileges (MIS or recruitment agency)
    if (!['mis', 'recruitment_agency'].includes(userData.userType)) {
      return NextResponse.json(
        { error: 'Access denied. This endpoint requires admin privileges.' },
        { status: 403 }
      );
    }

    // Get all candidates with user information
    const candidates = await prisma.candidate.findMany({
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        nic: true,
        membership_no: true,
        created_at: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        membership_no: 'asc'
      }
    });

    // Transform the data to include email
    const candidatesWithEmail = candidates.map(candidate => ({
      user_id: candidate.user_id,
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.user.email,
      membership_no: candidate.membership_no,
      nic: candidate.nic,
      created_at: candidate.created_at
    }));

    return NextResponse.json(
      {
        message: 'Candidates retrieved successfully',
        candidates: candidatesWithEmail,
        total: candidatesWithEmail.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Candidate list error:', error);
    
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
