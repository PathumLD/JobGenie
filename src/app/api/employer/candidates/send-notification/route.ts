import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { sendEmail, createInterviewNotificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

interface TimeSlot {
  date: string;
  time: string; // Format: "09.00 - 09.30"
}

interface RequestBody {
  candidate_id: string;
  time_slots: TimeSlot[];
  designation_name?: string; // Optional designation name for email and database storage
}

function validateTimeSlots(time_slots: TimeSlot[]): string | null {
  if (time_slots.length === 0) {
    return 'At least one time slot is required';
  }

  if (time_slots.length > 3) {
    return 'Maximum 3 time slots allowed';
  }

  for (const slot of time_slots) {
    if (!slot.date || !slot.time) {
      return 'Each time slot must have both date and time';
    }

    // Parse time format "09.00 - 09.30" to get start time
    const startTime = slot.time.split(' - ')[0].replace('.', ':');
    const slotDate = new Date(`${slot.date}T${startTime}`);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (slotDate < tomorrow) {
      return 'All time slots must be scheduled for tomorrow or later';
    }
  }

  return null;
}

function validateAuthToken(request: NextRequest): { token: string; employerId: string } | { error: string } {
  const token = getTokenFromHeaders(request);
  
  if (!token) {
    return { error: 'Authorization token required' };
  }

  try {
    const decodedToken = verifyToken(token) as any;
    
    if (!decodedToken) {
      return { error: 'Invalid token' };
    }

    const employerId = decodedToken.userId || decodedToken.user_id;
    
    if (!employerId) {
      return { error: 'Invalid token payload' };
    }

    return { token, employerId };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { error: 'Invalid or expired token' };
  }
}

async function verifyEmployer(employerId: string) {
  const employer = await prisma.employer.findFirst({
    where: { user_id: employerId },
    include: { 
      user: {
        select: {
          email: true,
          first_name: true,
          last_name: true
        }
      }
    }
  });

  if (!employer) {
    return { error: 'Employer not found' };
  }

  // Check if company is approved
  const company = await prisma.company.findUnique({
    where: { id: employer.company_id },
    select: { approval_status: true }
  });

  if (!company || company.approval_status !== 'approved') {
    return { error: 'Employer account not approved' };
  }

  return { employer };
}

async function verifyCandidate(candidateId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { user_id: candidateId },
    select: { 
      user_id: true, 
      first_name: true, 
      last_name: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });

  if (!candidate) {
    return { error: 'Candidate not found' };
  }

  return { candidate: { ...candidate, email: candidate.user.email } };
}

async function createNotification(employerId: string, candidateId: string, timeSlots: TimeSlot[], designation?: string) {
  const notification = await (prisma as any).interviewNotification.create({
    data: {
      employer_id: employerId,
      candidate_id: candidateId,
      time_slots: timeSlots,
      status: 'pending',
      designation: designation
    }
  });

  return { notification };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { candidate_id, time_slots, designation_name } = body;

    // Validate required fields
    if (!candidate_id || !time_slots) {
      return NextResponse.json(
        { success: false, message: 'Candidate ID and time slots are required' },
        { status: 400 }
      );
    }

    // Validate time slots
    const timeSlotError = validateTimeSlots(time_slots);
    if (timeSlotError) {
      return NextResponse.json(
        { success: false, message: timeSlotError },
        { status: 400 }
      );
    }

    // Validate auth token
    const authResult = validateAuthToken(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    const { employerId } = authResult;

    // Verify employer exists and is active
    const employerResult = await verifyEmployer(employerId);
    if ('error' in employerResult) {
      return NextResponse.json(
        { success: false, message: employerResult.error },
        { status: employerResult.error === 'Employer not found' ? 404 : 403 }
      );
    }

    const { employer } = employerResult;

    // Verify candidate exists
    const candidateResult = await verifyCandidate(candidate_id);
    if ('error' in candidateResult) {
      return NextResponse.json(
        { success: false, message: candidateResult.error },
        { status: 404 }
      );
    }

    const { candidate } = candidateResult;

    // Create notification record
    const notificationResult = await createNotification((employer as any).id, candidate_id, time_slots, designation_name);
    if ('error' in notificationResult) {
      return NextResponse.json(
        { success: false, message: notificationResult.error },
        { status: 500 }
      );
    }

    const { notification } = notificationResult;

    // Get company name for email
    const company = await prisma.company.findUnique({
      where: { id: (employer as any).company_id },
      select: { name: true }
    });

    // Use provided designation name or default
    const designationName = designation_name || 'Position';
    
    console.log('API received designation_name:', designation_name);
    console.log('Using designationName:', designationName);

    // Send email notification to candidate
    try {
      const emailData = createInterviewNotificationEmail(
        candidate.email,
        candidate.first_name || 'Candidate',
        company?.name || 'Company',
        designationName,
        time_slots,
        notification.id
      );

      const emailSent = await sendEmail(emailData);
      
      if (emailSent) {
        console.log('Interview notification email sent successfully to:', candidate.email);
      } else {
        console.error('Failed to send interview notification email to:', candidate.email);
      }
    } catch (emailError) {
      console.error('Error sending interview notification email:', emailError);
      // Don't fail the entire request if email fails
    }

    console.log('Interview notification created:', {
      notificationId: notification.id,
      employerId: (employer as any).id,
      candidateId: candidate_id,
      timeSlots: time_slots,
      candidateEmail: candidate.email
    });

    return NextResponse.json({
      success: true,
      message: `Interview notification sent to ${candidate.first_name || 'candidate'} with ${time_slots.length} time slot${time_slots.length > 1 ? 's' : ''}`,
      notification_id: notification.id
    });

  } catch (error) {
    console.error('Error in send-notification API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}