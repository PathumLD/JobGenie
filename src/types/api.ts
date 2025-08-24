// API Types for Job Genie

// Candidate Registration Request
export interface CandidateRegistrationRequest {
  first_name: string;
  last_name: string;
  nic: string;
  passport?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth: string; // ISO date string
  address: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
}

// Candidate Registration Response
export interface CandidateRegistrationResponse {
  message: string;
  user: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    address?: string | null;
    phone1?: string | null;
    phone2?: string | null;
    email: string;
    role?: 'candidate' | 'employer' | 'mis' | 'recruitment_agency' | null;
    status?: 'active' | 'inactive' | 'suspended' | 'pending_verification' | null;
    email_verified?: boolean | null;
    email_verification_token?: string | null;
    password_reset_token?: string | null;
    password_reset_expires_at?: Date | null;
    provider?: string | null;
    provider_id?: string | null;
    last_login_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    deleted_at?: Date | null;
    is_created: boolean;
  };
  candidate: {
    user_id: string;
    first_name?: string | null;
    last_name?: string | null;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    date_of_birth?: Date | null;
    title?: string | null;
    current_position?: string | null;
    industry?: string | null;
    bio?: string | null;
    about?: string | null;
    country?: string | null;
    city?: string | null;
    location?: string | null;
    address?: string | null;
    phone1?: string | null;
    phone2?: string | null;
    personal_website?: string | null;
    nic?: string | null;
    passport?: string | null;
    membership_no: number;
    remote_preference?: 'remote_only' | 'hybrid' | 'onsite' | 'flexible' | null;
    experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
    years_of_experience?: number | null;
    expected_salary_min?: number | null;
    expected_salary_max?: number | null;
    currency?: string | null;
    profile_image_url?: string | null;
    availability_status?: 'available' | 'open_to_opportunities' | 'not_looking' | null;
    availability_date?: Date | null;
    resume_url?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
    professional_summary?: string | null;
    total_years_experience?: number | null;
    open_to_relocation?: boolean | null;
    willing_to_travel?: boolean | null;
    security_clearance?: boolean | null;
    disability_status?: string | null;
    veteran_status?: string | null;
    pronouns?: string | null;
    salary_visibility?: 'confidential' | 'range_only' | 'exact' | 'negotiable' | null;
    notice_period?: number | null;
    work_authorization?: 'citizen' | 'permanent_resident' | 'work_visa' | 'requires_sponsorship' | 'other' | null;
    visa_assistance_needed?: boolean | null;
    work_availability?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'volunteer' | null;
    interview_ready?: boolean | null;
    pre_qualified?: boolean | null;
    profile_completion_percentage?: number | null;
    completedProfile?: boolean | null;
    saved_job: string[];
    saved_jobs_metadata?: unknown;
    created_at?: Date | null;
    updated_at?: Date | null;
  };
}

// API Error Response
export interface ApiErrorResponse {
  error: string;
  details?: Array<{
    code: string;
    message: string;
    path: (string | number)[];
  }>;
  message?: string;
}

// Validation Error
export interface ValidationError {
  code: string;
  message: string;
  path: string[];
}
