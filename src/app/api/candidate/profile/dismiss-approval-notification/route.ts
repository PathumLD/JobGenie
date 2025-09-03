import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can dismiss notifications.' },
        { status: 403 }
      );
    }

    // Update the candidate record to mark notification as dismissed
    await prisma.candidate.update({
      where: { user_id: payload.userId },
      data: { 
        approval_notification_dismissed: true,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Approval notification dismissed successfully'
    });

  } catch (error) {
    console.error('Error dismissing approval notification:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to dismiss approval notification'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
