// Company Verification UI Types

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type CompanySize = 'startup' | 'one_to_ten' | 'eleven_to_fifty' | 'fifty_one_to_two_hundred' | 'two_hundred_one_to_five_hundred' | 'five_hundred_one_to_one_thousand' | 'one_thousand_plus';
export type CompanyType = 'startup' | 'corporation' | 'agency' | 'non_profit' | 'government';

export interface PendingCompany {
  id: string;
  name: string;
  email: string;
  contact: string | null;
  industry: string;
  company_size: CompanySize;
  company_type: CompanyType;
  headquarters_location: string | null;
  founded_year: number | null;
  website: string | null;
  business_registration_no: string;
  business_registration_url: string;
  registered_address: string;
  description: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  approval_status: ApprovalStatus;
  verified_at: Date | null;
}

export interface PendingCompaniesResponse {
  success: boolean;
  companies: PendingCompany[];
  total: number;
  message: string;
}

export interface CompanyVerificationAction {
  companyId: string;
  action: 'approve' | 'reject';
}

export interface BulkCompanyVerificationAction {
  companyIds: string[];
  action: 'approve' | 'reject';
}

export interface VerificationStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}

export interface CompanyTableFilters {
  search: string;
  industry: string;
  companySize: string;
  companyType: string;
  approvalStatus: ApprovalStatus;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface CompanyTableSort {
  field: keyof PendingCompany;
  direction: 'asc' | 'desc';
}

export interface CompanyApprovalResponse {
  message: string;
  company: {
    id: string;
    name: string;
    approval_status: ApprovalStatus;
    updated_at: Date | null;
  };
}

export interface ApiErrorResponse {
  error: string;
  details?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
  message?: string;
}
