import { createClient } from '@supabase/supabase-js';
import { FileUploadResult, FileValidationResult, StorageConfig } from '@/types/resume-management';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket names
export const RESUME_BUCKET = 'candidate_resume';
export const CV_BUCKET = 'candidate_resume'; // Use same bucket for both resume and CV files

// Storage configurations
export const RESUME_STORAGE_CONFIG: StorageConfig = {
  bucketName: RESUME_BUCKET,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  cacheControl: '3600'
};

export const CV_STORAGE_CONFIG: StorageConfig = {
  bucketName: CV_BUCKET,
  maxFileSize: 15 * 1024 * 1024, // 15MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ],
  cacheControl: '3600'
};

// File validation helper
function validateFile(file: File, config: StorageConfig): FileValidationResult {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(config.maxFileSize / (1024 * 1024))}MB`
    };
  }

  // Check file type
  if (!config.allowedMimeTypes.includes(file.type)) {
    const allowedTypes = config.allowedMimeTypes
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');
    return {
      isValid: false,
      error: `Only ${allowedTypes} files are allowed`
    };
  }

  return { isValid: true };
}

// Generate unique file name with timestamp
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${timestamp}_${randomString}_${sanitizedName}.${extension}`;
}

// Resume storage utility functions
export class ResumeStorage {
  // Upload resume file to Supabase storage
  static async uploadResume(
    file: File, 
    candidateId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = validateFile(file, RESUME_STORAGE_CONFIG);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const fileName = generateFileName(file.name);
      const filePath = `${candidateId}/${fileName}`;
      
      console.log(`📤 Uploading resume to: ${filePath}`);
      
      const { data, error } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(filePath, file, {
          cacheControl: RESUME_STORAGE_CONFIG.cacheControl,
          upsert: false
        });
      
      if (error) {
        throw new Error(`Failed to upload resume: ${error.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(RESUME_BUCKET)
        .getPublicUrl(filePath);
      
      console.log(`✅ Resume uploaded successfully: ${urlData.publicUrl}`);
      
      return {
        filePath,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('Resume upload error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to upload resume: ${error.message}` 
          : 'Failed to upload resume to storage'
      );
    }
  }

  // Upload CV file for extraction (uses same bucket as resume)
  static async uploadCVFile(
    file: File,
    candidateId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file with CV config (allows images)
      const validation = validateFile(file, CV_STORAGE_CONFIG);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const fileName = generateFileName(file.name);
      const filePath = `${candidateId}/${fileName}`;
      
      console.log(`📤 Uploading CV file to: ${filePath}`);
      
      const { data, error } = await supabase.storage
        .from(CV_BUCKET)
        .upload(filePath, file, {
          cacheControl: CV_STORAGE_CONFIG.cacheControl,
          upsert: false
        });
      
      if (error) {
        throw new Error(`Failed to upload CV file: ${error.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(CV_BUCKET)
        .getPublicUrl(filePath);
      
      console.log(`✅ CV file uploaded successfully: ${urlData.publicUrl}`);
      
      return {
        filePath,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('CV file upload error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to upload CV file: ${error.message}` 
          : 'Failed to upload CV file to storage'
      );
    }
  }

