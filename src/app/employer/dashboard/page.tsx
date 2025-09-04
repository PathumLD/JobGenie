'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface EmployerData {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  company_id: string;
  role?: string | null;
  is_primary_contact: boolean;
}

interface CompanyData {
  id: string;
  name?: string | null;
  industry?: string | null;
  verification_status?: string | null;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [employerData, setEmployerData] = useState<EmployerData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        // Get the access token from localStorage
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/employer/login');
          return;
        }

        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid, redirect to login
            localStorage.removeItem('access_token');
            router.push('/employer/login');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        
        if (data.user_type !== 'employer') {
          router.push('/employer/login');
          return;
        }

        setEmployerData(data.profile);
        setCompanyData(data.company);
      } catch (error) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployerData();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Clear the access token from localStorage
      localStorage.removeItem('access_token');
      
      // Call logout API (optional, for server-side cleanup)
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to login page
      router.push('/employer/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, still redirect to login
      router.push('/employer/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!employerData || !companyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available</p>
          <Button onClick={() => router.push('/employer/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Company Information Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{companyData.name || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Industry</dt>
                  <dd className="mt-1 text-sm text-gray-900">{companyData.industry || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      companyData.verification_status === 'verified' 
                        ? 'bg-green-100 text-green-800'
                        : companyData.verification_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {companyData.verification_status 
                        ? companyData.verification_status.charAt(0).toUpperCase() + companyData.verification_status.slice(1)
                        : 'Unknown'
                      }
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Your Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {employerData.role 
                      ? employerData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not specified'
                    }
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-24 flex flex-col items-center justify-center">
                  <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.815-8.964-2.222m2.964 2.222A23.931 23.931 0 0012 15c3.183 0 6.22-.815 8.964-2.222m2.964-2.222A23.931 23.931 0 0012 12c-3.183 0-6.22.815-8.964 2.222m2.964 2.222A23.931 23.931 0 0112 12c3.183 0 6.22.815 8.964 2.222" />
                  </svg>
                  <span>Post New Job</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>View Applications</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
