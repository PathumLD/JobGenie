import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface ResumeCreateData {
  resume_url: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  is_primary?: boolean;
  is_allow_fetch?: boolean;
}

// interface ResumeUpdateData {
//   title?: string;
//   file_url?: string;
//   file_name?: string;
//   file_size?: number;
//   file_type?: string;
//   is_primary?: boolean;
//   description?: string;
//   tags?: string[];
//   version?: string;
//   created_by?: string;
//   updated_by?: string;
//   status?: string;
//   visibility?: string;
//   access_level?: string;
//   download_count?: number;
//   last_downloaded?: string;
//   last_viewed?: string;
//   rating?: number;
//   feedback?: string;
//   is_archived?: boolean;
//   archive_reason?: string;
//   archive_date?: string;
//   restore_date?: string;
//   metadata?: Record<string, unknown>;
// }

interface ResumeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    is_allow_fetch: boolean | null;
    resume_url: string | null;
    original_filename: string | null;
    file_size: number | null;
    file_type: string | null;
    is_primary: boolean | null;
    uploaded_at: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface ResumeErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all resumes for the candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; message: string; data: ResumeResponse['data'][] } | ResumeErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ResumeErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as ResumeErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const resumes = await prisma.resume.findMany({
      where: { candidate_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Resumes retrieved successfully',
      data: resumes
    });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch resumes'
      } as ResumeErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new resume
export async function POST(
  request: NextRequest
): Promise<NextResponse<ResumeResponse | ResumeErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ResumeErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as ResumeErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: ResumeCreateData = await request.json();

    // Validate required fields
    if (!body.resume_url || !body.original_filename || !body.file_size || !body.file_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'resume_url, original_filename, file_size, and file_type are required'
        } as ResumeErrorResponse,
        { status: 400 }
      );
    }

    // Validate file size (positive number)
    if (body.file_size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'File size must be positive'
        } as ResumeErrorResponse,
        { status: 400 }
      );
    }



    // If this is marked as primary, unmark other resumes as primary
    if (body.is_primary) {
      await prisma.resume.updateMany({
        where: { 
          candidate_id: userId,
          is_primary: true 
        },
        data: { is_primary: false }
      });
    }

    const newResume = await prisma.resume.create({
      data: {
        candidate_id: userId,
        resume_url: body.resume_url,
        original_filename: body.original_filename,
        file_size: body.file_size,
        file_type: body.file_type,
        is_primary: body.is_primary || false,
        is_allow_fetch: body.is_allow_fetch !== undefined ? body.is_allow_fetch : true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Resume created successfully',
      data: newResume
    });

  } catch (error) {
    console.error('Error creating resume:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create resume'
      } as ResumeErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
