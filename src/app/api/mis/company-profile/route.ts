import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { 
  CompanyProfile, 
  CompanyProfileStatusResponse,
  ApiErrorResponse 
} from '@/types/company-profile';

const prisma = new PrismaClient();

// Validation schema for query parameters
const querySchema = z.object({
  companyId: z.string().uuid('Invalid company ID format')
});

export async function GET(request: NextRequest): Promise<NextResponse<CompanyProfileStatusResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const validation = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validation.error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path
          }))
        },
        { status: 400 }
      );
    }

    const { companyId } = validation.data;

    // Find company with all profile data
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        industry: true,
        company_size: true,
        company_type: true,
        headquarters_location: true,
        founded_year: true,
        website: true,
        business_registration_no: true,
        business_registration_url: true,
        registered_address: true,
        description: true,
        benefits: true,
        culture_description: true,
        logo_url: true,
        social_media_links: true,
        created_at: true,
        updated_at: true,
        approval_status: true,
        verified_at: true,
        profile_created: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Transform the data to match our CompanyProfile interface
    const companyProfile: CompanyProfile = {
      id: company.id,
      name: company.name,
      email: company.email,
      contact: company.contact,
      industry: company.industry,
      company_size: company.company_size,
      company_type: company.company_type,
      headquarters_location: company.headquarters_location,
      founded_year: company.founded_year,
      website: company.website,
      business_registration_no: company.business_registration_no,
      business_registration_url: company.business_registration_url,
      registered_address: company.registered_address,
      description: company.description,
      benefits: company.benefits,
      culture_description: company.culture_description,
      logo_url: company.logo_url,
      social_media_links: company.social_media_links as any,
      created_at: company.created_at,
      updated_at: company.updated_at,
      approval_status: company.approval_status,
      verified_at: company.verified_at,
      profile_created: company.profile_created
    };

    return NextResponse.json({
      success: true,
      company: companyProfile,
      message: 'Company profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get company profile error:', error);

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
