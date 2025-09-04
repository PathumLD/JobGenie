// Employer Approval Types

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface EmployerApprovalStatus {
  isCompanyComplete: boolean;
  approval_status: ApprovalStatus;
  message: string;
}

export interface EmployerApprovalResponse {
  success: boolean;
  isCompanyComplete: boolean;
  approval_status: ApprovalStatus;
  missingFields: string[];
  companyData?: CompanyProfileData;
  message: string;
  approval_notification_dismissed: boolean;
}

export interface CompanyProfileData {
  name: string | null;
  email: string | null;
  contact: string | null;
  industry: string | null;
  company_size: string | null;
  business_registration_no: string | null;
  business_registration_url: string | null;
  registered_address: string | null;
  founded_year: number | null;
  website: string | null;
  description: string | null;
}

export interface EmployerApprovalErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// MIS Approval Types
export interface ApproveCompanyRequest {
  companyId: string;
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

export interface CompanyStatusResponse {
  company: {
    id: string;
    name: string;
    approval_status: ApprovalStatus;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

