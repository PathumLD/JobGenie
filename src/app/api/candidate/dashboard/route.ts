import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

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

    // Check if user is a candidate
    if (decodedToken.role !== 'candidate') {
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
          userId: decodedToken.userId,
          email: decodedToken.email,
          firstName: decodedToken.first_name ?? null,
          lastName: decodedToken.last_name ?? null,
          membershipNo: decodedToken.membership_no ?? null,
          role: decodedToken.role,
          userType: decodedToken.userType
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
