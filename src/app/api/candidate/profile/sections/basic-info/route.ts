import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface BasicInfoUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  portfolio_url?: string;
  blog_url?: string;
  other_url?: string;
  headline?: string;
  summary?: string;
  current_salary?: number;
  expected_salary?: number;
  currency?: string;
  work_availability?: string;
  availability_status?: string;
  notice_period?: number;
  notice_period_unit?: string;
  willing_to_relocate?: boolean;
  willing_to_travel?: boolean;
  travel_percentage?: number;
  visa_status?: string;
  work_permit?: string;
  languages?: string[];
  certifications?: string[];
  interests?: string[];
  hobbies?: string[];
  achievements?: string[];
  publications?: string[];
  patents?: string[];
  awards?: string[];
  honors?: string[];
  memberships?: string[];
  affiliations?: string[];
  references?: string[];
  emergency_contact?: string;
  emergency_phone?: string;
  emergency_relationship?: string;
  emergency_address?: string;
  emergency_city?: string;
  emergency_state?: string;
  emergency_country?: string;
  emergency_postal_code?: string;
  emergency_email?: string;
  emergency_notes?: string;
  privacy_settings?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface BasicInfoResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    date_of_birth: Date | null;
    gender: string | null;
    profile_image_url: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    twitter_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    youtube_url: string | null;
    portfolio_url: string | null;
    blog_url: string | null;
    other_url: string | null;
    headline: string | null;
    summary: string | null;
    current_salary: number | null;
    expected_salary: number | null;
    currency: string | null;
    work_availability: string | null;
    availability_status: string | null;
    notice_period: number | null;
    notice_period_unit: string | null;
    willing_to_relocate: boolean | null;
    willing_to_travel: boolean | null;
    travel_percentage: number | null;
    visa_status: string | null;
    work_permit: string | null;
    languages: string[];
    certifications: string[];
    interests: string[];
    hobbies: string[];
    achievements: string[];
    publications: string[];
    patents: string[];
    awards: string[];
    honors: string[];
    memberships: string[];
    affiliations: string[];
    references: string[];
    emergency_contact: string | null;
    emergency_phone: string | null;
    emergency_relationship: string | null;
    emergency_address: string | null;
    emergency_city: string | null;
    emergency_state: string | null;
    emergency_country: string | null;
    emergency_postal_code: string | null;
    emergency_email: string | null;
    emergency_notes: string | null;
    privacy_settings: Record<string, unknown> | null;
    preferences: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface BasicInfoErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// PUT - Update basic info
