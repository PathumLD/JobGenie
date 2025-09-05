// Candidate Profile Types for LinkedIn-style sections

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  exp?: number;
  iat?: number;
}

export interface CandidateProfileSection {
  id: string;
  title: string;
  data: ProfileSectionData;
  order: number;
}

export type ProfileSectionData = 
  | BasicInfoSection
  | AboutSection
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CertificatesSection
  | LanguagesSection
  | AwardsSection
  | VolunteeringSection
  | AccomplishmentsSection;

export interface BasicInfoSection {
  type: 'basic_info';
  profile_image_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  current_position?: string | null;
  industry?: string | null;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  personal_website?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  bio?: string | null;
  about?: string | null;
  professional_summary?: string | null;
  availability_status?: 'available' | 'open_to_opportunities' | 'not_looking' | null;
  availability_date?: Date | null;
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
  years_of_experience?: number | null;
  total_years_experience?: number | null;
  remote_preference?: 'remote_only' | 'hybrid' | 'onsite' | 'flexible' | null;
  open_to_relocation?: boolean | null;
  willing_to_travel?: boolean | null;
  work_authorization?: 'citizen' | 'permanent_resident' | 'work_visa' | 'requires_sponsorship' | 'other' | null;
  notice_period?: number | null;
  work_availability?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'volunteer' | null;
  interview_ready?: boolean | null;
  pre_qualified?: boolean | null;
  profile_completion_percentage?: number | null;
  completedProfile?: boolean | null;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  // Additional fields from create-profile BasicInfo interface
  date_of_birth?: Date | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  nic?: string | null;
  passport?: string | null;
  membership_no?: string | null;
  pronouns?: string | null;
  disability_status?: string | null;
  veteran_status?: string | null;
  security_clearance?: boolean | null;
  visa_assistance_needed?: boolean | null;
  salary_visibility?: 'confidential' | 'range_only' | 'exact' | 'negotiable' | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  currency?: string | null;
  skills?: string | null;
  certifications?: string | null;
  awards?: string | null;
  volunteer_experience?: string | null;
  professional_qualification?: string | null;
  
  email?: string | null;
}

export interface AboutSection {
  type: 'about';
  about?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  date_of_birth?: Date | null;
  pronouns?: string | null;
  disability_status?: string | null;
  veteran_status?: string | null;
  security_clearance?: boolean | null;
  visa_assistance_needed?: boolean | null;
  salary_visibility?: 'confidential' | 'range_only' | 'exact' | 'negotiable' | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  currency?: string | null;
}

export interface ExperienceSection {
  type: 'experience';
  experiences: WorkExperienceItem[];
}

export interface WorkExperienceItem {
  id: string;
  title?: string | null;
  company?: string | null;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer' | null;
  is_current?: boolean | null;
  start_date?: Date | null;
  end_date?: Date | null;
  location?: string | null;
  description?: string | null;
  media_url?: string | null;
  skill_ids: string[];
  accomplishments: AccomplishmentItem[];
}

export interface AccomplishmentItem {
  id: string;
  title?: string | null;
  description?: string | null;
  created_at?: Date | null;
}

export interface EducationSection {
  type: 'education';
  educations: EducationItem[];
}

export interface EducationItem {
  id: string;
  degree_diploma?: string | null;
  university_school?: string | null;
  field_of_study?: string | null;
  description?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  grade?: string | null;
  activities_societies?: string | null;
  skill_ids: string[];
  media_url?: string | null;
}

export interface SkillsSection {
  type: 'skills';
  skills: SkillItem[];
}

export interface SkillItem {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  proficiency?: number | null;
  years_of_experience?: number | null;
  skill_source?: string | null;
  source_title?: string | null;
  source_company?: string | null;
  source_institution?: string | null;
  source_authority?: string | null;
  source_type?: string | null;
}

export interface ProjectsSection {
  type: 'projects';
  projects: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  name?: string | null;
  description?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  is_current?: boolean | null;
  role?: string | null;
  responsibilities: string[];
  technologies: string[];
  tools: string[];
  methodologies: string[];
  is_confidential?: boolean | null;
  can_share_details?: boolean | null;
  url?: string | null;
  repository_url?: string | null;
  media_urls: string[];
  skills_gained: string[];
}

export interface CertificatesSection {
  type: 'certificates';
  certificates: CertificateItem[];
}

export interface CertificateItem {
  id: string;
  name?: string | null;
  issuing_authority?: string | null;
  issue_date?: Date | null;
  expiry_date?: Date | null;
  credential_id?: string | null;
  credential_url?: string | null;
  description?: string | null;
  skill_ids: string[];
  media_url?: string | null;
}

export interface LanguagesSection {
  type: 'languages';
  languages: LanguageItem[];
}

export interface LanguageItem {
  id: string;
  language?: string | null;
  is_native?: boolean | null;
  oral_proficiency?: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic' | null;
  written_proficiency?: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic' | null;
}

export interface AwardsSection {
  type: 'awards';
  awards: AwardItem[];
}

export interface AwardItem {
  id: string;
  title?: string | null;
  associated_with?: string | null;
  offered_by?: string | null;
  date?: Date | null;
  description?: string | null;
  media_url?: string | null;
  skill_ids: string[];
}

export interface VolunteeringSection {
  type: 'volunteering';
  volunteering: VolunteeringItem[];
}

export interface VolunteeringItem {
  id: string;
  role?: string | null;
  institution?: string | null;
  cause?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  is_current?: boolean | null;
  description?: string | null;
  media_url?: string | null;
}

export interface AccomplishmentsSection {
  type: 'accomplishments';
  accomplishments: AccomplishmentItem[];
}

// API Response Types
export interface CandidateProfileResponse {
  success: boolean;
  message: string;
  data: {
    candidate_id: string;
    sections: CandidateProfileSection[];
    profile_summary: {
      total_experience_years: number;
      total_projects: number;
      total_certificates: number;
      total_skills: number;
      profile_completion_percentage: number;
      approval_status: 'pending' | 'approved' | 'rejected';
    };
  };
}

export interface CandidateProfileErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Array<{
    code: string;
    message: string;
    path: (string | number)[];
  }>;
}

// Job Designation Types
export interface JobDesignation {
  id: number;
  name: string;
  isco_08_unit: number;
  isco_08_major: number;
  isco_08_major_label: string;
}

export interface JobDesignationsResponse {
  success: boolean;
  data: JobDesignation[];
  message?: string;
}

// Industry Types (ISCO08)
export interface Industry {
  unit: number;
  description: string;
  major: number;
  major_label: string;
  sub_major: number;
  sub_major_label: string;
}

export interface IndustriesResponse {
  success: boolean;
  data: Industry[];
  message?: string;
}
