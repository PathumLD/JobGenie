import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UploadImageResponse {
  success: boolean;
  message: string;
  data?: {
    profile_image_url: string;
  };
}

interface UploadImageErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// POST - Upload profile image
export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadImageResponse | UploadImageErrorResponse>> {
  try {
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as UploadImageErrorResponse,
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
        } as UploadImageErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('profile_image') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Profile image file is required'
        } as UploadImageErrorResponse,
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'File must be an image'
        } as UploadImageErrorResponse,
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'File size must be less than 5MB'
        } as UploadImageErrorResponse,
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `profile_${userId}_${timestamp}.${fileExtension}`;
    const filePath = `profile-images/${userId}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('candidate_profile_image')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload image to storage'
        } as UploadImageErrorResponse,
        { status: 500 }
      );
    }

    // Get public URL from Supabase
    const { data: urlData } = supabase.storage
      .from('candidate_profile_image')
      .getPublicUrl(filePath);

    const profileImageUrl = urlData.publicUrl;

    // Update the candidate's profile_image_url in the database
    await prisma.candidate.update({
      where: { user_id: userId },
      data: {
        profile_image_url: profileImageUrl
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profile_image_url: profileImageUrl
      }
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload profile image'
      } as UploadImageErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
