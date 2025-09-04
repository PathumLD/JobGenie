// Resume Management Types - Comprehensive type definitions following schema.prisma

import { Prisma } from '@prisma/client';

// Base Resume type from Prisma
export type Resume = {
  id: string;
  candidate_id: string;
  is_allow_fetch: boolean | null;
  resume_url: string | null;
  original_filename: string | null;
  file_size: number | null;
  file_type: string | null;
  is_primary: boolean | null;
  uploaded_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
};

// Resume with relations
export type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    candidate: true;
    accomplishments: true;
    applications: true;
  };
}>;

// Resume Upload Data
export interface ResumeUploadData {
  is_allow_fetch?: boolean;
  is_primary?: boolean;
  original_filename?: string;
  file_size?: number;
  file_type?: string;
}

// Resume Update Data
export interface ResumeUpdateData {
  resume_id: string;
  is_primary?: boolean;
  is_allow_fetch?: boolean;
}

// Resume Delete Data
export interface ResumeDeleteData {
  resume_id: string;
}

// File Upload Result
export interface FileUploadResult {
  filePath: string;
  publicUrl: string;
}

// Resume Upload Response
export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  data: {
    resume_id: string;
    candidate_id: string;
    resume_url: string | null;
    original_filename: string | null;
    file_size: number | null;
    file_type: string | null;
    is_primary: boolean | null;
    is_allow_fetch: boolean | null;
    uploaded_at: Date | null;
    storage_path: string;
    public_url: string;
  };
}

// Resume List Response
export interface ResumeListResponse {
  success: boolean;
  data: {
    candidate_id: string;
    resumes: Resume[];
    total_count: number;
    primary_resume: Resume | null;
  };
}

// Resume Update Response
export interface ResumeUpdateResponse {
  success: boolean;
  message: string;
  data: Resume;
}

// Resume Delete Response
export interface ResumeDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deleted_resume_id: string;
    candidate_id: string;
  };
}

// CV Extraction Types
export interface CVPersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface CVExperience {
  title: string;
  company: string;
  duration?: string;
  description?: string;
  skills?: string[];
}

export interface CVEducation {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface CVCertification {
  name: string;
  issuer?: string;
  year?: string;
}

export interface CVProject {
  name: string;
  description?: string;
  technologies?: string[];
}

export interface CVExtractedData {
  personal_info?: CVPersonalInfo;
  experience?: CVExperience[];
  education?: CVEducation[];
  skills?: string[];
  certifications?: CVCertification[];
  languages?: string[];
  projects?: CVProject[];
}

export interface CVExtractionData {
  extraction_id: string;
  candidate_id: string;
  extracted_data: CVExtractedData;
  confidence_score?: number;
  extraction_method: 'ai' | 'manual' | 'parsing';
  created_at: Date;
}

export interface CVExtractionResponse {
  success: boolean;
  message: string;
  data: CVExtractionData;
}

export interface CVExtractionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    candidate_id: string;
    extractions: CVExtractionData[];
    total_count: number;
  };
}

// Resume Analysis Types
export interface ResumeAnalysisResult {
  skills_found: string[];
  experience_summary: string;
  education_summary: string;
  overall_score: number;
  recommendations: string[];
}

export interface ResumeAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    resume_id: string;
    candidate_id: string;
    analysis: ResumeAnalysisResult;
    analyzed_at: Date;
  };
}

// Error Response
export interface ErrorResponse {
  error: string;
  details?: string;
}

// API Response Types
export type APIResponse<T> = {
  success: true;
  data: T;
  message?: string;
} | {
  success: false;
  error: string;
  details?: string;
};

// File validation types
export interface FileValidationOptions {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Storage configuration
export interface StorageConfig {
  bucketName: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  cacheControl: string;
}

// Candidate with Resume relation
export type CandidateWithResumes = Prisma.CandidateGetPayload<{
  include: {
    resumes: true;
  };
}>;