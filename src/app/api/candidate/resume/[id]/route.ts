import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { Resume, JWTPayload, ErrorResponse } from '@/types/resume-management';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; data: Resume } | ErrorResponse>> {
  try {
    console.log('🔄 Get Resume by ID API called');

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
        { error: 'Access denied. Only candidates can view resumes.' },
        { status: 403 }
      );
    }

    const resumeId = params.id;

    // 2. Get resume by ID
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidate_id: payload.userId
      }
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found or access denied' },
        { status: 404 }
      );
    }

    console.log('✅ Resume retrieved:', resume.id);

    return NextResponse.json({
      success: true,
      data: resume
    });

  } catch (error) {
    console.error('❌ Get resume by ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
