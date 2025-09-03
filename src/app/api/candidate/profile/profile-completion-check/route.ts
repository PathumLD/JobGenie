import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { 
  ProfileApprovalResponse, 
  ProfileApprovalErrorResponse 
} from '@/types/profile-approval';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ProfileApprovalResponse | ProfileApprovalErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as ProfileApprovalErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as ProfileApprovalErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Get user data for email and address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        first_name: true,
        last_name: true,
        address: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'User not found'
        } as ProfileApprovalErrorResponse,
        { status: 404 }
      );
    }

    // Get candidate profile data including approval status
    const candidate = await prisma.candidate.findFirst({
      where: { user_id: userId },
      select: {
        first_name: true,
        last_name: true,
        nic: true,
        gender: true,
        date_of_birth: true,
        address: true,
        phone1: true,
        approval_status: true
      }
    });

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Candidate profile not found',
        } as ProfileApprovalErrorResponse,
        { status: 404 }
      );
    }

    // Required fields for profile completion
    const requiredFields = [
      { field: 'first_name', value: candidate?.first_name || user.first_name, label: 'First Name' },
      { field: 'last_name', value: candidate?.last_name || user.last_name, label: 'Last Name' },
      { field: 'email', value: user.email, label: 'Email' },
      { field: 'nic', value: candidate?.nic, label: 'NIC' },
      { field: 'gender', value: candidate?.gender, label: 'Gender' },
      { field: 'date_of_birth', value: candidate?.date_of_birth, label: 'Date of Birth' },
      { field: 'address', value: candidate?.address, label: 'Address' },
      { field: 'phone', value: candidate?.phone1, label: 'Phone Number' }
    ];

    // Check which fields are missing
    const missingFields: string[] = [];
    requiredFields.forEach(({ value, label }) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(label);
      }
    });

    // Check if profile is complete based only on required fields
    const isProfileComplete = missingFields.length === 0;
    const approval_status = candidate.approval_status || 'pending';

    console.log('🔍 Profile completion check for user:', userId);
    console.log('📊 Required fields check:', requiredFields.map(f => ({ field: f.field, value: f.value, label: f.label })));
    console.log('❌ Missing fields:', missingFields);
    console.log('✅ Approval status:', approval_status);

    // Prepare candidate data for pre-filling form
    const candidateData = {
      first_name: candidate?.first_name || user.first_name,
      last_name: candidate?.last_name || user.last_name,
      email: user.email,
      nic: candidate?.nic ?? null,
      gender: candidate?.gender ?? null,
      date_of_birth: candidate?.date_of_birth ?? null,
      address: candidate?.address ?? null,
      phone: candidate?.phone1 ?? null
    };

    // Determine message based on status
    let message = '';
    if (!isProfileComplete) {
      message = `Profile incomplete. Missing: ${missingFields.join(', ')}`;
    } else if (approval_status === 'pending') {
      message = 'Profile complete but pending MIS approval';
    } else if (approval_status === 'rejected') {
      message = 'Profile complete but rejected by MIS';
    } else {
      message = 'Profile complete and approved';
    }

    return NextResponse.json({
      success: true,
      isProfileComplete,
      approval_status,
      missingFields,
      candidateData,
      message
    } as ProfileApprovalResponse);

  } catch (error) {
    console.error('Error checking profile completion:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check profile completion'
      } as ProfileApprovalErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}