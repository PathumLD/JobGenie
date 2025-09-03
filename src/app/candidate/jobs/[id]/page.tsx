'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OAuthHandler } from '@/components/auth/OAuthHandler';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  job_type: string;
  experience_level: string;
  location: string | null;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_type: string | null;
  equity_offered: boolean;
  ai_skills_required: boolean;
  application_deadline: string | null;
  status: string;
  published_at: string | null;
  priority_level: number;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  company: {
    id: string;
    name: string;
    email: string;
    industry: string;
    company_size: string;
    company_type: string;
    headquarters_location: string | null;
    description: string | null;
    logo_url: string | null;
    website: string | null;
    benefits: string | null;
    culture_description: string | null;
    founded_year: number | null;
    social_media_links: any;
    verification_status: string;
  } | null;
  customCompanyName: string | null;
  customCompanyEmail: string | null;
  customCompanyPhone: string | null;
  customCompanyWebsite: string | null;
  jobDesignation: {
    id: number;
    name: string;
    isco_08: {
      id: number;
      description: string;
      major: number;
      major_label: string;
      sub_major: number;
      sub_major_label: string;
      minor: number;
      minor_label: string;
      unit: number;
    };
  };
  skills: Array<{
    id: string;
    name: string;
    category: string | null;
    description: string | null;
    required_level: string;
    proficiency_level: string;
    years_required: number | null;
    weight: number;
  }>;
  creator_type: string;
  creator_mis_user: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

