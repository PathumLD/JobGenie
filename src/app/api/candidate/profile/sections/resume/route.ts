import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface ResumeCreateData {
  title: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  is_primary?: boolean;
  description?: string;
  tags?: string[];
  version?: string;
  created_by?: string;
  updated_by?: string;
  status?: string;
  visibility?: string;
  access_level?: string;
  download_count?: number;
  last_downloaded?: string;
  last_viewed?: string;
  rating?: number;
  feedback?: string;
  is_archived?: boolean;
  archive_reason?: string;
  archive_date?: string;
  restore_date?: string;
  metadata?: Record<string, unknown>;
}

interface ResumeUpdateData {
  title?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  is_primary?: boolean;
  description?: string;
  tags?: string[];
  version?: string;
  created_by?: string;
  updated_by?: string;
  status?: string;
  visibility?: string;
  access_level?: string;
  download_count?: number;
  last_downloaded?: string;
  last_viewed?: string;
  rating?: number;
  feedback?: string;
  is_archived?: boolean;
  archive_reason?: string;
  archive_date?: string;
  restore_date?: string;
  metadata?: Record<string, unknown>;
}

interface ResumeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    title: string | null;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
    file_type: string | null;
    is_primary: boolean | null;
    description: string | null;
    tags: string[];
    version: string | null;
    created_by: string | null;
    updated_by: string | null;
    status: string | null;
    visibility: string | null;
    access_level: string | null;
    download_count: number | null;
    last_downloaded: Date | null;
    last_viewed: Date | null;
    rating: number | null;
    feedback: string | null;
    is_archived: boolean | null;
    archive_reason: string | null;
    archive_date: Date | null;
    restore_date: Date | null;
    metadata: Record<string, unknown> | null;
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
    const token = getTokenFromCookies(request);
    
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
    const token = getTokenFromCookies(request);
    
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
    if (!body.title || !body.file_url || !body.file_name || !body.file_size || !body.file_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Title, file_url, file_name, file_size, and file_type are required'
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

    // Validate dates if provided
    let lastDownloaded: Date | undefined;
    if (body.last_downloaded) {
      lastDownloaded = new Date(body.last_downloaded);
      if (isNaN(lastDownloaded.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid last_downloaded date format'
          } as ResumeErrorResponse,
          { status: 400 }
        );
      }
    }

    let lastViewed: Date | undefined;
    if (body.last_viewed) {
      lastViewed = new Date(body.last_viewed);
      if (isNaN(lastViewed.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid last_viewed date format'
          } as ResumeErrorResponse,
          { status: 400 }
        );
      }
    }

    let archiveDate: Date | undefined;
    if (body.archive_date) {
      archiveDate = new Date(body.archive_date);
      if (isNaN(archiveDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid archive_date format'
          } as ResumeErrorResponse,
          { status: 400 }
        );
      }
    }

    let restoreDate: Date | undefined;
    if (body.restore_date) {
      restoreDate = new Date(body.restore_date);
      if (isNaN(restoreDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid restore_date format'
          } as ResumeErrorResponse,
          { status: 400 }
        );
      }
    }

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 0 || body.rating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Rating must be between 0 and 5'
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
        title: body.title,
        file_url: body.file_url,
        file_name: body.file_name,
        file_size: body.file_size,
        file_type: body.file_type,
        is_primary: body.is_primary || false,
        description: body.description,
        tags: body.tags || [],
        version: body.version || '1.0',
        created_by: body.created_by || userId,
        updated_by: body.updated_by || userId,
        status: body.status || 'active',
        visibility: body.visibility || 'public',
        access_level: body.access_level || 'read',
        download_count: body.download_count || 0,
        last_downloaded: lastDownloaded,
        last_viewed: lastViewed,
        rating: body.rating,
        feedback: body.feedback,
        is_archived: body.is_archived || false,
        archive_reason: body.archive_reason,
        archive_date: archiveDate,
        restore_date: restoreDate,
        metadata: body.metadata || {}
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
