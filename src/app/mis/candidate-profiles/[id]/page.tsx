'use client';

import React, { useEffect, useState, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CandidateProfileResponse, BasicInfoSection } from '@/types/candidate-profile';
import { authenticatedFetch } from '@/lib/auth-storage';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { MisProfileSection } from '@/components/mis/MisProfileSection';

interface CandidateProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [profileData, setProfileData] = useState<CandidateProfileResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    message: string | null;
  }>({
    loading: false,
    success: false,
    error: null,
    message: null
  });

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState<{
    id: string;
    candidate_id: string;
    resume_url: string | null;
    original_filename: string | null;
    file_size: number | null;
    file_type: string | null;
    is_primary: boolean | null;
    uploaded_at: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
  } | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const response = await authenticatedFetch(`/api/mis/candidate-profiles?candidateId=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.data);
      } else {
        if (data.error === 'UNAUTHORIZED') {
          setError('You are not authorized to view this profile.');
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      }
    } catch (err) {
      setError('Failed to fetch profile data');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Fetch candidate resume
  const fetchResume = async () => {
    try {
      setResumeLoading(true);
      setResumeError(null);
      
      const response = await fetch(`/api/mis/candidate-resumes?candidateId=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setResumeData(data.data.resume);
      } else {
        setResumeError(data.error || 'Failed to fetch resume');
      }
    } catch (err) {
      setResumeError('Failed to fetch resume data');
      console.error('Error fetching resume:', err);
    } finally {
      setResumeLoading(false);
    }
  };

  // Handle candidate approval/rejection
  const handleCandidateAction = async (candidateId: string, action: 'approve' | 'reject') => {
    try {
      setApprovalStatus({
        loading: true,
        success: false,
        error: null,
        message: null
      });

      const response = await fetch(`/api/mis/candidate-approval?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ candidateId })
      });

      const result = await response.json();

      if (response.ok) {
        setApprovalStatus({
          loading: false,
          success: true,
          error: null,
          message: result.message
        });

        // Refresh the profile data to get updated approval status
        fetchProfile();

        // Clear message after 3 seconds
        setTimeout(() => {
          setApprovalStatus(prev => ({ ...prev, message: null }));
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to process request');
      }
    } catch (error) {
      setApprovalStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        message: null
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The candidate profile could not be found.</p>
          <Button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const basicInfoSection = profileData.sections.find(s => s.data.type === 'basic_info');
  const basicInfo = basicInfoSection?.data as BasicInfoSection;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
                <p className="text-gray-600 mt-2">View candidate information and experience</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  fetchResume();
                  setShowResumeModal(true);
                }}
              >
                <Eye size={16} />
                View Resume
              </Button>
              
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {approvalStatus.message && (
          <div className={`p-4 rounded-lg mb-6 ${
            approvalStatus.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {approvalStatus.message}
          </div>
        )}

        {approvalStatus.error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 mb-6">
            {approvalStatus.error}
          </div>
        )}

        {/* Profile Overview */}
        <div className="mb-8">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                {/* Profile Photo Section */}
                <div className="flex-shrink-0 text-center lg:text-left">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {basicInfo?.profile_image_url ? (
                      <img 
                        src={basicInfo.profile_image_url} 
                        alt={`${basicInfo.first_name} ${basicInfo.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-gray-600 font-semibold">
                        {basicInfo?.first_name?.[0]}{basicInfo?.last_name?.[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <h3 className="text-3xl font-bold text-gray-900">
                      {basicInfo?.first_name} {basicInfo?.last_name}
                    </h3>
                    {basicInfo?.title && (
                      <p className="text-sm text-gray-600 mb-1">{basicInfo.title}</p>
                    )}
                    {basicInfo?.current_position && (
                      <p className="text-gray-600 mb-1">{basicInfo.current_position}</p>
                    )}
                    {basicInfo?.industry && (
                      <p className="text-gray-500">{basicInfo.industry}</p>
                    )}
                  </div>

                  {/* Professional Summary */}
                  {basicInfo?.professional_summary && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {basicInfo.professional_summary}
                      </p>
                    </div>
                  )}

                  {/* Contact & Location Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Email */}
                    {basicInfo?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.9" />
                        </svg>
                        <span>{basicInfo.email}</span>
                      </div>
                    )}
                    
                    {/* Phone Numbers */}
                    {basicInfo?.phone1 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{basicInfo.phone1}</span>
                      </div>
                    )}
                    
                    {basicInfo?.phone2 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{basicInfo.phone2} (Alt)</span>
                      </div>
                    )}
                    
                    {/* Gender */}
                    {basicInfo?.gender && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{basicInfo.gender.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </div>
                    )}
                    
                    {/* Membership Number */}
                    {basicInfo?.membership_no && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Membership No: {basicInfo.membership_no}</span>
                      </div>
                    )}
                    
                    {/* Location */}
                    {basicInfo?.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{basicInfo.location}</span>
                      </div>
                    )}
                    
                    {/* Years of Experience */}
                    {basicInfo?.years_of_experience && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                        </svg>
                        <span>{basicInfo.years_of_experience} years of experience</span>
                      </div>
                    )}
                    
                    {/* Experience Level */}
                    {basicInfo?.experience_level && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{basicInfo.experience_level.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </div>
                    )}
                    
                    {/* Availability Status */}
                    {basicInfo?.availability_status && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Status: {basicInfo.availability_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Media Links */}
                  {(basicInfo?.linkedin_url || basicInfo?.github_url || basicInfo?.personal_website) && (
                    <div className="flex gap-3 mb-4 pt-4 border-t border-gray-200">
                      {basicInfo.linkedin_url && (
                        <a 
                          href={basicInfo.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {basicInfo.github_url && (
                        <a 
                          href={basicInfo.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                          title="GitHub"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {basicInfo.personal_website && (
                        <a 
                          href={basicInfo.personal_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                          title="Personal Website"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {profileData.sections
            .filter(section => section.data.type !== 'basic_info')
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <MisProfileSection key={section.id} section={section} />
            ))}
        </div>

            {/* Approval Actions */}
          <div className="flex justify-end gap-4 my-6">
            {basicInfo?.approval_status === 'approved' ? (
              <Button
                variant="outline"
                onClick={() => handleCandidateAction(id, 'reject')}
                disabled={approvalStatus.loading}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Reject Candidate
              </Button>
            ) : basicInfo?.approval_status === 'rejected' ? (
              <Button
                onClick={() => handleCandidateAction(id, 'approve')}
                disabled={approvalStatus.loading}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Approve Candidate
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleCandidateAction(id, 'reject')}
                  disabled={approvalStatus.loading}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Reject Candidate
                </Button>
                <Button
                  onClick={() => handleCandidateAction(id, 'approve')}
                  disabled={approvalStatus.loading}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Approve Candidate
                </Button>
              </>
            )}
          </div>

        {/* Resume Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {resumeData?.original_filename || 'Resume'} - {basicInfo?.first_name} {basicInfo?.last_name}
                  </h3>
                  {resumeData && (
                    <p className="text-sm text-gray-500 mt-1">
                      {resumeData.file_size ? `${(resumeData.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • 
                      {resumeData.file_type || 'Unknown type'} • 
                      {resumeData.is_primary ? 'Primary' : 'Secondary'} resume
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {resumeData?.resume_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resumeData.resume_url!, '_blank')}
                    >
                      Open in New Tab
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResumeModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                {resumeLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                    <span className="ml-3 text-gray-600">Loading resume...</span>
                  </div>
                ) : resumeError ? (
                  <div className="text-center py-12">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Resume</h3>
                    <p className="text-gray-600 mb-4">{resumeError}</p>
                    <Button 
                      onClick={() => {
                        setResumeError(null);
                        fetchResume();
                      }}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : resumeData?.resume_url ? (
                  <div className="w-full h-full">
                    {resumeData.file_type === 'application/pdf' ? (
                      <iframe
                        src={resumeData.resume_url!}
                        className="w-full h-[600px] border border-gray-200 rounded"
                        title="Resume Preview"
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Preview Not Available</h3>
                        <p className="text-gray-600 mb-4">
                          This file type ({resumeData.file_type || 'Unknown'}) cannot be previewed directly.
                        </p>
                        <Button
                          onClick={() => window.open(resumeData.resume_url!, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Download & View
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Resume Available</h3>
                    <p className="text-gray-600 mb-4">
                      This candidate doesn't have any resumes uploaded yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
