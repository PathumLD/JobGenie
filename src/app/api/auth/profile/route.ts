import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { ProfileResponse, ApiErrorResponse } from '@/types/api';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse<ProfileResponse | ApiErrorResponse>> {
  try {
    // Extract and verify JWT token
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Find user with profile information
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
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

    // Prepare response data
    const responseData: any = {
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
    };

    // Add company information for employers
    if (userType === 'employer' && user.employer?.company) {
      responseData.company = {
        id: user.employer.company.id,
        name: user.employer.company.name,
        industry: user.employer.company.industry,
        approval_status: user.employer.company.approval_status
      };
    }

    return NextResponse.json(responseData, { status: 200 });

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

export async function PUT(request: NextRequest): Promise<NextResponse<ProfileResponse | ApiErrorResponse>> {
  try {
    // Extract and verify JWT token
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: decodedToken.userId },
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        address: body.address || null,
        phone1: body.phone1 || null,
        phone2: body.phone2 || null
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        address: updatedUser.address,
        phone1: updatedUser.phone1,
        phone2: updatedUser.phone2,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        email_verified: updatedUser.email_verified,
        last_login_at: updatedUser.last_login_at,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        is_created: updatedUser.is_created
      },
      user_type: updatedUser.role as 'candidate' | 'employer' | 'mis' | 'recruitment_agency'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
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
