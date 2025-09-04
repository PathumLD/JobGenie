'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CandidateProfileResponse } from '@/types/candidate-profile';
import { authenticatedFetch } from '@/lib/auth-storage';
import { useRouter } from 'next/navigation';

interface CandidateListItem {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  location: string | null;
  experience_level: string | null;
  years_of_experience: number | null;
  approval_status: string;
  profile_completion_percentage: number | null;
  created_at: string;
  updated_at: string;
  profile_image_url?: string | null;
  user: {
    email: string;
    status: string;
  };
}

interface CandidatesListResponse {
  candidates: CandidateListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function MisCandidateProfilesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);

  const CANDIDATES_PER_PAGE = 12;

  useEffect(() => {
    fetchCandidates();
  }, [currentPage]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: CANDIDATES_PER_PAGE.toString()
      });



      const response = await authenticatedFetch(`/api/mis/candidate-profiles?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        const responseData = data.data as CandidatesListResponse;
        console.log('Candidates data received:', responseData.candidates);
        setCandidates(responseData.candidates);
        setTotalPages(responseData.pagination.totalPages);
        setTotalCandidates(responseData.pagination.total);
      } else {
        setError(data.message || 'Failed to fetch candidates');
      }
    } catch (err) {
      setError('Failed to fetch candidates data');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleCardClick = (candidateId: string) => {
    router.push(`/mis/candidate-profiles/${candidateId}`);
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'bg-blue-100 text-blue-800';
      case 'junior':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-yellow-100 text-yellow-800';
      case 'senior':
        return 'bg-orange-100 text-orange-800';
      case 'lead':
        return 'bg-purple-100 text-purple-800';
      case 'principal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Candidates</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Profiles</h1>
          <p className="text-gray-600 mt-2">View and manage candidate profiles</p>
        </div>



        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {candidates.length} of {totalCandidates} candidates (Page {currentPage} of {totalPages})
          </p>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {candidates.map((candidate) => (
            <Card 
              key={candidate.user_id} 
              className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
              onClick={() => handleCardClick(candidate.user_id)}
            >
              <CardContent className="p-4">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {candidate.profile_image_url ? (
                      <img 
                        src={candidate.profile_image_url} 
                        alt={`${candidate.first_name} ${candidate.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('span');
                            fallback.className = 'text-2xl font-semibold text-gray-600';
                            fallback.textContent = `${candidate.first_name?.[0] || ''}${candidate.last_name?.[0] || ''}`;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-600">
                        {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {candidate.first_name} {candidate.last_name}
                  </h3>
                  {candidate.title && (
                    <p className="text-sm text-gray-600 mb-1">{candidate.title}</p>
                  )}
                  {candidate.current_position && (
                    <p className="text-sm text-gray-700 font-medium">{candidate.current_position}</p>
                  )}
                </div>

                {/* Experience & Location */}
                <div className="space-y-2 mb-4">
                  {candidate.years_of_experience && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{candidate.years_of_experience} years</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium truncate ml-2">{candidate.location}</span>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(candidate.approval_status)}`}>
                    {candidate.approval_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  {candidate.experience_level && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(candidate.experience_level)}`}>
                      {candidate.experience_level.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {candidates.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
