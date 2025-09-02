import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { ResumeStorage } from '@/lib/resume-storage';
import {
  JWTPayload,
  ResumeUploadData,
  ResumeUploadResponse,
  ResumeListResponse,
  ResumeUpdateResponse,
  ResumeDeleteResponse,
  ResumeUpdateData,
  ResumeDeleteData,
  FileUploadResult,
  ErrorResponse,
  Resume
} from '@/types/resume-management';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// File validation configuration
const RESUME_FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx']
};

// Helper function to validate file
function validateResumeFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > RESUME_FILE_CONFIG.maxSize) {
    return {
      isValid: false,
      error: 'Resume file size must be less than 10MB'
    };
  }

  // Check file type
  if (!RESUME_FILE_CONFIG.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF, DOC, and DOCX files are allowed for resumes'
    };
  }

  return { isValid: true };
}

// Helper function to upload resume to Supabase storage
async function uploadResume(file: File, candidateId: string): Promise<FileUploadResult> {
  return ResumeStorage.uploadResume(file, candidateId);
}

// Helper function to set other resumes as non-primary
async function setOtherResumesNonPrimary(candidateId: string, excludeResumeId?: string): Promise<void> {
  await prisma.resume.updateMany({
    where: {
      candidate_id: candidateId,
      id: excludeResumeId ? { not: excludeResumeId } : undefined
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

export async function POST(request: NextRequest): Promise<NextResponse<ResumeUploadResponse | ErrorResponse>> {
  try {
    console.log('🔄 Resume Upload API called');

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
        { error: 'Access denied. Only candidates can upload resumes.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const resumeFile = formData.get('resumeFile') as File | null;
    const resumeDataString = formData.get('resumeData') as string | null;

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    // 3. Validate resume file
    const validation = validateResumeFile(resumeFile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file' },
        { status: 400 }
      );
    }

    // 4. Parse resume data if provided
    let uploadData: ResumeUploadData = {};
    if (resumeDataString) {
      try {
        uploadData = JSON.parse(resumeDataString) as ResumeUploadData;
        console.log('✅ Resume data parsed successfully');
      } catch (parseError) {
        console.error('❌ Failed to parse resume data:', parseError);
        return NextResponse.json(
          { error: 'Invalid resume data format' },
          { status: 400 }
        );
      }
    }

    // 5. Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      include: {
        resumes: {
          where: { is_primary: true }
        }
      }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found. Create profile first.' },
        { status: 404 }
      );
    }

    // 6. Upload resume to Supabase storage
    let uploadResult: FileUploadResult;
    try {
      console.log('📄 Uploading resume:', resumeFile.name, 'Size:', resumeFile.size);
      uploadResult = await uploadResume(resumeFile, payload.userId);
      console.log('✅ Resume uploaded successfully:', uploadResult.publicUrl);
    } catch (uploadError) {
      console.error('❌ Resume upload failed:', uploadError);
      return NextResponse.json(
        { 
          error: 'Failed to upload resume',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 7. Set other resumes as non-primary if this one is primary
    if (uploadData.is_primary) {
      await setOtherResumesNonPrimary(payload.userId);
      console.log('✅ Other resumes set as non-primary');
    }

    // 8. Create resume record in database
    const resumeRecord = await prisma.resume.create({
      data: {
        candidate_id: payload.userId,
        is_allow_fetch: uploadData.is_allow_fetch ?? true,
        resume_url: uploadResult.publicUrl,
        original_filename: uploadData.original_filename || resumeFile.name,
        file_size: uploadData.file_size || resumeFile.size,
        file_type: uploadData.file_type || resumeFile.type,
        is_primary: uploadData.is_primary ?? false,
        uploaded_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    console.log('✅ Resume record created:', resumeRecord.id);

    // 9. Update candidate table with resume URL if this is primary
    if (uploadData.is_primary) {
      await updateCandidateResumeUrl(payload.userId, uploadResult.publicUrl);
      console.log('✅ Candidate resume_url updated');
    }

    // 10. Return success response
    const response: ResumeUploadResponse = {
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume_id: resumeRecord.id,
        candidate_id: resumeRecord.candidate_id,
        resume_url: resumeRecord.resume_url,
        original_filename: resumeRecord.original_filename,
        file_size: resumeRecord.file_size,
        file_type: resumeRecord.file_type,
        is_primary: resumeRecord.is_primary,
        is_allow_fetch: resumeRecord.is_allow_fetch,
        uploaded_at: resumeRecord.uploaded_at,
        storage_path: uploadResult.filePath,
        public_url: uploadResult.publicUrl,
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Resume upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<ResumeListResponse | ErrorResponse>> {
  try {
    console.log('🔄 Get Candidate Resumes API called');

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

    // 2. Get candidate resumes
    const resumes = await prisma.resume.findMany({
      where: { candidate_id: payload.userId },
      orderBy: [
        { is_primary: 'desc' },
        { uploaded_at: 'desc' }
      ]
    });

    const response: ResumeListResponse = {
      success: true,
      data: {
        candidate_id: payload.userId,
        resumes: resumes,
        total_count: resumes.length,
        primary_resume: resumes.find((r: Resume) => r.is_primary) || null
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Resume retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<ResumeUpdateResponse | ErrorResponse>> {
  try {
    console.log('🔄 Resume Update API called');

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
        { error: 'Access denied. Only candidates can update resumes.' },
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
    console.error('❌ Resume update error:', error);
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
    console.log('🔄 Resume Delete API called');

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
