import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { 
  EmployerApprovalResponse, 
  EmployerApprovalErrorResponse 
} from '@/types/employer-approval';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest
): Promise<NextResponse<EmployerApprovalResponse | EmployerApprovalErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as EmployerApprovalErrorResponse,
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
        } as EmployerApprovalErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        first_name: true,
        last_name: true,
        role: true
      }
    });

    if (!user || user.role !== 'employer') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied. Only employers can access this endpoint.'
        } as EmployerApprovalErrorResponse,
        { status: 403 }
      );
    }

    // Get employer and company data
    const employer = await prisma.employer.findFirst({
      where: { user_id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            contact: true,
            industry: true,
            company_size: true,
            business_registration_no: true,
            business_registration_url: true,
            registered_address: true,
            founded_year: true,
            website: true,
            description: true,
            approval_status: true,
            approval_notification_dismissed: true
          }
        }
      }
    });

    if (!employer || !employer.company) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Company profile not found'
        } as EmployerApprovalErrorResponse,
        { status: 404 }
      );
    }

    const company = employer.company;

    // Required fields for company profile completion
    const requiredFields = [
      { field: 'name', value: company.name, label: 'Company Name' },
      { field: 'email', value: company.email, label: 'Company Email' },
      { field: 'contact', value: company.contact, label: 'Contact Number' },
      { field: 'industry', value: company.industry, label: 'Industry' },
      { field: 'company_size', value: company.company_size, label: 'Company Size' },
      { field: 'business_registration_no', value: company.business_registration_no, label: 'Business Registration Number' },
      { field: 'business_registration_url', value: company.business_registration_url, label: 'Business Registration Document' },
      { field: 'registered_address', value: company.registered_address, label: 'Registered Address' }
    ];

    // Check which fields are missing
    const missingFields: string[] = [];
    requiredFields.forEach(({ value, label }) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(label);
      }
    });

    // Check if company profile is complete based only on required fields
    const isCompanyComplete = missingFields.length === 0;
    const approval_status = company.approval_status || 'pending';

    console.log('🔍 Company approval check for user:', userId);
    console.log('📊 Required fields check:', requiredFields.map(f => ({ field: f.field, value: f.value, label: f.label })));
    console.log('❌ Missing fields:', missingFields);
    console.log('✅ Approval status:', approval_status);

    // Prepare company data for pre-filling form
    const companyData = {
      name: company.name,
      email: company.email,
      contact: company.contact,
      industry: company.industry,
      company_size: company.company_size,
      business_registration_no: company.business_registration_no,
      business_registration_url: company.business_registration_url,
      registered_address: company.registered_address,
      founded_year: company.founded_year,
      website: company.website,
      description: company.description
    };

    // Determine message based on status
    let message = '';
    if (!isCompanyComplete) {
      message = `Company profile incomplete. Missing: ${missingFields.join(', ')}`;
    } else if (approval_status === 'pending') {
      message = 'Company profile complete but pending MIS approval';
    } else if (approval_status === 'rejected') {
      message = 'Company profile complete but rejected by MIS';
    } else {
      message = 'Company profile complete and approved';
    }

    return NextResponse.json({
      success: true,
      isCompanyComplete,
      approval_status,
      missingFields,
      companyData,
      message,
      approval_notification_dismissed: company.approval_notification_dismissed || false
    } as EmployerApprovalResponse);

  } catch (error) {
    console.error('Error checking company approval:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check company approval'
      } as EmployerApprovalErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
