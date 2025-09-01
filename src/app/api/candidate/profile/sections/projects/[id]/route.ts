import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface ProjectUpdateData {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  role?: string;
  responsibilities?: string[];
  technologies?: string[];
  tools?: string[];
  methodologies?: string[];
  is_confidential?: boolean;
  can_share_details?: boolean;
  url?: string;
  repository_url?: string;
  media_urls?: string[];
  skills_gained?: string[];
}

interface ProjectResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    name: string | null;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
    role: string | null;
    responsibilities: string[];
    technologies: string[];
    tools: string[];
    methodologies: string[];
    is_confidential: boolean | null;
    can_share_details: boolean | null;
    url: string | null;
    repository_url: string | null;
    media_urls: string[];
    skills_gained: string[];
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface ProjectErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ProjectResponse | ProjectErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ProjectErrorResponse,
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
        } as ProjectErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const project = await prisma.project.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Project not found'
        } as ProjectErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project retrieved successfully',
      data: project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch project'
      } as ProjectErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ProjectResponse | ProjectErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ProjectErrorResponse,
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
        } as ProjectErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: ProjectUpdateData = await request.json();

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Project not found'
        } as ProjectErrorResponse,
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
          } as ProjectErrorResponse,
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
            } as ProjectErrorResponse,
            { status: 400 }
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (body.is_current !== undefined) updateData.is_current = body.is_current;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities;
    if (body.technologies !== undefined) updateData.technologies = body.technologies;
    if (body.tools !== undefined) updateData.tools = body.tools;
    if (body.methodologies !== undefined) updateData.methodologies = body.methodologies;
    if (body.is_confidential !== undefined) updateData.is_confidential = body.is_confidential;
    if (body.can_share_details !== undefined) updateData.can_share_details = body.can_share_details;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.repository_url !== undefined) updateData.repository_url = body.repository_url;
    if (body.media_urls !== undefined) updateData.media_urls = body.media_urls;
    if (body.skills_gained !== undefined) updateData.skills_gained = body.skills_gained;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update project'
      } as ProjectErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | ProjectErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ProjectErrorResponse,
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
        } as ProjectErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Project not found'
        } as ProjectErrorResponse,
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete project'
      } as ProjectErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
