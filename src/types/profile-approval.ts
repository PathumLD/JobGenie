// Profile Approval Types

export interface ProfileApprovalStatus {
  isProfileComplete: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  message: string;
}

export interface ProfileApprovalResponse {
  success: boolean;
  isProfileComplete: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  missingFields: string[];
  candidateData?: CandidateProfileData;
  message: string;
}

export interface CandidateProfileData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  nic: string | null;
  gender: string | null;
  date_of_birth: Date | null;
  address: string | null;
  phone: string | null;
}

export interface ProfileApprovalErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// MIS Approval Types
export interface ApproveCandidateRequest {
  candidateId: string;
}

export interface CandidateApprovalResponse {
  message: string;
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    approval_status: 'pending' | 'approved' | 'rejected';
    updated_at: Date | null;
  };
}

export interface CandidateStatusResponse {
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: Date | null;
    updated_at: Date | null;
  };
}

export interface ApiErrorResponse {
  error: string;
}
