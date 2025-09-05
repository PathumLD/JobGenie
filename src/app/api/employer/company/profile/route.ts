import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, type Company, type CompanySize, type CompanyType, type ApprovalStatus } from '@prisma/client';
import { z } from 'zod';
import type { 
  CompanyProfileResponse, 
  CompanyProfileErrorResponse,
  CompanyProfileStatusResponse,
  CompanyProfileUpdateResponse,
  CompanyProfile
} from '@/types/company-profile';
import { verifyToken } from '@/lib/jwt';
import { uploadCompanyLogo } from '@/lib/supabase';

const prisma = new PrismaClient();

// Helper function to convert Prisma Company to CompanyProfile
function convertToCompanyProfile(company: Company): CompanyProfile {
  // Ensure social_media_links is properly typed
  let socialMediaLinks: Record<string, string> | null = null;
  if (company.social_media_links && typeof company.social_media_links === 'object' && !Array.isArray(company.social_media_links)) {
    socialMediaLinks = company.social_media_links as Record<string, string>;
  }

  return {
    id: company.id,
    name: company.name,
    email: company.email,
    contact: company.contact,
    slug: company.slug,
    description: company.description,
    website: company.website,
    logo_url: company.logo_url,
    industry: company.industry,
    company_size: company.company_size,
    headquarters_location: company.headquarters_location,
    founded_year: company.founded_year,
    company_type: company.company_type,
    benefits: company.benefits,
    culture_description: company.culture_description,
    social_media_links: socialMediaLinks,
    approval_status: company.approval_status,
    verified_at: company.verified_at,
    created_at: company.created_at,
    updated_at: company.updated_at,
    business_registration_no: company.business_registration_no,
    business_registration_url: company.business_registration_url,
    registered_address: company.registered_address,
    profile_created: company.profile_created,
    approval_notification_dismissed: company.approval_notification_dismissed
  };
}

// Validation schema for company profile form data
const companyProfileSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  contact: z.string().min(1, 'Contact number is required').max(20, 'Contact number must be less than 20 characters'),
  description: z.string().min(1, 'Company description is required').max(2000, 'Description must be less than 2000 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  headquarters_location: z.string().min(1, 'Headquarters location is required').max(200, 'Location must be less than 200 characters'),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  company_size: z.enum(['startup', 'one_to_ten', 'eleven_to_fifty', 'fifty_one_to_two_hundred', 'two_hundred_one_to_five_hundred', 'five_hundred_one_to_one_thousand', 'one_thousand_plus']),
  company_type: z.enum(['startup', 'corporation', 'agency', 'non_profit', 'government']),
  slug: z.string().min(1, 'Company slug is required').max(200, 'Slug must be less than 200 characters'),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must be less than 100 characters'),
  logo: z.custom<File>((val) => val && typeof val === 'object' && 'name' in val && 'size' in val && 'type' in val, { message: 'Invalid logo file' }).optional(),
  social_media_links: z.object({
    linkedin: z.string().url().optional().or(z.literal(''))
  }).optional()
});

const companyProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  contact: z.string().min(1, 'Contact number is required').max(20, 'Contact number must be less than 20 characters'),
  description: z.string().min(1, 'Company description is required').max(2000, 'Description must be less than 2000 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  headquarters_location: z.string().min(1, 'Headquarters location is required').max(200, 'Location must be less than 200 characters'),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  company_size: z.enum(['startup', 'one_to_ten', 'eleven_to_fifty', 'fifty_one_to_two_hundred', 'two_hundred_one_to_five_hundred', 'five_hundred_one_to_one_thousand', 'one_thousand_plus']),
  company_type: z.enum(['startup', 'corporation', 'agency', 'non_profit', 'government']),
  slug: z.string().min(1, 'Company slug is required').max(200, 'Slug must be less than 200 characters'),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must be less than 100 characters'),
  social_media_links: z.object({
    linkedin: z.string().url().optional().or(z.literal(''))
  }).optional()
});

