import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createTransporter, createVerificationSuccessEmail } from '@/lib/email';
import type { VerifyEmailTokenResponse, ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Validation schema for email code verification
const verifyEmailCodeSchema = z.object({
  token: z.string().min(1, 'Verification code is required')
});

export async function POST(request: NextRequest): Promise<NextResponse<VerifyEmailTokenResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = verifyEmailCodeSchema.safeParse(body);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map(issue => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.map(p => typeof p === 'string' ? p : String(p))
      }));
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        email_verification_token: token,
        verification_token_expires_at: {
          gt: new Date() // Token not expired
        }
      },
      include: {
        candidate: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if user is a candidate
    if (user.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. This account is not registered as a candidate' },
        { status: 403 }
      );
    }

    // Verify the email and update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        status: 'active', // Change status from 'pending_verification' to 'active'
        email_verification_token: null,
        verification_token_expires_at: null
      }
    });

    // Send verification success email
    try {
      const transporter = createTransporter();
      const mailOptions = createVerificationSuccessEmail(
        user.email, 
        user.first_name || undefined
      );

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Success email sending error:', emailError);
      // Don't fail the verification if success email fails
    }

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        email_verified: true,
        user_id: user.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verify email error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
