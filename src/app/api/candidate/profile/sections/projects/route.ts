import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface ProjectData {
  id?: string;
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
  data?: Array<{
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
  }>;
}

interface ProjectErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all projects for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<ProjectResponse | ProjectErrorResponse>> {
  try {
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

    const projects = await prisma.project.findMany({
      where: { candidate_id: userId },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Projects retrieved successfully',
      data: projects
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch projects'
      } as ProjectErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new project
export async function POST(
  request: NextRequest
): Promise<NextResponse<ProjectResponse | ProjectErrorResponse>> {
  try {
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
    const body: ProjectData = await request.json();

    // Validate required fields
    if (!body.name || !body.start_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Project name and start date are required'
        } as ProjectErrorResponse,
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.start_date);
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

    let endDate: Date | null = null;
    if (body.end_date) {
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

    // Validate arrays
    const responsibilities = body.responsibilities || [];
    const technologies = body.technologies || [];
    const tools = body.tools || [];
    const methodologies = body.methodologies || [];
    const mediaUrls = body.media_urls || [];
    const skillsGained = body.skills_gained || [];

    const project = await prisma.project.create({
      data: {
        candidate_id: userId,
        name: body.name,
        description: body.description,
        start_date: startDate,
        end_date: endDate,
        is_current: body.is_current || false,
        role: body.role,
        responsibilities,
        technologies,
        tools,
        methodologies,
        is_confidential: body.is_confidential || false,
        can_share_details: body.can_share_details || true,
        url: body.url,
        repository_url: body.repository_url,
        media_urls: mediaUrls,
        skills_gained: skillsGained
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: [project]
    });

  } catch (error) {
    console.error('Error creating project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create project'
      } as ProjectErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
