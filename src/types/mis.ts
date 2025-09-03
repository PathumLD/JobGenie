// MIS Types based on updated Prisma schema

export interface MisUser {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface MisCompanyAccess {
  id: string;
  mis_user_id: string;
  company_id: string;
  can_create_jobs: boolean;
  can_manage_jobs: boolean;
  created_at: Date;
  updated_at: Date;
}

// MIS Resume Response Types
export interface MisResumeResponse {
  success: boolean;
  data: {
    resume: {
      id: string;
      candidate_id: string;
      resume_url: string | null;
      original_filename: string | null;
      file_size: number | null;
      file_type: string | null;
      is_primary: boolean | null;
      uploaded_at: Date | null;
      created_at: Date | null;
      updated_at: Date | null;
    };
    message: string;
  };
}

export interface MisResumeErrorResponse {
  success: false;
  error: string;
}
