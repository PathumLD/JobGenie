// User types based on Prisma schema
export type UserType = 'candidate' | 'employer' | 'mis' | 'recruitment_agency';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface User {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email: string;
  password?: string | null;
  role?: UserType | null;
  status?: UserStatus | null;
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
}

export interface Candidate {
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
  isApproved?: boolean | null;
  saved_job: string[];
  saved_jobs_metadata?: Record<string, unknown> | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface Employer {
  user_id: string;
  company_id: string;
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  role: 'recruiter' | 'hiring_manager' | 'hr_admin' | 'company_admin';
  permissions?: Record<string, unknown> | null;
  is_primary_contact: boolean;
  phone_extension?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Company {
  id: string;
  name: string;
  email?: string | null;
  contact?: string | null;
  slug: string;
  description?: string | null;
  business_registration_no?: string | null;
  business_registration_url?: string | null;
  registered_address?: string | null;
  website?: string | null;
  logo_url?: string | null;
  industry?: string | null;
  company_size: 'startup' | 'one_to_ten' | 'eleven_to_fifty' | 'fifty_one_to_two_hundred' | 'two_hundred_one_to_five_hundred' | 'five_hundred_one_to_one_thousand' | 'one_thousand_plus';
  headquarters_location?: string | null;
  founded_year?: number | null;
  company_type: 'startup' | 'corporation' | 'agency' | 'non_profit' | 'government';
  remote_friendly: boolean;
  benefits?: string | null;
  culture_description?: string | null;
  social_media_links?: Record<string, unknown> | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}