  // Delete resume file from storage
  static async deleteResume(filePath: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting resume from storage: ${filePath}`);
      
      const { error } = await supabase.storage
        .from(RESUME_BUCKET)
        .remove([filePath]);
      
      if (error) {
        throw new Error(`Failed to delete resume: ${error.message}`);
      }
      
      console.log(`✅ Resume deleted successfully: ${filePath}`);
    } catch (error) {
      console.error('Resume deletion error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to delete resume: ${error.message}` 
          : 'Failed to delete resume from storage'
      );
    }
  }

  // Delete CV file from storage (uses same bucket as resume)
  static async deleteCVFile(filePath: string): Promise<void> {
    // Use the same delete method as resume since they use the same bucket
    return this.deleteResume(filePath);
  }

  // Get resume file URL
  static getResumeUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(RESUME_BUCKET)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Get CV file URL (uses same bucket as resume)
  static getCVFileUrl(filePath: string): string {
    // Use the same method as resume since they use the same bucket
    return this.getResumeUrl(filePath);
  }

  // List all files for a candidate
  static async listCandidateFiles(candidateId: string): Promise<string[]> {
    try {
      console.log(`📋 Listing files for candidate: ${candidateId}`);
      
      const { data, error } = await supabase.storage
        .from(RESUME_BUCKET)
        .list(candidateId);
      
      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }
      
      const fileNames = data?.map(item => item.name) || [];
      console.log(`✅ Found ${fileNames.length} files for candidate ${candidateId}`);
      
      return fileNames;
    } catch (error) {
      console.error('List files error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to list files: ${error.message}` 
          : 'Failed to list candidate files'
      );
    }
  }

  // List all resumes for a candidate (alias for backward compatibility)
  static async listCandidateResumes(candidateId: string): Promise<string[]> {
    return this.listCandidateFiles(candidateId);
  }

  // List all CV files for a candidate (alias for backward compatibility)
  static async listCandidateCVFiles(candidateId: string): Promise<string[]> {
    return this.listCandidateFiles(candidateId);
  }

  // Ensure storage buckets exist
  static async ensureBucketsExist(): Promise<void> {
    try {
      console.log('🔍 Checking if storage buckets exist...');
      
      // List buckets to check if ours exist
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw new Error(`Failed to list buckets: ${listError.message}`);
      }

      const resumeBucketExists = buckets?.some(bucket => bucket.name === RESUME_BUCKET);
      
      // Create resume bucket if it doesn't exist (supports both resume and CV files)
      if (!resumeBucketExists) {
        console.log(`📦 Creating storage bucket: ${RESUME_BUCKET}`);
        
        const { error: createError } = await supabase.storage.createBucket(RESUME_BUCKET, {
          public: true,
          allowedMimeTypes: CV_STORAGE_CONFIG.allowedMimeTypes, // Use CV config for broader support
          fileSizeLimit: CV_STORAGE_CONFIG.maxFileSize // Use larger limit
        });

        if (createError) {
          throw new Error(`Failed to create resume bucket: ${createError.message}`);
        }

        console.log(`✅ Storage bucket '${RESUME_BUCKET}' created successfully`);
      } else {
        console.log(`✅ Storage bucket '${RESUME_BUCKET}' already exists`);
      }
    } catch (error) {
      console.error('Bucket creation error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to ensure storage buckets exist: ${error.message}` 
          : 'Failed to ensure storage buckets exist'
      );
    }
  }

  // Get file metadata
  static async getFileMetadata(
    filePath: string
  ): Promise<{ size: number; type: string; lastModified: Date } | null> {
    try {
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop();
      const folderPath = pathParts.join('/');
      
      if (!fileName) {
        return null;
      }
      
      const { data, error } = await supabase.storage
        .from(RESUME_BUCKET)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          search: fileName
        });
      
      if (error) {
        throw new Error(`Failed to get file metadata: ${error.message}`);
      }
      
      const file = data?.find(item => item.name === fileName);
      
      if (file) {
        return {
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'application/octet-stream',
          lastModified: new Date(file.updated_at || file.created_at || Date.now())
        };
      }
      
      return null;
    } catch (error) {
      console.error('Get file metadata error:', error);
      return null;
    }
  }

  // Check if file exists
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(filePath);
      return metadata !== null;
    } catch (error) {
      console.error('File exists check error:', error);
      return false;
    }
  }

  // Get file size
  static async getFileSize(filePath: string): Promise<number | null> {
    try {
      const metadata = await this.getFileMetadata(filePath);
      return metadata?.size || null;
    } catch (error) {
      console.error('Get file size error:', error);
      return null;
    }
  }
}