interface RelatedJob {
  id: string;
  title: string;
  company_name: string | null;
  customCompanyName: string | null;
  location: string | null;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  experience_level: string;
  job_type: string;
  created_at: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [shouldHandleOAuth, setShouldHandleOAuth] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkProfileAndOAuth = async () => {
      try {
        // Check if URL contains OAuth success parameters
        const urlParams = new URLSearchParams(window.location.search);
        const oauthSuccess = urlParams.get('oauth_success');
        const tempToken = urlParams.get('temp_token');
        const hasOAuthSuccess = oauthSuccess === 'true' && tempToken;
        setShouldHandleOAuth(!!hasOAuthSuccess);

        // Check profile completion and approval status
        const token = localStorage.getItem('access_token');
        if (token) {
          const profileCheckResponse = await fetch('/api/candidate/profile/profile-approval-check', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileCheckResponse.ok) {
            const profileData = await profileCheckResponse.json();
            if (profileData.success) {
              setIsProfileComplete(profileData.isProfileComplete);
              setApprovalStatus(profileData.approval_status);
              
              // If profile is incomplete, redirect to complete profile page
              if (!profileData.isProfileComplete) {
                console.log('Profile incomplete. Missing fields:', profileData.missingFields);
                window.location.href = '/candidate/complete-profile';
                return;
              }
            } else {
              console.error('Profile approval check failed:', profileData.message);
              window.location.href = '/candidate/complete-profile';
              return;
            }
          } else {
            console.error('Profile approval check request failed');
            window.location.href = '/candidate/complete-profile';
            return;
          }
        } else {
          // No token, redirect to login
          window.location.href = '/candidate/login';
          return;
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileAndOAuth();
  }, []);

  useEffect(() => {
    if (jobId && isProfileComplete) {
      fetchJobDetails();
    }
  }, [jobId, isProfileComplete]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/candidate/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
        setRelatedJobs(data.related_jobs);
      } else {
        console.error('Failed to fetch job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleApply = async () => {
    if (approvalStatus !== 'approved') {
      alert('Your profile must be approved by MIS before you can apply for jobs.');
      return;
    }

    if (!coverLetter.trim()) {
      alert('Please provide a cover letter for your application.');
      return;
    }

    setIsApplying(true);
    setApplicationStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/candidate/jobs/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          cover_letter: coverLetter.trim(),
        }),
      });

      if (response.ok) {
        setApplicationStatus('success');
        setCoverLetter('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to submit application');
        setApplicationStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrorMessage('Network error. Please try again.');
      setApplicationStatus('error');
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency || 'LKR'}`;
    if (min) return `${min.toLocaleString()}+ ${currency || 'LKR'}`;
    if (max) return `Up to ${max.toLocaleString()} ${currency || 'LKR'}`;
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Show loading state while checking profile
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile completion...</p>
        </div>
      </div>
    );
  }

  // If OAuth tokens are present, show the OAuth handler
  if (shouldHandleOAuth) {
    return <OAuthHandler />;
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Approval Status Warning */}
      {isProfileComplete && approvalStatus !== 'approved' && (
        <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Profile Pending Approval</h3>
                <p className="text-yellow-700 mt-1">
                  Your profile is complete but pending MIS approval. You can view job details and update your profile, 
                  but you cannot apply for jobs until your profile is approved. Please wait for approval or contact support if you have questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <span className="flex items-center space-x-2">
                <span>🏢</span>
                <span>{job.company?.name || job.customCompanyName || 'Company not specified'}</span>
              </span>
              {job.location && (
                <span className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>{job.location}</span>
                </span>
              )}
              <span className="flex items-center space-x-2">
                <span>💼</span>
                <span>{job.job_type.replace('_', ' ')}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center space-x-2">
                <span>🎯</span>
                <span>{job.experience_level}</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>💰</span>
                <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>🌐</span>
                <span>{job.remote_type}</span>
              </span>
            </div>
          </div>
          <div className="ml-6">
            <Button 
              size="lg"
              className={`${
                approvalStatus === 'approved' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={approvalStatus !== 'approved' || isApplying}
              onClick={handleApply}
            >
              {isApplying ? 'Applying...' : approvalStatus === 'approved' ? 'Apply Now' : 'Approval Required'}
            </Button>
          </div>
        </div>
      </div>

      {/* Application Status Messages */}
      {applicationStatus === 'success' && (
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-800">Application Submitted!</h3>
                <p className="text-green-700 mt-1">
                  Your job application has been submitted successfully. The employer will review your application and get back to you soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {applicationStatus === 'error' && (
        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800">Application Failed</h3>
                <p className="text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{skill.name}</h4>
                      <p className="text-sm text-gray-600">
                        {skill.required_level} • {skill.proficiency_level}
                        {skill.years_required && ` • ${skill.years_required} years`}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Weight: {skill.weight}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Form */}
          {approvalStatus === 'approved' && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Cover Letter</CardTitle>
                <p className="text-sm text-gray-600">
                  Write a compelling cover letter explaining why you're the perfect fit for this position.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tell us why you're interested in this role and what makes you a great candidate..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                <div className="mt-4">
                  <Button 
                    onClick={handleApply}
                    disabled={!coverLetter.trim() || isApplying}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isApplying ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Information */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.company ? (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900">{job.company.name}</h4>
                    <p className="text-sm text-gray-600">{job.company.industry}</p>
                  </div>
                  {job.company.headquarters_location && (
                    <div>
                      <h5 className="font-medium text-gray-700">Headquarters</h5>
                      <p className="text-sm text-gray-600">{job.company.headquarters_location}</p>
                    </div>
                  )}
                  {job.company.website && (
                    <div>
                      <h5 className="font-medium text-gray-700">Website</h5>
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-900">{job.customCompanyName}</h4>
                  {job.customCompanyWebsite && (
                    <div className="mt-2">
                      <a 
                        href={job.customCompanyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-700">Job Type</h5>
                <p className="text-sm text-gray-600">{job.job_type.replace('_', ' ')}</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Experience Level</h5>
                <p className="text-sm text-gray-600">{job.experience_level}</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Remote Type</h5>
                <p className="text-sm text-gray-600">{job.remote_type}</p>
              </div>
              {job.application_deadline && (
                <div>
                  <h5 className="font-medium text-gray-700">Application Deadline</h5>
                  <p className="text-sm text-gray-600">{formatDate(job.application_deadline)}</p>
                </div>
              )}
              <div>
                <h5 className="font-medium text-gray-700">Posted</h5>
                <p className="text-sm text-gray-600">{formatDate(job.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedJobs.map((relatedJob) => (
              <Card key={relatedJob.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {relatedJob.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {relatedJob.company_name || relatedJob.customCompanyName || 'Company not specified'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{relatedJob.location || 'Remote'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>💼</span>
                      <span>{relatedJob.job_type.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Posted {formatDate(relatedJob.created_at)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                      onClick={() => window.location.href = `/candidate/jobs/${relatedJob.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
