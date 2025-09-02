// Resume Types based on schema.prisma
// This file is kept for backward compatibility but imports from resume-management.ts

export type {
  Resume,
  ResumeWithRelations,
  JWTPayload,
  ResumeUploadResponse,
  ResumeListResponse,
  ResumeUpdateResponse,
  ResumeDeleteResponse,
  CVExtractionData,
  CVExtractionResponse,
  ResumeAnalysisResult,
  ResumeAnalysisResponse,
  ErrorResponse,
  APIResponse,
  FileValidationOptions,
  FileValidationResult,
  StorageConfig,
  CandidateWithResumes
} from './resume-management';

// Legacy types for backward compatibility
export interface CreateResumeData {
  is_allow_fetch?: boolean;
  is_primary?: boolean;
  original_filename?: string;
  file_size?: number;
  file_type?: string;
}

export interface UpdateResumeData {
  is_primary?: boolean;
  is_allow_fetch?: boolean;
}
