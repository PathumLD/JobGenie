// Company Profile Types

export type CompanySize = 'startup' | 'one_to_ten' | 'eleven_to_fifty' | 'fifty_one_to_two_hundred' | 'two_hundred_one_to_five_hundred' | 'five_hundred_one_to_one_thousand' | 'one_thousand_plus';
export type CompanyType = 'startup' | 'corporation' | 'agency' | 'non_profit' | 'government';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  contact: string | null;
  slug: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  industry: string;
  company_size: CompanySize;
  headquarters_location: string | null;
  founded_year: number | null;
  company_type: CompanyType;
  benefits: string | null;
  culture_description: string | null;
  social_media_links: Record<string, string> | null;
  approval_status: ApprovalStatus;
  verified_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  business_registration_no: string;
  business_registration_url: string;
  registered_address: string;
  profile_created: boolean;
  approval_notification_dismissed: boolean | null;
}

export interface CompanyProfileFormData {
  name: string; // Read-only, displayed but not editable
  contact: string;
  description: string;
  website: string;
  headquarters_location: string;
  founded_year: number | null;
  company_size: CompanySize;
  company_type: CompanyType;
  slug: string;
  industry: string;
  logo?: File; // Logo file for upload
  social_media_links: {
    linkedin?: string;
  };
}

export interface CompanyProfileResponse {
  success: boolean;
  company: CompanyProfile;
  message: string;
}

export interface CompanyProfileErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

export interface CompanyProfileStatusResponse {
  success: boolean;
  profile_created: boolean;
  company: CompanyProfile | null;
  message: string;
}

export interface CompanyProfileUpdateResponse {
  success: boolean;
  company: CompanyProfile;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface CompanySizeOption {
  value: CompanySize;
  label: string;
}

export interface CompanyTypeOption {
  value: CompanyType;
  label: string;
}
