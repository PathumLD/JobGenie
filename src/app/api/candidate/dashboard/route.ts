import { NextRequest, NextResponse } from 'next/server';
import { extractUserDataFromHeaders } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

interface DashboardResponse {
  message: string;
  userData: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    membershipNo: string | null;
    role: string | null;
    userType: string | null;
  };
  dashboardData: {
    totalApplications: number;
    savedJobs: number;
    profileCompletion: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<DashboardResponse | ApiErrorResponse>> {
  try {
    // Extract user data from JWT token (set by middleware)
    const userData = extractUserDataFromHeaders(request.headers);
    
    if (!userData.userId || !userData.email || !userData.role || !userData.userType) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if user is a candidate
    if (userData.userType !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. This endpoint is only for candidates.' },
        { status: 403 }
      );
    }

    // Mock dashboard data (in real app, you'd fetch this from database)
    const dashboardData = {
      totalApplications: 5,
      savedJobs: 12,
      profileCompletion: 75
    };

    return NextResponse.json(
      {
        message: 'Dashboard data retrieved successfully',
        userData: {
          userId: userData.userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          membershipNo: userData.membershipNo,
          role: userData.role,
          userType: userData.userType
        },
        dashboardData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Dashboard error:', error);
    
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
  }
}
