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
    email_verification_token_expires_at?: Date | null;
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
    membership_no: string;
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

// User Login Request (for both candidates and employers)
export interface UserLoginRequest {
  email: string;
  password: string;
}

// User Login Response (for both candidates and employers)
export interface UserLoginResponse {
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
    last_login_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    is_created: boolean;
  };
  profile?: {
    // Candidate profile fields
    user_id?: string;
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
    membership_no?: string;
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
    saved_job?: string[];
    saved_jobs_metadata?: unknown;
    created_at?: Date | null;
    updated_at?: Date | null;
    // Employer profile fields
    company_id?: string;
    job_title?: string | null;
    department?: string | null;
    employer_role?: 'recruiter' | 'hiring_manager' | 'hr_admin' | 'company_admin' | null;
    permissions?: unknown;
    is_primary_contact?: boolean;
    phone_extension?: string | null;
  };
  user_type: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
}



// Logout Response
export interface LogoutResponse {
  message: string;
  logged_out: boolean;
}

// Profile Response
export interface ProfileResponse {
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
    last_login_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    is_created: boolean;
  };
  profile?: {
    // Candidate profile fields
    user_id?: string;
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
    membership_no?: string;
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
    isApproved?: boolean | null;
    pre_qualified?: boolean | null;
    profile_completion_percentage?: number | null;
    completedProfile?: boolean | null;
    saved_job?: string[];
    saved_jobs_metadata?: unknown;
    created_at?: Date | null;
    updated_at?: Date | null;
    // Employer profile fields
    company_id?: string;
    job_title?: string | null;
    department?: string | null;
    employer_role?: 'recruiter' | 'hiring_manager' | 'hr_admin' | 'company_admin' | null;
    permissions?: unknown;
    is_primary_contact?: boolean;
    phone_extension?: string | null;
  };
  user_type: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
}

// Email Verification Request
export interface EmailVerificationRequest {
  email: string;
}

// Email Verification Response
export interface EmailVerificationResponse {
  message: string;
  email: string;
  verification_sent: boolean;
}

// Verify Email Token Request
export interface VerifyEmailTokenRequest {
  token: string;
}

// Verify Email Token Response
export interface VerifyEmailTokenResponse {
  message: string;
  email_verified: boolean;
  user_id: string;
}

// Employer Registration Request
export interface EmployerRegistrationRequest {
  // Company fields (only essential fields)
  company_name: string;
  business_registration_no: string; // Business registration number for uniqueness
  business_registration_certificate: File; // File upload for business registration
  business_registered_address: string;
  industry: string;
  
  // Employer fields (only essential fields)
  first_name: string;
  last_name: string;
  email: string; // Employer's personal email
  password: string;
  confirm_password: string;
}

// Employer Registration Response
export interface EmployerRegistrationResponse {
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
    email_verification_token_expires_at?: Date | null;
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
  company: {
    id: string;
    name: string;
    email: string;
    business_registration_url: string;
    business_registration_no: string;
    registered_address: string;
    contact?: string | null;
    slug?: string | null;
    description?: string | null;
    website?: string | null;
    logo_url?: string | null;
    industry: string;
    company_size: 'startup' | 'one_to_ten' | 'eleven_to_fifty' | 'fifty_one_to_two_hundred' | 'two_hundred_one_to_five_hundred' | 'five_hundred_one_to_one_thousand' | 'one_thousand_plus';
    headquarters_location?: string | null;
    founded_year?: number | null;
    company_type: 'startup' | 'corporation' | 'agency' | 'non_profit' | 'government';
    benefits?: string | null;
    culture_description?: string | null;
    social_media_links?: unknown;
    verification_status: 'pending' | 'verified' | 'rejected';
    verified_at?: Date | null;
    created_at: Date;
    updated_at: Date;
  };
  employer: {
    user_id: string;
    company_id: string;
    first_name?: string | null;
    last_name?: string | null;
    address?: string | null;
    phone?: string | null;
    job_title?: string | null;
    department?: string | null;
    role: 'recruiter' | 'hiring_manager' | 'hr_admin' | 'company_admin';
    permissions?: unknown;
    is_verified: boolean;
    is_primary_contact: boolean;
    phone_extension?: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

// MIS Login Request
export interface MisLoginRequest {
  email: string;
  password: string;
}

// MIS Login Response
export interface MisLoginResponse {
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
    last_login_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    is_created: boolean;
  };
  mis_user: {
    user_id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    created_at: Date;
    updated_at: Date;
  };
  user_type: 'mis';
  access_token: string;
}

// MIS Registration Request
export interface MisRegistrationRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

// MIS Registration Response
export interface MisRegistrationResponse {
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
    email_verification_token_expires_at?: Date | null;
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
  mis_user: {
    user_id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    created_at: Date;
    updated_at: Date;
  };
}

