'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { 
  CompanyProfile, 
  CompanyProfileStatusResponse
} from '@/types/company-profile';
import type {
  BusinessRegistrationAnalysisResult,
  BusinessRegistrationAnalysisResponse
} from '@/types/business-registration-analysis';

export function CompanyProfileViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BusinessRegistrationAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setError('Company ID is required');
      setLoading(false);
      return;
    }

    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/mis/login');
          return;
        }

        const response = await fetch(`/api/mis/company-profile?companyId=${companyId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data: CompanyProfileStatusResponse = await response.json();

        if (!response.ok) {
          throw new Error('Failed to fetch company profile');
        }

        if (data.success && data.company) {
          setCompany(data.company);
        } else {
          throw new Error('Company profile not found');
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [companyId]);

  const handleCompanyAction = async (action: 'approve' | 'reject') => {
    if (!company) return;

    try {
      setActionLoading(true);
      setActionMessage(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/mis/login');
        return;
      }

      const response = await fetch(`/api/mis/company-verification?action=${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyId: company.id })
      });

      const result = await response.json();

      if (response.ok) {
        setActionMessage({
          type: 'success',
          text: result.message || `Company ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });

        // Update the company status locally
        setCompany(prev => prev ? {
          ...prev,
          approval_status: action === 'approve' ? 'approved' : 'rejected',
        } : null);

        // Clear message after 3 seconds
        setTimeout(() => {
          setActionMessage(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to process request');
      }
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentAnalysis = async () => {
    if (!company?.business_registration_url) return;

    try {
      setAnalysisLoading(true);
      setActionMessage(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/mis/login');
        return;
      }

      const response = await fetch('/api/mis/business-registration-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId: company.id,
          documentUrl: company.business_registration_url
        })
      });

      const result: BusinessRegistrationAnalysisResponse = await response.json();

      if (response.ok && result.success && result.result) {
        setAnalysisResult(result.result);
        setShowAnalysis(true);
        setActionMessage({
          type: 'success',
          text: 'Document analysis completed successfully'
        });

        // Clear message after 5 seconds
        setTimeout(() => {
          setActionMessage(null);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to analyze document');
      }
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred during analysis'
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getCompanySizeLabel = (size: string) => {
    const sizeLabels: Record<string, string> = {
      'startup': 'Startup (1-10 employees)',
      'one_to_ten': '1-10 employees',
      'eleven_to_fifty': '11-50 employees',
      'fifty_one_to_two_hundred': '51-200 employees',
      'two_hundred_one_to_five_hundred': '201-500 employees',
      'five_hundred_one_to_one_thousand': '501-1000 employees',
      'one_thousand_plus': '1000+ employees'
    };
    return sizeLabels[size] || size;
  };

  const getCompanyTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'startup': 'Startup',
      'corporation': 'Corporation',
      'agency': 'Agency',
      'non_profit': 'Non-Profit',
      'government': 'Government'
    };
    return typeLabels[type] || type;
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending Approval</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/mis/company-verification')}
              className="bg-red-600 hover:bg-red-700"
            >
              Back to Company Verification
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Company profile not found</p>
          <Button
            onClick={() => router.push('/mis/company-verification')}
            className="mt-4"
          >
            Back to Company Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Profile Review</h1>
              <p className="mt-2 text-gray-600">
                Review company profile for verification approval.
              </p>
            </div>
          </div>
        </div>

        {/* Action Messages */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            actionMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {actionMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Basic Information
                  {getApprovalStatusBadge(company.approval_status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  {company.logo_url && (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className="h-16 w-16 object-cover rounded-lg border border-gray-300 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-gray-600">{company.industry}</p>
                    <p className="text-gray-600 text-xs">{company.headquarters_location}</p>
                  </div>
                </div>
                
                {company.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">About Us</h4>
                    <p className="text-gray-700">{company.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Contact</h4>
                    <p className="text-gray-700">{company.contact || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-700">{company.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Website</h4>
                    <p className="text-gray-700">
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {company.website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Headquarters</h4>
                    <p className="text-gray-700">{company.headquarters_location || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Company Size</h4>
                    <p className="text-gray-700">{getCompanySizeLabel(company.company_size)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Company Type</h4>
                    <p className="text-gray-700">{getCompanyTypeLabel(company.company_type)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Founded Year</h4>
                    <p className="text-gray-700">{company.founded_year || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Business Registration</h4>
                    <p className="text-gray-700">{company.business_registration_no}</p>
                  </div>
                </div>

                {company.benefits && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Benefits & Perks</h4>
                    <p className="text-gray-700">{company.benefits}</p>
                  </div>
                )}

                {company.culture_description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company Culture</h4>
                    <p className="text-gray-700">{company.culture_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

                         {/* Business Registration Document */}
             {company.business_registration_url && (
               <Card>
                 <CardHeader>
                   <CardTitle>Business Registration Document</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                       <div className="flex items-center space-x-3">
                         <div className="flex-shrink-0">
                           <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                         </div>
                         <div>
                           <h4 className="text-sm font-medium text-gray-900">Business Registration Document</h4>
                           <p className="text-sm text-gray-500">Registration Number: {company.business_registration_no}</p>
                         </div>
                       </div>
                       <div className="flex space-x-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => window.open(company.business_registration_url, '_blank')}
                           className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                         >
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                           View Document
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             const link = document.createElement('a');
                             link.href = company.business_registration_url;
                             link.download = `business-registration-${company.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
                             document.body.appendChild(link);
                             link.click();
                             document.body.removeChild(link);
                           }}
                           className="border-blue-600 text-blue-600 hover:bg-blue-50"
                         >
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                           Download
                         </Button>
                         <Button
                           onClick={handleDocumentAnalysis}
                           disabled={analysisLoading}
                           className="bg-purple-600 hover:bg-purple-700 text-white"
                         >
                           {analysisLoading ? (
                             <LoadingSpinner size="sm" />
                           ) : (
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                             </svg>
                           )}
                           {analysisLoading ? 'Analyzing...' : 'Analize to verify'}
                         </Button>
                       </div>
                     </div>
                     
                     {/* Document Preview */}
                     <div className="border rounded-lg overflow-hidden">
                       <div className="bg-gray-100 px-4 py-2 border-b">
                         <h5 className="text-sm font-medium text-gray-700">Document Preview</h5>
                       </div>
                       <div className="h-96 bg-gray-50 flex items-center justify-center">
                         <iframe
                           src={company.business_registration_url}
                           className="w-full h-full border-0"
                           title="Business Registration Document"
                           onError={(e) => {
                             const target = e.target as HTMLIFrameElement;
                             target.style.display = 'none';
                             const parent = target.parentElement;
                             if (parent) {
                               parent.innerHTML = `
                                 <div class="flex flex-col items-center justify-center h-full text-gray-500">
                                   <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                   </svg>
                                   <p class="text-sm">Document preview not available</p>
                                   <p class="text-xs text-gray-400 mt-1">Click "View Document" to open in new tab</p>
                                 </div>
                               `;
                             }
                           }}
                         />
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* AI Analysis Results */}
             {showAnalysis && analysisResult && (
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <span>AI Document Analysis Results</span>
                     <div className="flex items-center space-x-2">
                       {(() => {
                         const status = analysisResult.overall_verification_status;
                         const statusClasses = status === 'verified' 
                           ? 'bg-green-100 text-green-800'
                           : status === 'needs_review'
                           ? 'bg-yellow-100 text-yellow-800'
                           : 'bg-red-100 text-red-800';
                         
                         return (
                           <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses}`}>
                             {status.replace('_', ' ').toUpperCase()}
                           </span>
                         );
                       })()}
                       <span className="text-sm text-gray-500">
                         {analysisResult.confidence_score}% Confidence
                       </span>
                     </div>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   {/* Analysis Summary */}
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
                     <p className="text-gray-700 text-sm">{analysisResult.analysis_summary}</p>
                   </div>

                   {/* Extracted Data */}
                   <div>
                     <h4 className="font-medium text-gray-900 mb-3">Extracted Document Data</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="font-medium text-gray-600">Company Name:</span>
                         <p className="text-gray-900">{analysisResult.extracted_data.company_name}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Registration Number:</span>
                         <p className="text-gray-900">{analysisResult.extracted_data.business_registration_number}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Registration Date:</span>
                         <p className="text-gray-900">{analysisResult.extracted_data.registration_date}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Business Type:</span>
                         <p className="text-gray-900">{analysisResult.extracted_data.business_type}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Industry:</span>
                         <p className="text-gray-900">{analysisResult.extracted_data.industry}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Company Status:</span>
                         <p className="text-gray-900">{analysisResult.extracted_data.company_status}</p>
                       </div>
                     </div>
                   </div>

                   {/* Comparison Results */}
                   <div>
                     <h4 className="font-medium text-gray-900 mb-3">Data Comparison</h4>
                     <div className="space-y-2">
                       {analysisResult.comparison_results.map((comparison) => (
                         <div key={`${comparison.field}-${comparison.match_status}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div className="flex-1">
                             <span className="font-medium text-gray-600 capitalize">
                               {comparison.field.replace('_', ' ')}:
                             </span>
                             <div className="text-sm text-gray-700 mt-1">
                               <div>Document: {comparison.document_value || 'Not found'}</div>
                               <div>Profile: {comparison.profile_value || 'Not provided'}</div>
                             </div>
                           </div>
                           <div className="flex items-center space-x-2">
                             {(() => {
                               const matchStatus = comparison.match_status;
                               const statusClasses = matchStatus === 'match' 
                                 ? 'bg-green-100 text-green-800'
                                 : matchStatus === 'mismatch'
                                 ? 'bg-red-100 text-red-800'
                                 : 'bg-yellow-100 text-yellow-800';
                               
                               return (
                                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses}`}>
                                   {matchStatus.replace('_', ' ')}
                                 </span>
                               );
                             })()}
                             <span className="text-xs text-gray-500">
                               {comparison.confidence_score}%
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Discrepancies */}
                   {analysisResult.discrepancies.length > 0 && (
                     <div>
                       <h4 className="font-medium text-gray-900 mb-3">Discrepancies Found</h4>
                       <div className="space-y-2">
                         {analysisResult.discrepancies.map((discrepancy) => (
                           <div key={`${discrepancy.field}-${discrepancy.severity}`} className={`p-3 rounded-lg border-l-4 ${
                             discrepancy.severity === 'high' 
                               ? 'bg-red-50 border-red-400'
                               : discrepancy.severity === 'medium'
                               ? 'bg-yellow-50 border-yellow-400'
                               : 'bg-blue-50 border-blue-400'
                           }`}>
                             <div className="flex items-start justify-between">
                               <div>
                                 <p className="font-medium text-gray-900">{discrepancy.field}</p>
                                 <p className="text-sm text-gray-700 mt-1">{discrepancy.issue}</p>
                                 <p className="text-xs text-gray-600 mt-1">{discrepancy.suggested_action}</p>
                               </div>
                               {(() => {
                                 const severity = discrepancy.severity;
                                 const severityClasses = severity === 'high' 
                                   ? 'bg-red-100 text-red-800'
                                   : severity === 'medium'
                                   ? 'bg-yellow-100 text-yellow-800'
                                   : 'bg-blue-100 text-blue-800';
                                 
                                 return (
                                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityClasses}`}>
                                     {severity}
                                   </span>
                                 );
                               })()}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Recommendations */}
                   {analysisResult.recommendations.length > 0 && (
                     <div>
                       <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                       <ul className="space-y-2">
                         {analysisResult.recommendations.map((recommendation) => (
                           <li key={recommendation} className="flex items-start space-x-2 text-sm text-gray-700">
                             <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             <span>{recommendation}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {/* Document Quality */}
                   <div>
                     <h4 className="font-medium text-gray-900 mb-3">Document Quality Assessment</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                       <div>
                         <span className="font-medium text-gray-600">Clarity:</span>
                         <p className="text-gray-900 capitalize">{analysisResult.document_quality.clarity}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Completeness:</span>
                         <p className="text-gray-900 capitalize">{analysisResult.document_quality.completeness}</p>
                       </div>
                       <div>
                         <span className="font-medium text-gray-600">Authenticity:</span>
                         <p className="text-gray-900">{analysisResult.document_quality.authenticity_indicators.join(', ')}</p>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Social Media Links */}
             {company.social_media_links && Object.values(company.social_media_links).some(link => link) && (
               <Card>
                 <CardHeader>
                   <CardTitle>Social Media</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="flex flex-wrap gap-4">
                     {Object.entries(company.social_media_links).map(([platform, url]) => {
                       if (!url) return null;
                       return (
                         <a
                           key={platform}
                           href={url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                         >
                           <span className="capitalize">{platform}</span>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                           </svg>
                         </a>
                       );
                     })}
                   </div>
                 </CardContent>
               </Card>
             )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Created</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    company.profile_created 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.profile_created ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification Status</span>
                  {getApprovalStatusBadge(company.approval_status)}
                </div>
                {company.verified_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verified At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(company.verified_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.approval_status !== 'approved' && (
                  <Button
                    onClick={() => handleCompanyAction('approve')}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" /> : 'Approve Company'}
                  </Button>
                )}
                {company.approval_status !== 'rejected' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCompanyAction('reject')}
                    disabled={actionLoading}
                    className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" /> : 'Reject Company'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push('/mis/company-verification')}
                  className="w-full"
                >
                  Back to Verification List
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
