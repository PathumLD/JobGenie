import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

interface InterviewNotification {
  id: string;
  employer_id: string;
  candidate_id: string;
  time_slots: Array<{
    date: string;
    time: string;
  }>;
  status: string;
  selected_slot?: {
    date: string;
    time: string;
  };
  message?: string;
  designation?: string;
  created_at: string;
  updated_at: string;
  candidate: {
    user: {
      first_name: string | null;
      last_name: string | null;
      email: string;
    };
  };
}

interface InterviewNotificationsResponse {
  success: boolean;
  notifications: InterviewNotification[];
  total: number;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<InterviewNotificationsResponse | ApiErrorResponse>> {
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
          message: 'Access denied. Only employers can view interview notifications.'
        },
        { status: 403 }
      );
    }

    // Get employer record
    const employer = await prisma.employer.findUnique({
      where: { user_id: userId },
      select: { id: true }
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      employer_id: employer.id
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    // Fetch interview notifications
    const [notifications, total] = await Promise.all([
      (prisma as any).interviewNotification.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      (prisma as any).interviewNotification.count({
        where: whereClause
      })
    ]);

    // Fetch candidate information for each notification
    const notificationsWithCandidates = await Promise.all(
      notifications.map(async (notification: any) => {
        const candidate = await prisma.candidate.findUnique({
          where: { user_id: notification.candidate_id },
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        });

        return {
          ...notification,
          candidate: candidate ?? {
            user: {
              first_name: null,
              last_name: null,
              email: 'Unknown'
            }
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      notifications: notificationsWithCandidates,
      total,
      message: `Found ${notificationsWithCandidates.length} interview notifications`
    });

  } catch (error) {
    console.error('Error fetching employer interview notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch interview notifications'
      },
      { status: 500 }
    );
  }
}
