import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
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

// GET - Fetch specific resume record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ResumeResponse | ResumeErrorResponse>> {
  try {
    const { id } = await params;
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

    const resume = await prisma.resume.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Resume record not found'
        } as ResumeErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume record retrieved successfully',
      data: resume
    });

  } catch (error) {
    console.error('Error fetching resume record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch resume record'
      } as ResumeErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update resume record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ResumeResponse | ResumeErrorResponse>> {
  try {
    const { id } = await params;
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
    const body: ResumeUpdateData = await request.json();

    // Check if resume record exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingResume) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Resume record not found'
        } as ResumeErrorResponse,
        { status: 404 }
      );
    }

    // Validate file size if provided
    if (body.file_size !== undefined && body.file_size <= 0) {
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
          is_primary: true,
          id: { not: id }
        },
        data: { is_primary: false }
      });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.file_url !== undefined) updateData.file_url = body.file_url;
    if (body.file_name !== undefined) updateData.file_name = body.file_name;
    if (body.file_size !== undefined) updateData.file_size = body.file_size;
    if (body.file_type !== undefined) updateData.file_type = body.file_type;
    if (body.is_primary !== undefined) updateData.is_primary = body.is_primary;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.version !== undefined) updateData.version = body.version;
    if (body.created_by !== undefined) updateData.created_by = body.created_by;
    if (body.updated_by !== undefined) updateData.updated_by = body.updated_by;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.access_level !== undefined) updateData.access_level = body.access_level;
    if (body.download_count !== undefined) updateData.download_count = body.download_count;
    if (lastDownloaded !== undefined) updateData.last_downloaded = lastDownloaded;
    if (lastViewed !== undefined) updateData.last_viewed = lastViewed;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.feedback !== undefined) updateData.feedback = body.feedback;
    if (body.is_archived !== undefined) updateData.is_archived = body.is_archived;
    if (body.archive_reason !== undefined) updateData.archive_reason = body.archive_reason;
    if (archiveDate !== undefined) updateData.archive_date = archiveDate;
    if (restoreDate !== undefined) updateData.restore_date = restoreDate;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Resume record updated successfully',
      data: updatedResume
    });

  } catch (error) {
    console.error('Error updating resume record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update resume record'
      } as ResumeErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete resume record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | ResumeErrorResponse>> {
  try {
    const { id } = await params;
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

    // Check if resume record exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingResume) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Resume record not found'
        } as ResumeErrorResponse,
        { status: 404 }
      );
    }

    await prisma.resume.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Resume record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resume record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete resume record'
      } as ResumeErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
