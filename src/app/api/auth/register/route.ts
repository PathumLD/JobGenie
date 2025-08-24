import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { CandidateRegistrationRequest, CandidateRegistrationResponse, ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Validation schema for candidate registration
const candidateRegistrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  nic: z.string().min(1, 'NIC/Passport is required').max(50, 'NIC/Passport must be less than 50 characters'),
  passport: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  date_of_birth: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date format'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters'),
  email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export async function POST(request: NextRequest): Promise<NextResponse<CandidateRegistrationResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = candidateRegistrationSchema.safeParse(body);
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
      nic,
      passport,
      gender,
      date_of_birth,
      address,
      phone,
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get the next membership number
    const lastCandidate = await prisma.candidate.findFirst({
      orderBy: { membership_no: 'desc' }
    });
    const nextMembershipNo = (lastCandidate?.membership_no || 0) + 1;

    // Create user and candidate in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user record
      const user = await tx.user.create({
        data: {
          first_name,
          last_name,
          address,
          phone1: phone,
          email,
          password: hashedPassword,
          role: 'candidate',
          status: 'pending_verification',
          email_verified: false,
          is_created: true
        }
      });

      // Create candidate record
      const candidate = await tx.candidate.create({
        data: {
          user_id: user.id,
          first_name,
          last_name,
          gender,
          date_of_birth: new Date(date_of_birth),
          address,
          phone1: phone,
          nic,
          passport,
          membership_no: nextMembershipNo,
          profile_completion_percentage: 25, // Basic info completed
          completedProfile: false
        }
      });

      return { user, candidate };
    });

    // Remove sensitive information from response
    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json(
      {
        message: 'Candidate registered successfully',
        user: userWithoutPassword,
        candidate: result.candidate
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
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
