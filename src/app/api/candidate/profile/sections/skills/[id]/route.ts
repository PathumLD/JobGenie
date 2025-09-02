import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface SkillUpdateData {
  skill_source?: string;
  proficiency?: number;
  years_of_experience?: number;
  source_title?: string;
  source_company?: string;
  source_institution?: string;
  source_authority?: string;
  source_type?: string;
  name?: string;
}

interface SkillResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    skill_id: string;
    skill_source: string | null;
    proficiency: number | null;
    years_of_experience: number | null;
    source_title: string | null;
    source_company: string | null;
    source_institution: string | null;
    source_authority: string | null;
    source_type: string | null;
    name: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    skill: {
      id: string;
      name: string;
      category: string | null;
      description: string | null;
    };
  };
}

interface SkillErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific skill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SkillResponse | SkillErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as SkillErrorResponse,
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
        } as SkillErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const skill = await prisma.candidateSkill.findFirst({
      where: { 
        id,
        candidate_id: userId 
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        }
      }
    });

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Skill not found'
        } as SkillErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Skill retrieved successfully',
      data: skill
    });

  } catch (error) {
    console.error('Error fetching skill:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch skill'
      } as SkillErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update skill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SkillResponse | SkillErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as SkillErrorResponse,
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
        } as SkillErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: SkillUpdateData = await request.json();

    // Check if skill exists and belongs to user
    const existingSkill = await prisma.candidateSkill.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Skill not found'
        } as SkillErrorResponse,
        { status: 404 }
      );
    }

    // Validate proficiency range
    if (body.proficiency !== undefined && (body.proficiency < 0 || body.proficiency > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Proficiency must be between 0 and 100'
        } as SkillErrorResponse,
        { status: 400 }
      );
    }

    // Validate years of experience
    if (body.years_of_experience !== undefined && body.years_of_experience < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Years of experience cannot be negative'
        } as SkillErrorResponse,
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.skill_source !== undefined) updateData.skill_source = body.skill_source;
    if (body.proficiency !== undefined) updateData.proficiency = body.proficiency;
    if (body.years_of_experience !== undefined) updateData.years_of_experience = body.years_of_experience;
    if (body.source_title !== undefined) updateData.source_title = body.source_title;
    if (body.source_company !== undefined) updateData.source_company = body.source_company;
    if (body.source_institution !== undefined) updateData.source_institution = body.source_institution;
    if (body.source_authority !== undefined) updateData.source_authority = body.source_authority;
    if (body.source_type !== undefined) updateData.source_type = body.source_type;
    if (body.name !== undefined) updateData.name = body.name;

    const updatedSkill = await prisma.candidateSkill.update({
      where: { id },
      data: updateData,
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Skill updated successfully',
      data: updatedSkill
    });

  } catch (error) {
    console.error('Error updating skill:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update skill'
      } as SkillErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | SkillErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as SkillErrorResponse,
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
        } as SkillErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Check if skill exists and belongs to user
    const existingSkill = await prisma.candidateSkill.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Skill not found'
        } as SkillErrorResponse,
        { status: 404 }
      );
    }

    await prisma.candidateSkill.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Skill deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting skill:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete skill'
      } as SkillErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
