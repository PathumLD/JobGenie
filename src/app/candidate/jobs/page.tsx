'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OAuthHandler } from '@/components/auth/OAuthHandler';
import { useEffect, useState } from 'react';

export default function CandidateJobsPage() {
  const [shouldHandleOAuth, setShouldHandleOAuth] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [hasResumes, setHasResumes] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              
              // If profile is complete but not approved, show approval pending message
              if (profileData.isProfileComplete && profileData.approval_status === 'pending') {
                console.log('Profile complete but pending MIS approval');
                // Don't redirect, just show the message on the page
              }
              
              // If profile is complete, check for resumes regardless of approval status
              if (profileData.isProfileComplete) {
                await checkResumeExistence();
              }
            } else {
              console.error('Profile approval check failed:', profileData.message);
              // If check fails, assume profile is incomplete and redirect
              window.location.href = '/candidate/complete-profile';
              return;
            }
          } else {
            console.error('Profile approval check request failed');
            // If request fails, assume profile is incomplete and redirect
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

  const checkResumeExistence = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const resumeCheckResponse = await fetch('/api/candidate/resume/check-existence', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (resumeCheckResponse.ok) {
          const resumeData = await resumeCheckResponse.json();
          if (resumeData.success) {
            setHasResumes(resumeData.hasResumes);
            if (!resumeData.hasResumes) {
              // Candidate has no resumes, redirect to CV extraction page
              console.log('No resumes found, redirecting to CV extraction page');
              setTimeout(() => {
                window.location.href = '/candidate/cv-extraction';
              }, 2000);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking resume existence:', error);
    }
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

  // If profile is not complete, show loading (will redirect)
  if (isProfileComplete === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to complete profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-2">Find your next career opportunity</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Advanced Filters
        </Button>
      </div>

      {/* Approval Status Warning */}
      {isProfileComplete && approvalStatus === 'pending' && (
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
                  Your profile is complete but pending MIS approval. You can view jobs and update your profile, 
                  but you cannot apply for jobs until your profile is approved. Please wait for approval or contact support if you have questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV Requirement Warning */}
      {isProfileComplete && hasResumes === false && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-800">CV Required</h3>
                <p className="text-blue-700 mt-1">
                  You need to upload your CV to complete your profile setup. You will be redirected to the CV extraction page in a few seconds.
                </p>
                <div className="mt-3">
                  <a 
                    href="/candidate/cv-extraction" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to CV Extraction Now
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="w-48">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All Locations</option>
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            </div>
            <Button className="px-8 bg-emerald-600 hover:bg-emerald-700">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-0 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Job Type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Type</h4>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
                <div className="space-y-2">
                  {['Entry', 'Junior', 'Mid', 'Senior', 'Lead'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                <div className="space-y-2">
                  {['$0 - $50k', '$50k - $100k', '$100k - $150k', '$150k+'].map((range) => (
                    <label key={range} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="ml-2 text-sm text-gray-700">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Results */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {/* Sample Job Cards */}
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Senior Software Engineer
                      </h3>
                      <p className="text-gray-600 mb-3">
                        We are looking for a talented Senior Software Engineer to join our growing team...
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          San Francisco, CA
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                          </svg>
                          Full-time
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          $120k - $180k
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        className={`${
                          approvalStatus === 'approved' 
                            ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-50' 
                            : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={approvalStatus !== 'approved'}
                        onClick={() => {
                          if (approvalStatus !== 'approved') {
                            alert('Your profile must be approved by MIS before you can apply for jobs.');
                          } else {
                            // Navigate to job detail page for approved candidates
                            window.location.href = `/candidate/jobs/${index + 1}`; // Using index for demo, should use actual job ID
                          }
                        }}
                      >
                        {approvalStatus === 'approved' ? 'View & Apply' : 'Approval Required'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
