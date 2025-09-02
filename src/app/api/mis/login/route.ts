import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { MisLoginResponse, ApiErrorResponse } from '@/types/api';
import { generateAccessToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Validation schema for MIS user login
const misLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest): Promise<NextResponse<MisLoginResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = misLoginSchema.safeParse(body);
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

    const { email, password } = validationResult.data;

    // Find user by email with MIS user profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        mis_user: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is an MIS user
    if (user.role !== 'mis') {
      return NextResponse.json(
        { error: 'This endpoint is only for MIS users' },
        { status: 403 }
      );
    }

    // Check if MIS user profile exists
    if (!user.mis_user) {
      return NextResponse.json(
        { error: 'MIS user profile not found. Please contact support' },
        { status: 404 }
      );
    }

    // Check if user has a password (for email/password authentication)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid authentication method. This account uses social login' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact support' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    // Generate JWT tokens
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: 'mis' as const,
      userType: 'mis' as const
    };

    const accessToken = generateAccessToken(jwtPayload);

    // Create response
    const response = NextResponse.json(
      {
        message: 'MIS user login successful',
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          address: user.address,
          phone1: user.phone1,
          phone2: user.phone2,
          email: user.email,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
          is_created: user.is_created
        },
        mis_user: {
          user_id: user.mis_user.user_id,
          first_name: user.mis_user.first_name,
          last_name: user.mis_user.last_name,
          email: user.mis_user.email,
          created_at: user.mis_user.created_at,
          updated_at: user.mis_user.updated_at
        },
        user_type: 'mis',
        access_token: accessToken
      },
      { status: 200 }
    );

    return response as NextResponse<MisLoginResponse | ApiErrorResponse>;

  } catch (error) {
    console.error('MIS login error:', error);
    
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
