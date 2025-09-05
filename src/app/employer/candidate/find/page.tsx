'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CandidateFilter } from '@/components/employer/CandidateFilter';
import { CandidateResults } from '@/components/employer/CandidateResults';

interface FilterCriteria {
  field: string;
  designation: string;
  salary_min: string;
  salary_max: string;
  years_of_experience: string;
  qualification: string;
}

interface FilteredCandidate {
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

interface CandidateSearchResponse {
  success: boolean;
  candidates: FilteredCandidate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  message: string;
}

export default function FindCandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<FilteredCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const searchCandidates = async (criteria: FilterCriteria, page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      
      if (criteria.field) params.append('field', criteria.field);
      if (criteria.designation) params.append('designation', criteria.designation);
      if (criteria.salary_min) params.append('salary_min', criteria.salary_min);
      if (criteria.salary_max) params.append('salary_max', criteria.salary_max);
      if (criteria.years_of_experience) params.append('years_of_experience', criteria.years_of_experience);
      if (criteria.qualification) params.append('qualification', criteria.qualification);
      
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/employer/candidates/filter?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: CandidateSearchResponse = await response.json();
        setCandidates(data.candidates);
        setPagination({
          total: data.total,
          page: data.page,
          totalPages: data.total_pages
        });
        setSearchPerformed(true);
      } else {
        console.error('Failed to search candidates');
        setCandidates([]);
        setPagination({ total: 0, page: 1, totalPages: 0 });
        setSearchPerformed(true);
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
      setCandidates([]);
      setPagination({ total: 0, page: 1, totalPages: 0 });
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (criteria: FilterCriteria) => {
    searchCandidates(criteria, 1);
  };

  const handleClear = () => {
    setCandidates([]);
    setPagination({ total: 0, page: 1, totalPages: 0 });
    setSearchPerformed(false);
  };

  const handlePageChange = (newPage: number) => {
    // For now, we'll need to store the last search criteria
    // In a real implementation, you might want to store this in state or context
    // For simplicity, we'll just search with the current page
    searchCandidates({} as FilterCriteria, newPage);
  };

  const handleViewProfile = (candidateId: string) => {
    // Navigate to candidate profile view
    router.push(`/employer/candidate/${candidateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Candidates</h1>
            <p className="mt-2 text-gray-600">
              Search and filter through our talent pool to find the perfect candidates for your open positions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <CandidateFilter
                onFilter={handleFilter}
                onClear={handleClear}
                loading={loading}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              {!searchPerformed ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to find great talent?</h3>
                  <p className="text-gray-500">
                    Use the filters on the left to search for candidates that match your requirements.
                  </p>
                </div>
              ) : (
                <CandidateResults
                  candidates={candidates}
                  total={pagination.total}
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  loading={loading}
                  onPageChange={handlePageChange}
                  onViewProfile={handleViewProfile}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
