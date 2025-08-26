// Database Types based on schema.prisma
// These types ensure type safety and follow the exact schema structure

export type UserType = 'candidate' | 'employer' | 'mis' | 'recruitment_agency'

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'

export type RemotePreference = 'remote_only' | 'hybrid' | 'onsite' | 'flexible'

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal'

export type AvailabilityStatus = 'available' | 'open_to_opportunities' | 'not_looking'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type PhoneType = 'mobile' | 'home' | 'work' | 'other'

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer'

export type LanguageProficiency = 'native' | 'fluent' | 'professional' | 'conversational' | 'basic'

export type CompanySize = 'startup' | 'one_to_ten' | 'eleven_to_fifty' | 'fifty_one_to_two_hundred' | 'two_hundred_one_to_five_hundred' | 'five_hundred_one_to_one_thousand' | 'one_thousand_plus'

export type CompanyType = 'startup' | 'corporation' | 'agency' | 'non_profit' | 'government'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'archived'

export type SalaryType = 'annual' | 'monthly' | 'weekly' | 'daily' | 'hourly'

export type CreatorType = 'mis_user' | 'employer'

export type AccessLevel = 'read_only' | 'analyst' | 'admin' | 'super_admin'

export type RequiredLevel = 'nice_to_have' | 'preferred' | 'required' | 'must_have'

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type ApplicationStatus = 'pending' | 'screening' | 'ai_assessment' | 'interview' | 'technical_test' | 'final_review' | 'offered' | 'accepted' | 'rejected' | 'withdrawn'

export type EmployerRole = 'recruiter' | 'hiring_manager' | 'hr_admin' | 'company_admin'

export type AgencyRole = 'recruiter' | 'account_manager' | 'agency_admin'

export type RemoteType = 'remote' | 'hybrid' | 'onsite'

export type InterviewType = 'phone_screening' | 'video_call' | 'ai_video' | 'technical' | 'behavioral' | 'final'

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export type Recommendation = 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire'

export type SalaryVisibility = 'confidential' | 'range_only' | 'exact' | 'negotiable'

export type WorkAuthorization = 'citizen' | 'permanent_resident' | 'work_visa' | 'requires_sponsorship' | 'other'

export type PreferredShift = 'day' | 'evening' | 'night' | 'rotating' | 'flexible'

export type WorkAvailability = 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'volunteer'

export type VerificationMethod = 'manual' | 'automated' | 'third_party' | 'document_upload'

export type SkillCategory = 'programming' | 'framework' | 'database' | 'devops' | 'design' | 'analytics' | 'marketing' | 'management' | 'language' | 'other'

export type RemoteWorkPreference = 'remote_only' | 'hybrid' | 'onsite' | 'flexible' | 'none'

// Base User interface
export interface User {
  id: string
  first_name: string | null
  last_name: string | null
  address: string | null
  phone1: string | null
  phone2: string | null
  email: string
  password: string | null
  role: UserType | null
  status: UserStatus | null
  email_verified: boolean | null
  email_verification_token: string | null
  verification_token_expires_at: Date | null
  password_reset_token: string | null
  password_reset_expires_at: Date | null
  provider: string | null
  provider_id: string | null
  last_login_at: Date | null
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
  is_created: boolean
}

// Candidate interface
export interface Candidate {
  user_id: string
  first_name: string | null
  last_name: string | null
  gender: Gender | null
  date_of_birth: Date | null
  title: string | null
  current_position: string | null
  industry: string | null
  bio: string | null
  about: string | null
  country: string | null
  city: string | null
  location: string | null
  address: string | null
  phone1: string | null
  phone2: string | null
  personal_website: string | null
  nic: string | null
  passport: string | null
  membership_no: string
  remote_preference: RemotePreference | null
  experience_level: ExperienceLevel | null
  years_of_experience: number | null
  expected_salary_min: number | null
  expected_salary_max: number | null
  currency: string | null
  profile_image_url: string | null
  availability_status: AvailabilityStatus | null
  availability_date: Date | null
  resume_url: string | null
  github_url: string | null
  linkedin_url: string | null
  professional_summary: string | null
  total_years_experience: number | null
  open_to_relocation: boolean | null
  willing_to_travel: boolean | null
  security_clearance: boolean | null
  disability_status: string | null
  veteran_status: string | null
  pronouns: string | null
  salary_visibility: SalaryVisibility | null
  notice_period: number | null
  work_authorization: WorkAuthorization | null
  visa_assistance_needed: boolean | null
  work_availability: WorkAvailability | null
  interview_ready: boolean | null
  pre_qualified: boolean | null
  profile_completion_percentage: number | null
  completedProfile: boolean | null
  saved_job: string[]
  saved_jobs_metadata: Record<string, unknown> | null
  created_at: Date | null
  updated_at: Date | null
}

