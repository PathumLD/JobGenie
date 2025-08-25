import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { uploadBusinessRegistration, ensureBucketExists } from '@/lib/supabase';
import { createTransporter, createVerificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

// Validation schema for employer registration
const employerRegistrationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  business_registration_no: z.string().min(1, 'Business registration number is required').max(20, 'Business registration number must be less than 20 characters'),
  business_registration_certificate: z.custom<File>((val) => val && typeof val === 'object' && 'name' in val && 'size' in val && 'type' in val, { message: 'Business registration certificate is required' }),
  business_registered_address: z.string().min(1, 'Business registered address is required'),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must be less than 100 characters'),
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract fields from form data
    const company_name = formData.get('company_name') as string;
    const business_registration_no = formData.get('business_registration_no') as string;
    const business_registration_certificate = formData.get('business_registration_certificate') as File;
    const business_registered_address = formData.get('business_registered_address') as string;
    const industry = formData.get('industry') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirm_password = formData.get('confirm_password') as string;

    // Validate the data
    const validationResult = employerRegistrationSchema.safeParse({
      company_name,
      business_registration_no,
      business_registration_certificate,
      business_registered_address,
      industry,
      first_name,
      last_name,
      email,
      password,
      confirm_password
    });

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.issues.map(issue => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.map(p => typeof p === 'string' ? p : String(p))
        }))
      }, { status: 400 });
    }

    const {
      business_registration_certificate: certificateFile,
      password: validatedPassword,

    } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      }, { status: 409 });
    }

    // Check if company already exists with the same business registration number
    const existingCompany = await prisma.company.findFirst({
      where: { business_registration_no }
    });

    if (existingCompany) {
      return NextResponse.json({
        error: 'Company already exists',
        message: 'A company with this business registration number already exists'
      }, { status: 409 });
    }

    // Ensure Supabase storage bucket exists
    await ensureBucketExists();

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedPassword, 12);

    // Generate email verification token
    const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user, company, and employer records in a transaction
    const result = await prisma.$transaction(async (prismaClient: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => {
      // Create user record
      const user = await prismaClient.user.create({
        data: {
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role: 'employer',
          status: 'pending_verification',
          email_verified: false,
          email_verification_token: verificationToken,
          verification_token_expires_at: tokenExpiresAt,
          is_created: true
        }
      });

      // Upload business registration certificate to Supabase
      const businessRegistrationUrl = await uploadBusinessRegistration(
        certificateFile,
        company_name,
        user.id
      );

      // Create company record
      const company = await prismaClient.company.create({
        data: {
          name: company_name,
          email, // Use employer's email as company email
          business_registration_no,
          business_registration_url: businessRegistrationUrl,
          registered_address: business_registered_address,
          industry,
          company_size: 'startup', // Default value
          company_type: 'corporation' // Default value
        }
      });

      // Create employer record
      const employer = await prismaClient.employer.create({
        data: {
          user_id: user.id,
          company_id: company.id,
          first_name,
          last_name,
          role: 'company_admin', // Default role for the first employer
          is_primary_contact: true, // First employer is primary contact
          is_verified: false
        }
      });

      return { user, company, employer };
    });

    // Send verification email
    try {
      const transporter = createTransporter();
      const mailOptions = createVerificationEmail(email, verificationToken, first_name);
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email fails
    }

    // Return success response
    return NextResponse.json({
      message: 'Employer registration successful. Please check your email for verification.',
      user: {
        id: result.user.id,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        email_verified: result.user.email_verified,
        created_at: result.user.created_at,
        updated_at: result.user.updated_at,
        is_created: result.user.is_created
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        email: result.company.email,
        business_registration_url: result.company.business_registration_url,
        business_registration_no: result.company.business_registration_no,
        registered_address: result.company.registered_address,
        industry: result.company.industry,
        company_size: result.company.company_size,
        company_type: result.company.company_type,
        verification_status: result.company.verification_status,
        created_at: result.company.created_at,
        updated_at: result.company.updated_at
      },
      employer: {
        user_id: result.employer.user_id,
        company_id: result.employer.company_id,
        first_name: result.employer.first_name,
        last_name: result.employer.last_name,
        role: result.employer.role,
        is_primary_contact: result.employer.is_primary_contact,
        is_verified: result.employer.is_verified,
        created_at: result.employer.created_at,
        updated_at: result.employer.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Employer registration error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Registration failed',
        message: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Registration failed',
      message: 'An unexpected error occurred during registration'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}