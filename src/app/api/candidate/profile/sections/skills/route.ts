import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface SkillData {
  id?: string;
  skill_id?: string;
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
  data?: Array<{
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
  }>;
}

interface SkillErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all skills for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<SkillResponse | SkillErrorResponse>> {
  try {
    const token = getTokenFromCookies(request);
    
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

    const skills = await prisma.candidateSkill.findMany({
      where: { candidate_id: userId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        }
      },
      orderBy: { years_of_experience: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Skills retrieved successfully',
      data: skills
    });

  } catch (error) {
    console.error('Error fetching skills:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch skills'
      } as SkillErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new skill for candidate
export async function POST(
  request: NextRequest
): Promise<NextResponse<SkillResponse | SkillErrorResponse>> {
  try {
    const token = getTokenFromCookies(request);
    
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
    const body: SkillData = await request.json();

    // Validate required fields
    if (!body.skill_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Skill ID is required'
        } as SkillErrorResponse,
        { status: 400 }
      );
    }

    // Check if skill exists
    const skillExists = await prisma.skill.findUnique({
      where: { id: body.skill_id }
    });

    if (!skillExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Skill not found'
        } as SkillErrorResponse,
        { status: 400 }
        );
    }

    // Check if candidate already has this skill
    const existingSkill = await prisma.candidateSkill.findUnique({
      where: {
        candidate_id_skill_id: {
          candidate_id: userId,
          skill_id: body.skill_id
        }
      }
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Skill already exists for this candidate'
        } as SkillErrorResponse,
        { status: 400 }
      );
    }

    // Validate proficiency range
    if (body.proficiency && (body.proficiency < 0 || body.proficiency > 100)) {
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
    if (body.years_of_experience && body.years_of_experience < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Years of experience cannot be negative'
        } as SkillErrorResponse,
        { status: 400 }
      );
    }

    const candidateSkill = await prisma.candidateSkill.create({
      data: {
        candidate_id: userId,
        skill_id: body.skill_id,
        skill_source: body.skill_source,
        proficiency: body.proficiency,
        years_of_experience: body.years_of_experience,
        source_title: body.source_title,
        source_company: body.source_company,
        source_institution: body.source_institution,
        source_authority: body.source_authority,
        source_type: body.source_type,
        name: body.name
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

    return NextResponse.json({
      success: true,
      message: 'Skill added successfully',
      data: [candidateSkill]
    });

  } catch (error) {
    console.error('Error adding skill:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add skill'
      } as SkillErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
