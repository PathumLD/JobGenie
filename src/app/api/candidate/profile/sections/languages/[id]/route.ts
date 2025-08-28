import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, LanguageProficiency } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface LanguageUpdateData {
  language?: string;
  is_native?: boolean;
  oral_proficiency?: LanguageProficiency;
  written_proficiency?: LanguageProficiency;
}

interface LanguageResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    language: string | null;
    is_native: boolean | null;
    oral_proficiency: LanguageProficiency | null;
    written_proficiency: LanguageProficiency | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface LanguageErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific language
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<LanguageResponse | LanguageErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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

    const language = await prisma.language.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Language not found'
        } as LanguageErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Language retrieved successfully',
      data: language
    });

  } catch (error) {
    console.error('Error fetching language:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch language'
      } as LanguageErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update language
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<LanguageResponse | LanguageErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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
    const body: LanguageUpdateData = await request.json();

    // Check if language exists and belongs to user
    const existingLanguage = await prisma.language.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Language not found'
        } as LanguageErrorResponse,
        { status: 404 }
      );
    }

    // Check if new language name already exists for this candidate (if changing language name)
    if (body.language && body.language !== existingLanguage.language) {
      const duplicateLanguage = await prisma.language.findFirst({
        where: { 
          candidate_id: userId,
          language: body.language,
          id: { not: id }
        }
      });

      if (duplicateLanguage) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Language already exists for this candidate'
          } as LanguageErrorResponse,
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.language !== undefined) updateData.language = body.language;
    if (body.is_native !== undefined) updateData.is_native = body.is_native;
    if (body.oral_proficiency !== undefined) updateData.oral_proficiency = body.oral_proficiency;
    if (body.written_proficiency !== undefined) updateData.written_proficiency = body.written_proficiency;

    const updatedLanguage = await prisma.language.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Language updated successfully',
      data: updatedLanguage
    });

  } catch (error) {
    console.error('Error updating language:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update language'
      } as LanguageErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete language
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | LanguageErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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

    // Check if language exists and belongs to user
    const existingLanguage = await prisma.language.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Language not found'
        } as LanguageErrorResponse,
        { status: 404 }
      );
    }

    await prisma.language.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Language deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting language:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete language'
      } as LanguageErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
