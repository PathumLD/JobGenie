export interface BusinessRegistrationData {
  company_name: string;
  business_registration_number: string;
  registration_date: string;
  business_type: string;
  industry: string;
  registered_address: string;
  business_activities: string[];
  authorized_capital: string | null;
  paid_up_capital: string | null;
  directors: Array<{
    name: string;
    designation: string;
    address: string | null;
  }>;
  shareholders: Array<{
    name: string;
    share_percentage: string | null;
    share_value: string | null;
  }>;
  company_status: string;
  expiry_date: string | null;
  issuing_authority: string;
  document_type: string;
  document_verification_status: 'verified' | 'unverified' | 'expired' | 'invalid';
}

export interface CompanyDataComparison {
  field: string;
  document_value: string | null;
  profile_value: string | null;
  match_status: 'match' | 'mismatch' | 'missing_in_document' | 'missing_in_profile';
  confidence_score: number; // 0-100
  notes: string | null;
}

export interface BusinessRegistrationAnalysisResult {
  success: boolean;
  extracted_data: BusinessRegistrationData;
  comparison_results: CompanyDataComparison[];
  overall_verification_status: 'verified' | 'needs_review' | 'failed';
  confidence_score: number; // 0-100
  analysis_summary: string;
  recommendations: string[];
  discrepancies: Array<{
    field: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggested_action: string;
  }>;
  document_quality: {
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
    completeness: 'complete' | 'partial' | 'incomplete';
    authenticity_indicators: string[];
  };
}

export interface BusinessRegistrationAnalysisRequest {
  companyId: string;
  documentUrl: string;
  forceReanalysis?: boolean;
}

export interface BusinessRegistrationAnalysisResponse {
  success: boolean;
  result?: BusinessRegistrationAnalysisResult;
  error?: string;
  message?: string;
}

export interface BusinessRegistrationAnalysisError {
  error: string;
  details?: string;
  code?: string;
}
