import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket names
export const BUSINESS_REGISTRATION_BUCKET = 'business-registration';
export const COMPANY_LOGO_BUCKET = 'company_logo';

// Function to upload business registration document
export async function uploadBusinessRegistration(
  file: File,
  companyName: string,
  userId: string
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${userId}_${timestamp}.${fileExtension}`;
    
    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from(BUSINESS_REGISTRATION_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket '${BUSINESS_REGISTRATION_BUCKET}' not found. Please create it in your Supabase dashboard under Storage > Buckets.`);
      }
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(BUSINESS_REGISTRATION_BUCKET)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload business registration document');
  }
}

// Function to check if bucket exists and create it if needed
export async function ensureBucketExists(): Promise<void> {
  try {
    // List buckets to check if ours exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUSINESS_REGISTRATION_BUCKET);
    
    if (!bucketExists) {
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket(BUSINESS_REGISTRATION_BUCKET, {
        public: true, // Make files publicly accessible
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'], // Allow common document types
        fileSizeLimit: 10485760 // 10MB limit
      });

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }

      console.log(`Storage bucket '${BUSINESS_REGISTRATION_BUCKET}' created successfully`);
    }
  } catch (error) {
    console.error('Bucket creation error:', error);
    throw new Error('Failed to ensure storage bucket exists');
  }
}

// Function to upload company logo
export async function uploadCompanyLogo(
  file: File,
  companyId: string
): Promise<string> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `logo_${timestamp}.${fileExtension}`;
    
    // Upload file to company-specific directory
    const { error } = await supabase.storage
      .from(COMPANY_LOGO_BUCKET)
      .upload(`${companyId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket '${COMPANY_LOGO_BUCKET}' not found. Please create it in your Supabase dashboard under Storage > Buckets.`);
      }
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(COMPANY_LOGO_BUCKET)
      .getPublicUrl(`${companyId}/${fileName}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Logo upload error:', error);
    throw new Error('Failed to upload company logo');
  }
}

// Function to delete company logo
export async function deleteCompanyLogo(fileUrl: string, companyId: string): Promise<void> {
  try {
    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const { error } = await supabase.storage
      .from(COMPANY_LOGO_BUCKET)
      .remove([`${companyId}/${fileName}`]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Logo deletion error:', error);
    throw new Error('Failed to delete company logo');
  }
}

// Function to delete business registration document
export async function deleteBusinessRegistration(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const { error } = await supabase.storage
      .from(BUSINESS_REGISTRATION_BUCKET)
      .remove([fileName]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete business registration document');
  }
}
