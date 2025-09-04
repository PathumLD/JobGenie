'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SavedCandidateResults } from '@/components/employer/SavedCandidateResults';

interface SavedCandidate {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  years_of_experience: number | null;
  total_years_experience: number | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string | null;
  experience_level: string | null;
  availability_status: string | null;
  country: string | null;
  city: string | null;
  location: string | null;
  profile_image_url: string | null;
  professional_summary: string | null;
  created_at: Date | null;
  date_of_birth: Date | null;
  educations: Array<{
    degree_diploma: string | null;
    field_of_study: string | null;
    university_school: string | null;
  }>;
  skills: Array<{
    name: string;
    proficiency: number | null;
  }>;
  work_experiences: Array<{
    title: string | null;
    company: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
  }>;
}

interface SavedCandidatesResponse {
  success: boolean;
  candidates: SavedCandidate[];
  total: number;
  message: string;
}

export default function SavedCandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const fetchSavedCandidates = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        router.push('/employer/login');
        return;
      }

      const response = await fetch(`/api/employer/candidates/saved?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: SavedCandidatesResponse = await response.json();
        setCandidates(data.candidates);
        setPagination({
          total: data.total,
          page: page,
          totalPages: Math.ceil(data.total / 10)
        });
        setError('');
      } else {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/employer/login');
          return;
        }
        throw new Error('Failed to fetch saved candidates');
      }
    } catch (error) {
      console.error('Error fetching saved candidates:', error);
      setError('Failed to load saved candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCandidates();
  }, []);

  const handlePageChange = (page: number) => {
    fetchSavedCandidates(page);
  };

  const handleViewProfile = (candidateId: string) => {
    // Navigate to candidate profile view
    router.push(`/employer/candidate/profile/${candidateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Candidates</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => fetchSavedCandidates()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Candidates</h1>
              <p className="mt-2 text-gray-600">
                Candidates you have selected for interviews
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/employer/candidate/find')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find More Candidates
              </button>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <SavedCandidateResults
          candidates={candidates}
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
          loading={loading}
          onPageChange={handlePageChange}
          onViewProfile={handleViewProfile}
        />
      </div>
    </div>
  );
}
