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
  employer: {
    company: {
      name: string;
    };
  };
}

interface InterviewNotificationsResponse {
  success: boolean;
  data: InterviewNotification[];
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

    // Verify user is a candidate
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'candidate') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied. Only candidates can view interview notifications.'
        },
        { status: 403 }
      );
    }

    // Fetch all interview notifications for the candidate
    const notifications = await (prisma as any).interviewNotification.findMany({
      where: { candidate_id: userId },
      include: {
        employer: {
          include: {
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Transform the data for response
    const responseData = notifications.map((notification: any) => ({
      id: notification.id,
      employer_id: notification.employer_id,
      candidate_id: notification.candidate_id,
      time_slots: notification.time_slots as Array<{date: string, time: string}>,
      status: notification.status,
      selected_slot: notification.selected_slot as {date: string, time: string} | undefined,
      message: notification.message,
      designation: notification.designation,
      created_at: notification.created_at.toISOString(),
      updated_at: notification.updated_at.toISOString(),
      employer: {
        company: {
          name: notification.employer.company.name
        }
      }
    }));

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching interview notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching interview notifications'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
