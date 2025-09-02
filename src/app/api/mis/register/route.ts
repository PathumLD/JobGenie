import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { MisRegistrationResponse, ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Validation schema for MIS registration
const misRegistrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export async function POST(request: NextRequest): Promise<NextResponse<MisRegistrationResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = misRegistrationSchema.safeParse(body);
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

    const {
      first_name,
      last_name,
      email,
      password
    } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if MIS user with this email already exists
    const existingMisUser = await prisma.misUser.findUnique({
      where: { email }
    });

    if (existingMisUser) {
      return NextResponse.json(
        { error: 'MIS user with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and MIS user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user record first - MIS users are active immediately
      const user = await tx.user.create({
        data: {
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role: 'mis',
          status: 'active',
          email_verified: true,
          is_created: true
        }
      });

      // Create MIS user record
      const misUser = await tx.misUser.create({
        data: {
          user_id: user.id,
          first_name,
          last_name,
          email
        }
      });

      return { user, misUser };
    });

    // Remove sensitive information from response
    const { password: _unusedPassword, ...userWithoutPassword } = result.user;

    return NextResponse.json(
      {
        message: 'MIS user registered successfully and is now active.',
        user: userWithoutPassword,
        mis_user: result.misUser
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('MIS registration error:', error);
    
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