// Employer interface
export interface Employer {
  user_id: string
  company_id: string
  first_name: string | null
  last_name: string | null
  address: string | null
  phone: string | null
  job_title: string | null
  department: string | null
  role: EmployerRole
  permissions: Record<string, unknown> | null
  is_verified: boolean
  is_primary_contact: boolean
  phone_extension: string | null
  created_at: Date
  updated_at: Date
}

// Company interface
export interface Company {
  id: string
  name: string
  email: string
  business_registration_no: string
  business_registration_url: string
  registered_address: string
  contact: string | null
  slug: string | null
  description: string | null
  website: string | null
  logo_url: string | null
  industry: string
  company_size: CompanySize
  headquarters_location: string | null
  founded_year: number | null
  company_type: CompanyType
  benefits: string | null
  culture_description: string | null
  social_media_links: Record<string, unknown> | null
  verification_status: VerificationStatus
  verified_at: Date | null
  created_at: Date
  updated_at: Date
}

// Job interface
export interface Job {
  id: string
  creator_id: string
  creator_type: CreatorType
  title: string
  description: string
  job_type: JobType
  experience_level: ExperienceLevel
  location: string | null
  remote_type: RemoteType
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  salary_type: SalaryType | null
  equity_offered: boolean
  ai_skills_required: boolean
  application_deadline: Date | null
  status: JobStatus
  published_at: Date | null
  priority_level: number
  views_count: number
  applications_count: number
  customCompanyName: string | null
  customCompanyEmail: string | null
  customCompanyPhone: string | null
  customCompanyWebsite: string | null
  custom_questions: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
  company_id: string | null
  jobDesignationId: number
}

// JobDesignation interface
export interface JobDesignation {
  id: number
  name: string
  iscoUnitGroupId: number
}

// IscoUnitGroup interface
export interface IscoUnitGroup {
  id: number
  code: string
  label: string
  minorId: number
}

// IscoMinorGroup interface
export interface IscoMinorGroup {
  id: number
  code: string
  label: string
  subMajorId: number
}

// IscoSubMajorGroup interface
export interface IscoSubMajorGroup {
  id: number
  code: string
  label: string
  majorGroupId: number
}

// IscoMajorGroup interface
export interface IscoMajorGroup {
  id: number
  code: string
  label: string
}

// Skill interface
export interface Skill {
  id: string
  name: string
  category: string | null
  description: string | null
  is_active: boolean | null
  created_at: Date | null
  updated_at: Date | null
}

// CandidateSkill interface
export interface CandidateSkill {
  id: string
  candidate_id: string
  skill_id: string
  skill_source: string | null
  proficiency: number | null
  years_of_experience: number | null
  source_title: string | null
  source_company: string | null
  source_institution: string | null
  source_authority: string | null
  source_type: string | null
  name: string | null
  created_at: Date | null
  updated_at: Date | null
}

// JobSkill interface
export interface JobSkill {
  id: string
  job_id: string
  skill_id: string
  required_level: RequiredLevel
  proficiency_level: ProficiencyLevel
  years_required: number | null
  weight: number
  created_at: Date
}

