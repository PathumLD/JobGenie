import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

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
    // Extract and verify JWT token
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user has admin privileges (MIS or recruitment agency)
    if (!['mis', 'recruitment_agency'].includes(decodedToken.role)) {
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
    const candidatesWithEmail = candidates.map((candidate: {
      user_id: string;
      first_name: string | null;
      last_name: string | null;
      nic: string | null;
      membership_no: string;
      created_at: Date | null;
      user: { email: string };
    }) => ({
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
