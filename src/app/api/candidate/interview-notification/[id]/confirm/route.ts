import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

interface ConfirmSlotRequest {
  selected_slot: {
    date: string;
    time: string;
  };
}

interface ConfirmSlotResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
    selected_slot: {
      date: string;
      time: string;
    };
  };
}

interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ConfirmSlotResponse | ApiErrorResponse>> {
  try {
    const { id: notificationId } = await params;
    const body: ConfirmSlotRequest = await request.json();
    const { selected_slot } = body;

    // Validate request body
    if (!selected_slot?.date || !selected_slot?.time) {
      return NextResponse.json(
        {
          success: false,
          error: 'BAD_REQUEST',
          message: 'Selected slot with date and time is required'
        },
        { status: 400 }
      );
    }

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
          message: 'Access denied. Only candidates can confirm interview slots.'
        },
        { status: 403 }
      );
    }

    // Fetch interview notification
    const notification = await prisma.interviewNotification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Interview notification not found'
        },
        { status: 404 }
      );
    }

    // Verify the notification belongs to the authenticated candidate
    if (notification.candidate_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied. This notification does not belong to you.'
        },
        { status: 403 }
      );
    }

    // Check if notification is still pending
    if (notification.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'BAD_REQUEST',
          message: 'This interview notification has already been processed'
        },
        { status: 400 }
      );
    }

    // Validate that the selected slot is one of the available time slots
    const timeSlots = notification.time_slots as Array<{date: string, time: string}>;
    const isValidSlot = timeSlots.some(slot => 
      slot.date === selected_slot.date && slot.time === selected_slot.time
    );

    if (!isValidSlot) {
      return NextResponse.json(
        {
          success: false,
          error: 'BAD_REQUEST',
          message: 'Selected time slot is not available'
        },
        { status: 400 }
      );
    }

    // Update the notification with the selected slot
    const updatedNotification = await prisma.interviewNotification.update({
      where: { id: notificationId },
      data: {
        status: 'accepted',
        selected_slot: selected_slot,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Interview slot confirmed successfully',
      data: {
        id: updatedNotification.id,
        status: updatedNotification.status,
        selected_slot: selected_slot
      }
    });

  } catch (error) {
    console.error('Error confirming interview slot:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while confirming the interview slot'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
