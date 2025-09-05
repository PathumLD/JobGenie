'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ApprovalNotification } from '@/components/employer/ApprovalNotification';
import type { 
  CompanyProfile, 
  CompanyProfileStatusResponse
} from '@/types/company-profile';
import type { EmployerApprovalResponse } from '@/types/employer-approval';

export default function ViewCompanyProfilePage() {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApprovalNotification, setShowApprovalNotification] = useState(false);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/employer/login');
          return;
        }

        const response = await fetch('/api/employer/company/profile', {
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
          
          // Check for approval notification
          await checkApprovalStatus();
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

    const checkApprovalStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('/api/employer/company/approval-check', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const approvalData: EmployerApprovalResponse = await response.json();
          
          // Show approval notification if approved and not dismissed
          if (approvalData.approval_status === 'approved' && !approvalData.approval_notification_dismissed) {
            setShowApprovalNotification(true);
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    };

    fetchCompanyProfile();
  }, [router]);

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
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Approval Notification */}
        {showApprovalNotification && (
          <div className="mb-8">
            <ApprovalNotification 
              onDismiss={() => setShowApprovalNotification(false)} 
            />
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
              <p className="mt-2 text-gray-600">
                View and manage your company profile information.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/employer/company/profile/edit')}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

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
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className="h-16 w-16 object-cover rounded-lg border border-gray-300 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg border border-gray-300 flex-shrink-0 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
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

            {/* Quick Actions */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/employer/company/profile/edit')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/employer/jobs')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                  </svg>
                  Manage Jobs
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/employer/dashboard')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                  Dashboard
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
