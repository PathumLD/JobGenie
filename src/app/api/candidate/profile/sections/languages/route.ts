import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, LanguageProficiency } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface LanguageData {
  id?: string;
  language?: string;
  is_native?: boolean;
  oral_proficiency?: LanguageProficiency;
  written_proficiency?: LanguageProficiency;
}

interface LanguageResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    candidate_id: string;
    language: string | null;
    is_native: boolean | null;
    oral_proficiency: LanguageProficiency | null;
    written_proficiency: LanguageProficiency | null;
    created_at: Date | null;
    updated_at: Date | null;
  }>;
}

interface LanguageErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all languages for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<LanguageResponse | LanguageErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as LanguageErrorResponse,
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
        } as LanguageErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const languages = await prisma.language.findMany({
      where: { candidate_id: userId },
      orderBy: { is_native: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Languages retrieved successfully',
      data: languages
    });

  } catch (error) {
    console.error('Error fetching languages:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch languages'
      } as LanguageErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new language
export async function POST(
  request: NextRequest
): Promise<NextResponse<LanguageResponse | LanguageErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as LanguageErrorResponse,
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
        } as LanguageErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: LanguageData = await request.json();

    // Validate required fields
    if (!body.language) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Language name is required'
        } as LanguageErrorResponse,
        { status: 400 }
      );
    }

    // Check if language already exists for this candidate
    const existingLanguage = await prisma.language.findFirst({
      where: { 
        candidate_id: userId,
        language: body.language
      }
    });

    if (existingLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Language already exists for this candidate'
        } as LanguageErrorResponse,
        { status: 400 }
      );
    }

    const language = await prisma.language.create({
      data: {
        candidate_id: userId,
        language: body.language,
        is_native: body.is_native || false,
        oral_proficiency: body.oral_proficiency,
        written_proficiency: body.written_proficiency
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Language added successfully',
      data: [language]
    });

  } catch (error) {
    console.error('Error adding language:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add language'
      } as LanguageErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
