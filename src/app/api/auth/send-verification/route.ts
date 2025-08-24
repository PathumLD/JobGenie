import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createTransporter, createVerificationEmail } from '@/lib/email';
import type { EmailVerificationResponse, ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Validation schema for email verification request
const emailVerificationSchema = z.object({
  email: z.string().email('Invalid email format')
});

export async function POST(request: NextRequest): Promise<NextResponse<EmailVerificationResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = emailVerificationSchema.safeParse(body);
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

    const { email } = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidate: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this email address' },
        { status: 404 }
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

    // Generate 6-digit verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verification_token: verificationToken,
        verification_token_expires_at: tokenExpiry
      }
    });

    // Send verification email
    try {
      const transporter = createTransporter();
      const mailOptions = createVerificationEmail(
        email, 
        verificationToken, 
        user.first_name || undefined
      );

      await transporter.sendMail(mailOptions);

      return NextResponse.json(
        {
          message: 'Verification email sent successfully',
          email: email,
          verification_sent: true
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Remove the verification token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email_verification_token: null,
          verification_token_expires_at: null
        }
      });

      return NextResponse.json(
        { 
          error: 'Failed to send verification email. Please try again later.',
          message: 'Email service temporarily unavailable'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send verification error:', error);
    
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
