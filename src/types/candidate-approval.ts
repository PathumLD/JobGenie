// Candidate Approval UI Types

export interface PendingCandidate {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  nic: string | null;
  phone1: string | null;
  phone2: string | null;
  address: string | null;
  gender: string | null;
  date_of_birth: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  profile_completion_percentage: number | null;
  completedProfile: boolean | null;
}

export interface PendingCandidatesResponse {
  success: boolean;
  candidates: PendingCandidate[];
  total: number;
  message: string;
}

export interface CandidateApprovalAction {
  candidateId: string;
  action: 'approve' | 'reject';
}

export interface BulkCandidateApprovalAction {
  candidateIds: string[];
  action: 'approve' | 'reject';
}

export interface ApprovalStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}

export interface TableFilters {
  search: string;
  gender: string;
  profileCompletion: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface TableSort {
  field: keyof PendingCandidate;
  direction: 'asc' | 'desc';
}
