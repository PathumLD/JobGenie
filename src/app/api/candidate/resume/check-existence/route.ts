import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { JWTPayload } from '@/types/resume-management';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse<{ success: boolean; hasResumes: boolean; count: number } | { error: string }>> {
  try {
    console.log('🔄 Check Resume Existence API called');

    // 1. Authenticate user
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = verifyToken(token) as JWTPayload;
      if (!payload) {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can check resume existence.' },
        { status: 403 }
      );
    }

    // 2. Check if candidate has any resumes
    const resumeCount = await prisma.resume.count({
      where: { candidate_id: payload.userId }
    });

    const hasResumes = resumeCount > 0;

    console.log(`✅ Resume existence check completed. Candidate ${payload.userId} has ${resumeCount} resumes`);

    return NextResponse.json({
      success: true,
      hasResumes,
      count: resumeCount
    });

  } catch (error) {
    console.error('❌ Resume existence check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