// WorkExperience interface
export interface WorkExperience {
  id: string
  candidate_id: string
  title: string | null
  employment_type: EmploymentType | null
  is_current: boolean | null
  company: string | null
  start_date: Date | null
  end_date: Date | null
  location: string | null
  description: string | null
  skill_ids: string[]
  media_url: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Education interface
export interface Education {
  id: string
  candidate_id: string
  degree_diploma: string | null
  university_school: string | null
  field_of_study: string | null
  description: string | null
  start_date: Date | null
  end_date: Date | null
  grade: string | null
  activities_societies: string | null
  skill_ids: string[]
  media_url: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Language interface
export interface Language {
  id: string
  candidate_id: string
  language: string | null
  is_native: boolean | null
  oral_proficiency: LanguageProficiency | null
  written_proficiency: LanguageProficiency | null
  created_at: Date | null
  updated_at: Date | null
}

// Certificate interface
export interface Certificate {
  id: string
  candidate_id: string
  name: string | null
  issuing_authority: string | null
  issue_date: Date | null
  expiry_date: Date | null
  credential_id: string | null
  credential_url: string | null
  description: string | null
  skill_ids: string[]
  media_url: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Project interface
export interface Project {
  id: string
  candidate_id: string
  name: string | null
  description: string | null
  start_date: Date | null
  end_date: Date | null
  is_current: boolean | null
  role: string | null
  responsibilities: string[]
  technologies: string[]
  tools: string[]
  methodologies: string[]
  is_confidential: boolean | null
  can_share_details: boolean | null
  url: string | null
  repository_url: string | null
  media_urls: string[]
  skills_gained: string[]
  created_at: Date | null
  updated_at: Date | null
}

// Volunteering interface
export interface Volunteering {
  id: string
  candidate_id: string
  role: string | null
  institution: string | null
  cause: string | null
  start_date: Date | null
  end_date: Date | null
  is_current: boolean | null
  description: string | null
  media_url: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Award interface
export interface Award {
  id: string
  candidate_id: string
  title: string | null
  associated_with: string | null
  offered_by: string | null
  date: Date | null
  description: string | null
  media_url: string | null
  skill_ids: string[]
  created_at: Date | null
  updated_at: Date | null
}

// Resume interface
export interface Resume {
  id: string
  candidate_id: string
  is_allow_fetch: boolean | null
  resume_url: string | null
  original_filename: string | null
  file_size: number | null
  file_type: string | null
  is_primary: boolean | null
  uploaded_at: Date | null
  created_at: Date | null
  updated_at: Date | null
}

// Accomplishment interface
export interface Accomplishment {
  id: string
  candidate_id: string
  work_experience_id: string | null
  resume_id: string | null
  title: string | null
  description: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Application interface
export interface Application {
  id: string
  job_id: string
  candidate_id: string
  resume_id: string | null
  status: ApplicationStatus
  applied_at: Date
  cover_letter: string | null
  ai_match_score: number | null
  skill_match_percentage: number | null
  experience_match_score: number | null
  ai_readiness_match: number | null
  overall_fit_score: number | null
  recruiter_notes: string | null
  candidate_notes: string | null
  interview_scheduled_at: Date | null
  interview_completed_at: Date | null
  offer_extended_at: Date | null
  offer_accepted_at: Date | null
  rejection_reason: string | null
  rejected_at: Date | null
  withdrawn_at: Date | null
  source: string | null
  referral_source: string | null
  created_at: Date
  updated_at: Date
}

// ApplicationSnapshot interface
export interface ApplicationSnapshot {
  id: string
  application_id: string
  candidate_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  location: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  personal_website: string | null
  bio: string | null
  about: string | null
  professional_summary: string | null
  title: string | null
  current_position: string | null
  industry: string | null
  years_of_experience: number | null
  total_years_experience: number | null
  experience_level: ExperienceLevel | null
  resume_url: string | null
  cover_letter: string | null
  custom_message: string | null
  salary_expectation_min: number | null
  salary_expectation_max: number | null
  currency: string | null
  availability_date: Date | null
  willing_to_relocate: boolean | null
  notice_period: number | null
  work_authorization: WorkAuthorization | null
  visa_assistance_needed: boolean | null
  remote_preference: RemotePreference | null
  custom_answers: Record<string, unknown> | null
  created_at: Date | null
}

// ApplicationDocument interface
export interface ApplicationDocument {
  id: string
  application_id: string
  document_type: string
  document_url: string
  original_filename: string | null
  file_size: number | null
  file_type: string | null
  uploaded_at: Date | null
}

// Interview interface
export interface Interview {
  id: string
  application_id: string
  interviewer_id: string | null
  interview_type: InterviewType
  status: InterviewStatus
  scheduled_at: Date
  duration_minutes: number
  meeting_link: string | null
  meeting_id: string | null
  ai_conducted: boolean
  ai_analysis: Record<string, unknown> | null
  interview_notes: string | null
  technical_assessment_data: Record<string, unknown> | null
  behavioral_scores: Record<string, unknown> | null
  communication_score: number | null
  technical_score: number | null
  cultural_fit_score: number | null
  overall_rating: number | null
  recommendation: Recommendation | null
  feedback_for_candidate: string | null
  recording_url: string | null
  transcript: string | null
  started_at: Date | null
  completed_at: Date | null
  created_at: Date
  updated_at: Date
}

// JobView interface
export interface JobView {
  id: string
  job_id: string
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  referrer_url: string | null
  viewed_at: Date
}

// SavedJob interface
export interface SavedJob {
  id: string
  candidate_id: string
  job_id: string
  saved_at: Date
  notes: string | null
  created_at: Date
  updated_at: Date
}

// MisUser interface
export interface MisUser {
  user_id: string
  access_level: AccessLevel
  department: string | null
  reporting_to: string | null
  data_access_scopes: Record<string, unknown> | null
  job_posting_permissions: boolean
  can_post_for_all_companies: boolean
  max_active_jobs: number
  created_at: Date
  updated_at: Date
}

// MisCompanyAccess interface
export interface MisCompanyAccess {
  id: string
  mis_user_id: string
  company_id: string
  can_create_jobs: boolean
  can_manage_jobs: boolean
  created_at: Date
  updated_at: Date
}

// RecruitmentAgency interface
export interface RecruitmentAgency {
  user_id: string
  agency_id: string
  role: AgencyRole
  specialization: string | null
  clients: Record<string, unknown> | null
  commission_rate: number | null
  created_at: Date
  updated_at: Date
}

// Extended interfaces with relationships
export interface UserWithProfile extends User {
  candidate?: Candidate | null
  employer?: Employer | null
  mis_user?: MisUser | null
  recruitment_agency?: RecruitmentAgency | null
}

export interface CandidateWithDetails extends Candidate {
  user: User
  skills: CandidateSkill[]
  work_experiences: WorkExperience[]
  educations: Education[]
  languages: Language[]
  certificates: Certificate[]
  projects: Project[]
  volunteering: Volunteering[]
  awards: Award[]
  resumes: Resume[]
  accomplishments: Accomplishment[]
  applications: Application[]
  saved_jobs: SavedJob[]
}

export interface JobWithDetails extends Job {
  company?: Company | null
  skills: JobSkill[]
  applications: Application[]
  saved_by: SavedJob[]
  views: JobView[]
  jobDesignation: JobDesignation
}

export interface CompanyWithDetails extends Company {
  employers: Employer[]
  jobs: Job[]
  mis_access: MisCompanyAccess[]
  recruitment_agencies: RecruitmentAgency[]
}

export interface ApplicationWithDetails extends Application {
  candidate: Candidate
  job: Job
  resume?: Resume | null
  interviews: Interview[]
  snapshot?: ApplicationSnapshot | null
  documents: ApplicationDocument[]
}

export interface InterviewWithDetails extends Interview {
  application: Application
  interviewer?: User | null
}

// Form interfaces for API requests
export interface CandidateRegistrationForm {
  first_name: string
  last_name: string
  nic: string
  passport?: string
  gender?: Gender
  date_of_birth: string // ISO date string
  address: string
  phone: string
  email: string
  password: string
  confirm_password: string
}

export interface EmployerRegistrationForm {
  company_name: string
  business_registration_no: string
  business_registration_certificate: File
  business_registered_address: string
  industry: string
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string
}

export interface JobPostingForm {
  title: string
  description: string
  job_type: JobType
  experience_level: ExperienceLevel
  location?: string
  remote_type: RemoteType
  salary_min?: number
  salary_max?: number
  currency?: string
  salary_type?: SalaryType
  equity_offered?: boolean
  ai_skills_required?: boolean
  application_deadline?: string // ISO date string
  skills: Array<{
    skill_id: string
    required_level: RequiredLevel
    proficiency_level: ProficiencyLevel
    years_required?: number
    weight?: number
  }>
  jobDesignationId: number
}

export interface ApplicationForm {
  job_id: string
  resume_id?: string
  cover_letter?: string
  custom_answers?: Record<string, string>
  salary_expectation_min?: number
  salary_expectation_max?: number
  currency?: string
  availability_date?: string // ISO date string
  willing_to_relocate?: boolean
  notice_period?: number
  work_authorization?: WorkAuthorization
  visa_assistance_needed?: boolean
  remote_preference?: RemotePreference
}

// Search and filter interfaces
export interface JobSearchFilters {
  query?: string
  location?: string
  remote_type?: RemoteType[]
  job_type?: JobType[]
  experience_level?: ExperienceLevel[]
  salary_min?: number
  salary_max?: number
  skills?: string[]
  company_id?: string
  status?: JobStatus[]
}

export interface CandidateSearchFilters {
  query?: string
  location?: string
  experience_level?: ExperienceLevel[]
  skills?: string[]
  availability_status?: AvailabilityStatus[]
  remote_preference?: RemotePreference[]
  salary_min?: number
  salary_max?: number
  work_authorization?: WorkAuthorization[]
}

// Pagination interface
export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
  statusCode?: number
}

// Dashboard interfaces
export interface DashboardStats {
  total_jobs: number
  total_candidates: number
  total_applications: number
  total_companies: number
  active_jobs: number
  pending_applications: number
  interviews_scheduled: number
  recent_activities: Array<{
    id: string
    type: string
    description: string
    timestamp: Date
    user_id?: string
    entity_id?: string
  }>
}

export interface CandidateDashboardData {
  profile_completion: number
  applications_count: number
  saved_jobs_count: number
  interviews_count: number
  recent_applications: ApplicationWithDetails[]
  recommended_jobs: JobWithDetails[]
  profile_views: number
  last_profile_update: Date | null
}

export interface EmployerDashboardData {
  active_jobs_count: number
  total_applications: number
  pending_reviews: number
  interviews_scheduled: number
  recent_applications: ApplicationWithDetails[]
  job_performance: Array<{
    job_id: string
    job_title: string
    views: number
    applications: number
    avg_match_score: number
  }>
  company_stats: {
    total_jobs_posted: number
    total_hires: number
    avg_time_to_fill: number
  }
}
