import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

interface NotificationCounts {
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
  total: number;
}

interface NotificationCountResponse {
  success: boolean;
  counts: NotificationCounts;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<NotificationCountResponse | ApiErrorResponse>> {
  try {
    // Authenticate user
    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        },
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
        },
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Verify user is an employer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'employer') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied. Only employers can view notification counts.'
        },
        { status: 403 }
      );
    }

    // Get employer record
    const employer = await prisma.employer.findUnique({
      where: { user_id: userId }
    });

    if (!employer) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Employer profile not found'
        },
        { status: 404 }
      );
    }

    // Get notification counts by status
    const [pending, accepted, rejected, expired, total] = await Promise.all([
      (prisma as any).interviewNotification.count({
        where: { employer_id: (employer as any).id, status: 'pending' }
      }),
      (prisma as any).interviewNotification.count({
        where: { employer_id: (employer as any).id, status: 'accepted' }
      }),
      (prisma as any).interviewNotification.count({
        where: { employer_id: (employer as any).id, status: 'rejected' }
      }),
      (prisma as any).interviewNotification.count({
        where: { employer_id: (employer as any).id, status: 'expired' }
      }),
      (prisma as any).interviewNotification.count({
        where: { employer_id: (employer as any).id }
      })
    ]);

    const counts: NotificationCounts = {
      pending,
      accepted,
      rejected,
      expired,
      total
    };

    return NextResponse.json({
      success: true,
      counts,
      message: 'Notification counts retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching notification counts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notification counts'
      },
      { status: 500 }
    );
  }
}
