import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; message: string } | ApiErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          error: 'Authentication token required'
        } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          error: 'Invalid authentication token'
        } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Get employer and company data
    const employer = await prisma.employer.findFirst({
      where: { user_id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            approval_status: true
          }
        }
      }
    });

    if (!employer || !employer.company) {
      return NextResponse.json(
        {
          error: 'Company profile not found'
        } as ApiErrorResponse,
        { status: 404 }
      );
    }

    // Only allow dismissing if company is approved
    if (employer.company.approval_status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Can only dismiss notification for approved companies'
        } as ApiErrorResponse,
        { status: 403 }
      );
    }

    // Update the approval notification dismissed flag
    await prisma.company.update({
      where: { id: employer.company.id },
      data: {
        approval_notification_dismissed: true,
        updated_at: new Date()
      }
    });

    console.log('✅ Approval notification dismissed for company:', employer.company.name);

    return NextResponse.json({
      success: true,
      message: 'Approval notification dismissed successfully'
    });

  } catch (error) {
    console.error('Error dismissing approval notification:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to dismiss approval notification'
      } as ApiErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
