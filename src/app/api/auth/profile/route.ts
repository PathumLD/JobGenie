import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { ProfileResponse, ApiErrorResponse } from '@/types/api';
import { extractUserDataFromHeaders } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse<ProfileResponse | ApiErrorResponse>> {
  try {
    // Get user information from middleware headers
    const userData = extractUserDataFromHeaders(request.headers);
    
    if (!userData.userId || !userData.email || !userData.role || !userData.userType) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in again.' },
        { status: 401 }
      );
    }

    // Find user with profile information
    const user = await prisma.user.findUnique({
      where: { id: userData.userId },
      include: {
        candidate: true,
        employer: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine user type and get profile
    let userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
    let profile: typeof user.candidate | typeof user.employer | null = null;

    if (user.role === 'candidate' && user.candidate) {
      userType = 'candidate';
      profile = user.candidate;
    } else if (user.role === 'employer' && user.employer) {
      userType = 'employer';
      profile = user.employer;
    } else if (user.role === 'mis') {
      userType = 'mis';
      // MIS users don't have separate profile tables
    } else if (user.role === 'recruitment_agency') {
      userType = 'recruitment_agency';
      // Recruitment agency users don't have separate profile tables
    } else {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Transform profile data to ensure type compatibility
    let transformedProfile: ProfileResponse['profile'] = undefined;
    
    if (profile) {
      if (userType === 'candidate' && user.candidate) {
        // Transform candidate profile to ensure membership_no is string
        transformedProfile = {
          ...user.candidate,
          membership_no: user.candidate.membership_no ? String(user.candidate.membership_no) : undefined,
          // Ensure all other fields match the expected types
          user_id: user.candidate.user_id,
          saved_job: user.candidate.saved_job || [],
          saved_jobs_metadata: user.candidate.saved_jobs_metadata || {}
        };
      } else if (userType === 'employer' && user.employer) {
        // Transform employer profile
        transformedProfile = {
          company_id: user.employer.company_id,
          job_title: user.employer.job_title,
          department: user.employer.department,
          employer_role: user.employer.role,
          permissions: user.employer.permissions,
          is_primary_contact: user.employer.is_primary_contact,
          phone_extension: user.employer.phone_extension
        };
      }
    }

    return NextResponse.json(
      {
        message: 'Profile retrieved successfully',
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
        profile: transformedProfile,
        user_type: userType
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile retrieval error:', error);
    
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
