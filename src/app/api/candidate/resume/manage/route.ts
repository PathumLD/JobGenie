import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { ResumeStorage } from '@/lib/resume-storage';
import {
  JWTPayload,
  ResumeUpdateResponse,
  ResumeDeleteResponse,
  ResumeUpdateData,
  ResumeDeleteData,
  ErrorResponse
} from '@/types/resume-management';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Helper function to set other resumes as non-primary
async function setOtherResumesNonPrimary(candidateId: string, excludeResumeId: string): Promise<void> {
  await prisma.resume.updateMany({
    where: {
      candidate_id: candidateId,
      id: {
        not: excludeResumeId
      }
    },
    data: {
      is_primary: false,
      updated_at: new Date()
    }
  });
}

// Helper function to update candidate resume URL
async function updateCandidateResumeUrl(candidateId: string, resumeUrl: string | null): Promise<void> {
  await prisma.candidate.update({
    where: { user_id: candidateId },
    data: {
      resume_url: resumeUrl,
      updated_at: new Date(),
    }
  });
}

export async function PUT(request: NextRequest): Promise<NextResponse<ResumeUpdateResponse | ErrorResponse>> {
  try {
    console.log('🔄 Resume Management Update API called');

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
        { error: 'Access denied. Only candidates can manage resumes.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json() as ResumeUpdateData;
    const { resume_id, is_primary, is_allow_fetch } = body;

    if (!resume_id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // 3. Check if resume exists and belongs to the candidate
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: resume_id,
        candidate_id: payload.userId
      }
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found or access denied' },
        { status: 404 }
      );
    }

    // 4. Set other resumes as non-primary if this one is being set as primary
    if (is_primary) {
      await setOtherResumesNonPrimary(payload.userId, resume_id);
      console.log('✅ Other resumes set as non-primary');
    }

    // 5. Update resume record
    const updatedResume = await prisma.resume.update({
      where: { id: resume_id },
      data: {
        is_primary: is_primary !== undefined ? is_primary : existingResume.is_primary,
        is_allow_fetch: is_allow_fetch !== undefined ? is_allow_fetch : existingResume.is_allow_fetch,
        updated_at: new Date(),
      }
    });

    // 6. Update candidate table with resume URL if this is primary
    if (is_primary) {
      await updateCandidateResumeUrl(payload.userId, updatedResume.resume_url);
      console.log('✅ Candidate resume_url updated');
    }

    console.log('✅ Resume updated:', updatedResume.id);

    const response: ResumeUpdateResponse = {
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Resume management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ResumeDeleteResponse | ErrorResponse>> {
  try {
    console.log('🔄 Resume Management Delete API called');

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
        { error: 'Access denied. Only candidates can delete resumes.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json() as ResumeDeleteData;
    const { resume_id } = body;

    if (!resume_id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // 3. Check if resume exists and belongs to the candidate
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: resume_id,
        candidate_id: payload.userId
      }
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found or access denied' },
        { status: 404 }
      );
    }

    // 4. Delete from Supabase storage
    try {
      const fileName = existingResume.resume_url?.split('/').pop();
      if (fileName) {
        const filePath = `${payload.userId}/${fileName}`;
        await ResumeStorage.deleteResume(filePath);
        console.log('✅ File deleted from storage');
      }
    } catch (storageError) {
      console.warn('⚠️ Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // 5. Delete resume record from database
    await prisma.resume.delete({
      where: { id: resume_id }
    });

    // 6. Update candidate table if this was the primary resume
    if (existingResume.is_primary) {
      // Find another resume to set as primary
      const nextPrimaryResume = await prisma.resume.findFirst({
        where: {
          candidate_id: payload.userId,
          id: { not: resume_id }
        },
        orderBy: { uploaded_at: 'desc' }
      });

      if (nextPrimaryResume) {
        // Set the next resume as primary
        await prisma.resume.update({
          where: { id: nextPrimaryResume.id },
          data: {
            is_primary: true,
            updated_at: new Date()
          }
        });

        // Update candidate table
        await updateCandidateResumeUrl(payload.userId, nextPrimaryResume.resume_url);
        console.log('✅ New primary resume set:', nextPrimaryResume.id);
      } else {
        // No more resumes, clear candidate resume_url
        await updateCandidateResumeUrl(payload.userId, null);
        console.log('✅ Candidate resume_url cleared');
      }
    }

    console.log('✅ Resume deleted:', resume_id);

    const response: ResumeDeleteResponse = {
      success: true,
      message: 'Resume deleted successfully',
      data: {
        deleted_resume_id: resume_id,
        candidate_id: payload.userId
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Resume deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