export async function PUT(
  request: NextRequest
): Promise<NextResponse<BasicInfoResponse | BasicInfoErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as BasicInfoErrorResponse,
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
        } as BasicInfoErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: BasicInfoUpdateData = await request.json();

    // Check if candidate profile exists
    const existingCandidate = await prisma.candidate.findFirst({
      where: { user_id: userId }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Candidate profile not found'
        } as BasicInfoErrorResponse,
        { status: 404 }
      );
    }

    // Validate date if provided
    let dateOfBirth: Date | undefined;
    if (body.date_of_birth) {
      dateOfBirth = new Date(body.date_of_birth);
      if (isNaN(dateOfBirth.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid date of birth format'
          } as BasicInfoErrorResponse,
          { status: 400 }
        );
      }
    }

    // Validate salary fields if provided
    if (body.current_salary !== undefined && body.current_salary < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Current salary cannot be negative'
        } as BasicInfoErrorResponse,
        { status: 400 }
      );
    }

    if (body.expected_salary !== undefined && body.expected_salary < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Expected salary cannot be negative'
        } as BasicInfoErrorResponse,
        { status: 400 }
      );
    }

    if (body.notice_period !== undefined && body.notice_period < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Notice period cannot be negative'
        } as BasicInfoErrorResponse,
        { status: 400 }
      );
    }

    if (body.travel_percentage !== undefined && (body.travel_percentage < 0 || body.travel_percentage > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Travel percentage must be between 0 and 100'
        } as BasicInfoErrorResponse,
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.profile_image_url !== undefined) updateData.profile_image_url = body.profile_image_url;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.linkedin_url !== undefined) updateData.linkedin_url = body.linkedin_url;
    if (body.github_url !== undefined) updateData.github_url = body.github_url;
    if (body.twitter_url !== undefined) updateData.twitter_url = body.twitter_url;
    if (body.facebook_url !== undefined) updateData.facebook_url = body.facebook_url;
    if (body.instagram_url !== undefined) updateData.instagram_url = body.instagram_url;
    if (body.youtube_url !== undefined) updateData.youtube_url = body.youtube_url;
    if (body.portfolio_url !== undefined) updateData.portfolio_url = body.portfolio_url;
    if (body.blog_url !== undefined) updateData.blog_url = body.blog_url;
    if (body.other_url !== undefined) updateData.other_url = body.other_url;
    if (body.headline !== undefined) updateData.headline = body.headline;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.current_salary !== undefined) updateData.current_salary = body.current_salary;
    if (body.expected_salary !== undefined) updateData.expected_salary = body.expected_salary;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.work_availability !== undefined) updateData.work_availability = body.work_availability;
    if (body.availability_status !== undefined) updateData.availability_status = body.availability_status;
    if (body.notice_period !== undefined) updateData.notice_period = body.notice_period;
    if (body.notice_period_unit !== undefined) updateData.notice_period_unit = body.notice_period_unit;
    if (body.willing_to_relocate !== undefined) updateData.willing_to_relocate = body.willing_to_relocate;
    if (body.willing_to_travel !== undefined) updateData.willing_to_travel = body.willing_to_travel;
    if (body.travel_percentage !== undefined) updateData.travel_percentage = body.travel_percentage;
    if (body.visa_status !== undefined) updateData.visa_status = body.visa_status;
    if (body.work_permit !== undefined) updateData.work_permit = body.work_permit;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.certifications !== undefined) updateData.certifications = body.certifications;
    if (body.interests !== undefined) updateData.interests = body.interests;
    if (body.hobbies !== undefined) updateData.hobbies = body.hobbies;
    if (body.achievements !== undefined) updateData.achievements = body.achievements;
    if (body.publications !== undefined) updateData.publications = body.publications;
    if (body.patents !== undefined) updateData.patents = body.patents;
    if (body.awards !== undefined) updateData.awards = body.awards;
    if (body.honors !== undefined) updateData.honors = body.honors;
    if (body.memberships !== undefined) updateData.memberships = body.memberships;
    if (body.affiliations !== undefined) updateData.affiliations = body.affiliations;
    if (body.references !== undefined) updateData.references = body.references;
    if (body.emergency_contact !== undefined) updateData.emergency_contact = body.emergency_contact;
    if (body.emergency_phone !== undefined) updateData.emergency_phone = body.emergency_phone;
    if (body.emergency_relationship !== undefined) updateData.emergency_relationship = body.emergency_relationship;
    if (body.emergency_address !== undefined) updateData.emergency_address = body.emergency_address;
    if (body.emergency_city !== undefined) updateData.emergency_city = body.emergency_city;
    if (body.emergency_state !== undefined) updateData.emergency_state = body.emergency_state;
    if (body.emergency_country !== undefined) updateData.emergency_country = body.emergency_country;
    if (body.emergency_postal_code !== undefined) updateData.emergency_postal_code = body.emergency_postal_code;
    if (body.emergency_email !== undefined) updateData.emergency_email = body.emergency_email;
    if (body.emergency_notes !== undefined) updateData.emergency_notes = body.emergency_notes;
    if (body.privacy_settings !== undefined) updateData.privacy_settings = body.privacy_settings;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const updatedCandidate = await prisma.candidate.update({
      where: { user_id: userId },
      data: updateData
    });

    // Map the Prisma result to match the expected response type
    const responseData = {
      id: updatedCandidate.user_id, // Use user_id as id since that's the primary key
      user_id: updatedCandidate.user_id,
      first_name: updatedCandidate.first_name,
      last_name: updatedCandidate.last_name,
      email: null, // Not in schema
      phone: updatedCandidate.phone1, // Use phone1 from schema
      date_of_birth: updatedCandidate.date_of_birth,
      gender: updatedCandidate.gender,
      profile_image_url: updatedCandidate.profile_image_url,
      bio: updatedCandidate.bio,
      location: updatedCandidate.location,
      website: updatedCandidate.personal_website, // Use personal_website from schema
      linkedin_url: updatedCandidate.linkedin_url,
      github_url: updatedCandidate.github_url,
      twitter_url: null, // Not in schema
      facebook_url: null, // Not in schema
      instagram_url: null, // Not in schema
      youtube_url: null, // Not in schema
      portfolio_url: null, // Not in schema
      blog_url: null, // Not in schema
      other_url: null, // Not in schema
      headline: updatedCandidate.title, // Use title from schema
      summary: updatedCandidate.professional_summary, // Use professional_summary from schema
      current_salary: null, // Not in schema
      expected_salary: updatedCandidate.expected_salary_max, // Use expected_salary_max from schema
      currency: updatedCandidate.currency,
      work_availability: updatedCandidate.work_availability,
      availability_status: updatedCandidate.availability_status,
      notice_period: updatedCandidate.notice_period,
      notice_period_unit: null, // Not in schema
      willing_to_relocate: updatedCandidate.open_to_relocation, // Use open_to_relocation from schema
      willing_to_travel: updatedCandidate.willing_to_travel,
      travel_percentage: null, // Not in schema
      visa_status: null, // Not in schema
      work_permit: null, // Not in schema
      languages: [], // Not in schema as array
      certifications: [], // Not in schema as array
      interests: [], // Not in schema
      hobbies: [], // Not in schema
      achievements: [], // Not in schema
      publications: [], // Not in schema
      patents: [], // Not in schema
      awards: [], // Not in schema
      honors: [], // Not in schema
      memberships: [], // Not in schema
      affiliations: [], // Not in schema
      references: [], // Not in schema
      emergency_contact: null, // Not in schema
      emergency_phone: null, // Not in schema
      emergency_relationship: null, // Not in schema
      emergency_address: null, // Not in schema
      emergency_city: null, // Not in schema
      emergency_state: null, // Not in schema
      emergency_country: null, // Not in schema
      emergency_postal_code: null, // Not in schema
      emergency_email: null, // Not in schema
      emergency_notes: null, // Not in schema
      privacy_settings: null, // Not in schema
      preferences: null, // Not in schema
      metadata: null, // Not in schema
      created_at: updatedCandidate.created_at,
      updated_at: updatedCandidate.updated_at,
    };

    return NextResponse.json({
      success: true,
      message: 'Basic info updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error updating basic info:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update basic info'
      } as BasicInfoErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
