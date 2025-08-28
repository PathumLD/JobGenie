import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface VolunteeringUpdateData {
  role?: string;
  institution?: string;
  cause?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  media_url?: string;
}

interface VolunteeringResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    role: string | null;
    institution: string | null;
    cause: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
    description: string | null;
    media_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface VolunteeringErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific volunteering record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<VolunteeringResponse | VolunteeringErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as VolunteeringErrorResponse,
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
        } as VolunteeringErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const volunteering = await prisma.volunteering.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!volunteering) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Volunteering record not found'
        } as VolunteeringErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteering record retrieved successfully',
      data: volunteering
    });

  } catch (error) {
    console.error('Error fetching volunteering record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch volunteering record'
      } as VolunteeringErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update volunteering record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<VolunteeringResponse | VolunteeringErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as VolunteeringErrorResponse,
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
        } as VolunteeringErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: VolunteeringUpdateData = await request.json();

    // Check if volunteering record exists and belongs to user
    const existingVolunteering = await prisma.volunteering.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingVolunteering) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Volunteering record not found'
        } as VolunteeringErrorResponse,
        { status: 404 }
      );
    }

    // Validate dates if provided
    let startDate: Date | undefined;
    if (body.start_date) {
      startDate = new Date(body.start_date);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid start date format'
          } as VolunteeringErrorResponse,
          { status: 400 }
        );
      }
    }

    let endDate: Date | null | undefined;
    if (body.end_date !== undefined) {
      if (body.end_date === null) {
        endDate = null;
      } else {
        endDate = new Date(body.end_date);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: 'VALIDATION_ERROR',
              message: 'Invalid end date format'
            } as VolunteeringErrorResponse,
            { status: 400 }
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.role !== undefined) updateData.role = body.role;
    if (body.institution !== undefined) updateData.institution = body.institution;
    if (body.cause !== undefined) updateData.cause = body.cause;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (body.is_current !== undefined) updateData.is_current = body.is_current;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.media_url !== undefined) updateData.media_url = body.media_url;

    const updatedVolunteering = await prisma.volunteering.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Volunteering record updated successfully',
      data: updatedVolunteering
    });

  } catch (error) {
    console.error('Error updating volunteering record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update volunteering record'
      } as VolunteeringErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete volunteering record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | VolunteeringErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as VolunteeringErrorResponse,
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
        } as VolunteeringErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Check if volunteering record exists and belongs to user
    const existingVolunteering = await prisma.volunteering.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingVolunteering) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Volunteering record not found'
        } as VolunteeringErrorResponse,
        { status: 404 }
      );
    }

    await prisma.volunteering.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Volunteering record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting volunteering record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete volunteering record'
      } as VolunteeringErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
