import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createTransporter, createVerificationEmail } from '@/lib/email';
import { uploadBusinessRegistration, ensureBucketExists } from '@/lib/supabase';
import type { EmployerRegistrationResponse, ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Validation schema for employer registration
const employerRegistrationSchema = z.object({
  // Company fields (only essential fields)
  company_name: z.string().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  business_registration_no: z.string().min(1, 'Business registration number is required'),
  business_registration_certificate: z.instanceof(File).refine((file) => file.size > 0, 'Business registration certificate is required'),
  business_registered_address: z.string().min(1, 'Business registered address is required'),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must be less than 100 characters'),
  
  // Employer fields (only essential fields)
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: z.string().email('Invalid employer email format').max(255, 'Employer email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export async function POST(request: NextRequest): Promise<NextResponse<EmployerRegistrationResponse | ApiErrorResponse>> {
  try {
    // Parse FormData instead of JSON
    const formData = await request.formData();
    
    // Extract and validate form data (only essential fields)
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
    const validationData = {
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
    };
    
    const validationResult = employerRegistrationSchema.safeParse(validationData);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map(issue => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.map(p => typeof p === 'string' ? p : String(p))
      }));
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if company already exists (by business registration number)
    const existingCompany = await prisma.company.findFirst({
      where: {
        business_registration_no: data.business_registration_no
      }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this business registration number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user, company, and employer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate 6-digit verification token
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Create user record first
      const user = await tx.user.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: hashedPassword,
          role: 'employer',
          status: 'pending_verification',
          email_verified: false,
          email_verification_token: verificationToken,
          verification_token_expires_at: tokenExpiry,
          is_created: true
        }
      });

      // Ensure storage bucket exists before uploading
      await ensureBucketExists();

      // Upload business registration document to Supabase storage
      const businessRegistrationUrl = await uploadBusinessRegistration(
        data.business_registration_certificate,
        data.company_name,
        user.id
      );

      // Create company record
      const company = await tx.company.create({
        data: {
          name: data.company_name,
          email: data.email, // Use employer's email as company email
          business_registration_no: data.business_registration_no,
          business_registration_url: businessRegistrationUrl,
          registered_address: data.business_registered_address,
          industry: data.industry,
          company_size: 'startup', // Default value
          company_type: 'corporation', // Default value
          verification_status: 'pending'
        }
      });

      // Create employer record
      const employer = await tx.employer.create({
        data: {
          user_id: user.id,
          company_id: company.id,
          first_name: data.first_name,
          last_name: data.last_name,
          role: 'company_admin', // Default role for first employer
          is_primary_contact: true, // First employer is always primary contact
          is_verified: false
        }
      });

      return { user, company, employer, verificationToken };
    });

    // Send verification email
    try {
      const transporter = createTransporter();
      const mailOptions = createVerificationEmail(
        data.email, 
        result.verificationToken, 
        data.first_name
      );

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Verification email sending error:', emailError);
      // Don't fail registration if email fails, but log the error
    }

    // Remove sensitive information from response
    const { password: _password, ...userWithoutPassword } = result.user;

    return NextResponse.json(
      {
        message: 'Employer registered successfully. Please check your email to verify your account.',
        user: userWithoutPassword,
        company: result.company,
        employer: result.employer
      } as EmployerRegistrationResponse,
      { status: 201 }
    );

  } catch (error) {
    console.error('Employer registration error:', error);
    
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
