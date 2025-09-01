import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types based on schema.prisma - following exact structure
interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  exp?: number;
  iat?: number;
}

interface ResumeUploadData {
  is_allow_fetch?: boolean;
  is_primary?: boolean;
  original_filename?: string;
  file_size?: number;
  file_type?: string;
}

// Enhanced duplicate detection function with stricter matching
type WorkExperienceData = {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
};

type EducationData = {
  degree_diploma: string;
  university_school: string;
};

type CertificateData = {
  name: string;
  issuing_authority: string;
};

type ProjectData = {
  name: string;
};

type AwardData = {
  title: string;
  offered_by: string;
};

type VolunteeringData = {
  role: string;
  institution: string;
};

type LanguageData = {
  language: string;
};

type SkillData = {
  name: string;
};

// Helper function to upload resume to Supabase storage
async function uploadResume(file: File, candidateId: string): Promise<{ filePath: string; publicUrl: string }> {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `candidate_resume/${candidateId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('candidate_resume')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw new Error(`Failed to upload resume: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('candidate_resume')
    .getPublicUrl(filePath);
  
  return {
    filePath,
    publicUrl: urlData.publicUrl
  };
}

// Helper function to set other resumes as non-primary
async function setOtherResumesNonPrimary(candidateId: string, excludeResumeId?: string) {
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Resume Upload API called');

    // 1. Authenticate user - get token from Authorization header
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
    const resumeData = formData.get('resumeData') as string | null;

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    // 3. Validate resume file
    if (!resumeFile.type.startsWith('application/') && 
        !resumeFile.type.includes('pdf') && 
        !resumeFile.type.includes('doc') && 
        !resumeFile.type.includes('docx')) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, and DOCX files are allowed for resumes' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit for resumes)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (resumeFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Resume file size must be less than 10MB' },
        { status: 400 }
      );
    }

    // 4. Parse resume data if provided
    let uploadData: ResumeUploadData = {};
    if (resumeData) {
      try {
        uploadData = JSON.parse(resumeData);
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
    let uploadResult: { filePath: string; publicUrl: string };
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
      await prisma.candidate.update({
        where: { user_id: payload.userId },
        data: {
          resume_url: uploadResult.publicUrl,
          updated_at: new Date(),
        }
      });
      console.log('✅ Candidate resume_url updated');
    }

    // 10. Return success response
    return NextResponse.json({
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
    });

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

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Get Candidate Resumes API called');

    // 1. Authenticate user - get token from Authorization header
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

    return NextResponse.json({
      success: true,
      data: {
        candidate_id: payload.userId,
        resumes: resumes,
        total_count: resumes.length,
        primary_resume: resumes.find((r: typeof resumes[number]) => r.is_primary) || null
      }
    });

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

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Resume Update API called');

    // 1. Authenticate user - get token from Authorization header
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
    const body = await request.json();
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
      await prisma.candidate.update({
        where: { user_id: payload.userId },
        data: {
          resume_url: updatedResume.resume_url,
          updated_at: new Date(),
        }
      });
      console.log('✅ Candidate resume_url updated');
    }

    console.log('✅ Resume updated:', updatedResume.id);

    return NextResponse.json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    });

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

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔄 Resume Delete API called');

    // 1. Authenticate user - get token from Authorization header
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
    const body = await request.json();
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
        const filePath = `candidate_resume/${payload.userId}/${fileName}`;
        const { error } = await supabase.storage
          .from('candidate_resume')
          .remove([filePath]);
        
        if (error) {
          console.warn('⚠️ Failed to delete file from storage:', error.message);
        } else {
          console.log('✅ File deleted from storage');
        }
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
        await prisma.candidate.update({
          where: { user_id: payload.userId },
          data: {
            resume_url: nextPrimaryResume.resume_url,
            updated_at: new Date()
          }
        });
        console.log('✅ New primary resume set:', nextPrimaryResume.id);
      } else {
        // No more resumes, clear candidate resume_url
        await prisma.candidate.update({
          where: { user_id: payload.userId },
          data: {
            resume_url: null,
            updated_at: new Date()
          }
        });
        console.log('✅ Candidate resume_url cleared');
      }
    }

    console.log('✅ Resume deleted:', resume_id);

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
      data: {
        deleted_resume_id: resume_id,
        candidate_id: payload.userId
      }
    });

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
