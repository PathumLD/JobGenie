import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { UserLoginResponse, ApiErrorResponse } from '@/types/api';
import { generateAccessToken, generateRefreshToken, setJWTCookies } from '@/lib/jwt';

const prisma = new PrismaClient();

// Validation schema for employer login
const employerLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest): Promise<NextResponse<UserLoginResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = employerLoginSchema.safeParse(body);
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

    // Find user by email with employer profile and company details
    const user = await prisma.user.findUnique({
      where: { 
        email,
        role: 'employer' // Ensure only employers can login through this endpoint
      },
      include: {
        employer: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
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
        { error: 'Account is not active. Please verify your email or contact support' },
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

    // Ensure employer profile exists
    if (!user.employer) {
      return NextResponse.json(
        { error: 'Employer profile not found. Please contact support' },
        { status: 404 }
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
      role: 'employer' as const,
      userType: 'employer' as const
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Create response with employer-specific data
    const response = NextResponse.json(
      {
        message: 'Employer login successful',
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
        profile: {
          user_id: user.employer.user_id,
          company_id: user.employer.company_id,
          first_name: user.employer.first_name,
          last_name: user.employer.last_name,
          address: user.employer.address,
          phone: user.employer.phone,
          job_title: user.employer.job_title,
          department: user.employer.department,
          role: user.employer.role,
          permissions: user.employer.permissions,
          is_verified: user.employer.is_verified,
          is_primary_contact: user.employer.is_primary_contact,
          phone_extension: user.employer.phone_extension,
          created_at: user.employer.created_at,
          updated_at: user.employer.updated_at
        },
        user_type: 'employer' as const
      },
      { status: 200 }
    );

    // Set JWT cookies and return response
    const responseWithCookies = setJWTCookies(response, accessToken, refreshToken);
    
    return responseWithCookies as NextResponse<UserLoginResponse | ApiErrorResponse>;

  } catch (error) {
    console.error('Employer login error:', error);
    
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