// GET - Check company profile status
export async function GET(request: NextRequest): Promise<NextResponse<CompanyProfileStatusResponse | CompanyProfileErrorResponse>> {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded?.role !== 'employer') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find employer and company
    const employer = await prisma.employer.findUnique({
      where: { user_id: decoded.userId },
      include: {
        company: true
      }
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    const companyProfile = convertToCompanyProfile(employer.company);

    return NextResponse.json({
      success: true,
      profile_created: companyProfile.profile_created,
      company: companyProfile,
      message: companyProfile.profile_created ? 'Company profile exists' : 'Company profile not created'
    });

  } catch (error) {
    console.error('Get company profile status error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create company profile
export async function POST(request: NextRequest): Promise<NextResponse<CompanyProfileResponse | CompanyProfileErrorResponse>> {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded?.role !== 'employer') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract fields from form data
    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const description = formData.get('description') as string;
    const website = formData.get('website') as string;
    const headquarters_location = formData.get('headquarters_location') as string;
    const founded_year = formData.get('founded_year') ? parseInt(formData.get('founded_year') as string) : null;
    const company_size = formData.get('company_size') as string;
    const company_type = formData.get('company_type') as string;
    const slug = formData.get('slug') as string;
    const industry = formData.get('industry') as string;
    const linkedin = formData.get('linkedin') as string;

    // Validate the data
    const validationResult = companyProfileSchema.safeParse({
      name,
      contact,
      description,
      website,
      headquarters_location,
      founded_year,
      company_size,
      company_type,
      slug,
      industry,
      social_media_links: {
        linkedin
      }
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          details: validationResult.error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path.map(p => typeof p === 'string' ? p : String(p))
          }))
        },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;

    // Find employer and company
    const employer = await prisma.employer.findUnique({
      where: { user_id: decoded.userId },
      include: {
        company: true
      }
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    // Check if profile already exists
    if (employer.company.profile_created) {
      return NextResponse.json(
        { success: false, error: 'Company profile already exists' },
        { status: 409 }
      );
    }

    // Upload logo if provided
    let logoUrl = null;
    if (profileData.logo && profileData.logo.size > 0) {
      logoUrl = await uploadCompanyLogo(profileData.logo, employer.company.id);
    }

    // Update company profile
    const updatedCompany = await prisma.company.update({
      where: { id: employer.company.id },
      data: {
        name: profileData.name,
        contact: profileData.contact,
        description: profileData.description,
        website: profileData.website || null,
        headquarters_location: profileData.headquarters_location,
        founded_year: profileData.founded_year,
        company_size: profileData.company_size,
        company_type: profileData.company_type,
        slug: profileData.slug,
        industry: profileData.industry,
        logo_url: logoUrl,
        social_media_links: profileData.social_media_links || undefined,
        updated_at: new Date()
      }
    });

    const companyProfile = convertToCompanyProfile(updatedCompany);

    return NextResponse.json({
      success: true,
      company: companyProfile,
      message: 'Company profile created successfully'
    });

  } catch (error) {
    console.error('Create company profile error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update company profile
export async function PUT(request: NextRequest): Promise<NextResponse<CompanyProfileUpdateResponse | CompanyProfileErrorResponse>> {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded?.role !== 'employer') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract fields from form data
    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const description = formData.get('description') as string;
    const website = formData.get('website') as string;
    const headquarters_location = formData.get('headquarters_location') as string;
    const founded_year = formData.get('founded_year') ? parseInt(formData.get('founded_year') as string) : null;
    const company_size = formData.get('company_size') as string;
    const company_type = formData.get('company_type') as string;
    const slug = formData.get('slug') as string;
    const industry = formData.get('industry') as string;
    const linkedin = formData.get('linkedin') as string;

    // Validate the data
    const validationResult = companyProfileUpdateSchema.safeParse({
      name,
      contact,
      description,
      website,
      headquarters_location,
      founded_year,
      company_size,
      company_type,
      slug,
      industry,
      social_media_links: {
        linkedin
      }
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          details: validationResult.error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path.map(p => typeof p === 'string' ? p : String(p))
          }))
        },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;

    // Find employer and company
    const employer = await prisma.employer.findUnique({
      where: { user_id: decoded.userId },
      include: {
        company: true
      }
    });

    if (!employer) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }


    // Update company profile
    const updatedCompany = await prisma.company.update({
      where: { id: employer.company.id },
      data: {
        name: profileData.name,
        contact: profileData.contact,
        description: profileData.description,
        website: profileData.website || null,
        headquarters_location: profileData.headquarters_location,
        founded_year: profileData.founded_year,
        company_size: profileData.company_size,
        company_type: profileData.company_type,
        slug: profileData.slug,
        industry: profileData.industry,
        social_media_links: profileData.social_media_links || undefined,
        updated_at: new Date()
      }
    });

    const companyProfile = convertToCompanyProfile(updatedCompany);

    return NextResponse.json({
      success: true,
      company: companyProfile,
      message: 'Company profile updated successfully'
    });

  } catch (error) {
    console.error('Update company profile error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
