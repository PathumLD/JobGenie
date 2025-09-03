'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { 
  PendingCandidate, 
  PendingCandidatesResponse, 
  TableFilters, 
  TableSort,
  ApprovalStatus 
} from '@/types/candidate-approval';

export function CandidateApprovalPage() {
  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    gender: 'all',
    profileCompletion: 'all',
    approvalStatus: 'pending',
    dateRange: { from: null, to: null }
  });
  const [sort, setSort] = useState<TableSort>({
    field: 'created_at',
    direction: 'desc'
  });
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({
    loading: false,
    success: false,
    error: null,
    message: null
  });

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      if (!filterLoading) {
        setLoading(true);
      }
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sort.field,
        sortOrder: sort.direction,
        ...(filters.search && { search: filters.search }),
        ...(filters.gender !== 'all' && { gender: filters.gender }),
        ...(filters.profileCompletion !== 'all' && { profileCompletion: filters.profileCompletion }),
        ...(filters.approvalStatus && { approvalStatus: filters.approvalStatus })
      });

      const response = await fetch(`/api/mis/pending-candidates?${params}`);
      const data: PendingCandidatesResponse = await response.json();

      if (data.success) {
        setCandidates(data.candidates);
        setTotal(data.total);
      } else {
        console.error('Failed to fetch candidates:', data.message);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
      setFilterLoading(false);
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

        // Remove the candidate from the list since they're no longer pending
        setCandidates(prev => prev.filter(c => c.user_id !== candidateId));
        setTotal(prev => prev - 1);
        setSelectedCandidates(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });

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

  // Handle bulk approval/rejection
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedCandidates.size === 0) return;

    try {
      setApprovalStatus({
        loading: true,
        success: false,
        error: null,
        message: null
      });

      // Filter candidates based on action and current status
      const selectedCandidatesData = candidates.filter(c => selectedCandidates.has(c.user_id));
      let candidateIdsToProcess: string[] = [];
      
      if (action === 'approve') {
        // Can only approve rejected or pending candidates
        candidateIdsToProcess = selectedCandidatesData
          .filter(c => c.approval_status === 'rejected' || c.approval_status === 'pending')
          .map(c => c.user_id);
      } else if (action === 'reject') {
        // Can only reject approved or pending candidates
        candidateIdsToProcess = selectedCandidatesData
          .filter(c => c.approval_status === 'approved' || c.approval_status === 'pending')
          .map(c => c.user_id);
      }

      if (candidateIdsToProcess.length === 0) {
        setApprovalStatus({
          loading: false,
          success: false,
          error: `No candidates can be ${action === 'approve' ? 'approved' : 'rejected'} with their current status`,
          message: null
        });
        return;
      }

      const response = await fetch(`/api/mis/candidate-approval?action=bulk-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          candidateIds: candidateIdsToProcess,
          action 
        })
      });

      const result = await response.json();

      if (response.ok) {
        setApprovalStatus({
          loading: false,
          success: true,
          error: null,
          message: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${candidateIdsToProcess.length} candidate(s)`
        });

        // Remove all selected candidates from the list
        setCandidates(prev => prev.filter(c => !selectedCandidates.has(c.user_id)));
        setTotal(prev => prev - selectedCandidates.size);
        setSelectedCandidates(new Set());

        // Clear message after 3 seconds
        setTimeout(() => {
          setApprovalStatus(prev => ({ ...prev, message: null }));
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to process bulk request');
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

  // Handle selection
  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.user_id)));
    }
  };

  // Handle sorting
  const handleSort = (field: keyof PendingCandidate) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TableFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Fetch candidates when dependencies change
  useEffect(() => {
    fetchCandidates();
  }, [currentPage, sort]);

  // Separate effect for filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      setFilterLoading(true);
      fetchCandidates();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Format phone number
  const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    return phone;
  };

  // Get profile completion badge
  const getProfileCompletionBadge = (percentage: number | null, completed: boolean) => {
    if (completed) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Complete</span>;
    }
    if (percentage && percentage >= 80) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">{percentage}%</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">{percentage || 0}%</span>;
  };

  // Get approval status badge
  const getApprovalStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
                 <div>
           <h1 className="text-2xl font-bold text-gray-900">Candidate Approval</h1>
           <p className="text-gray-600">Review and manage candidate approval statuses</p>
         </div>
                 <div className="flex items-center space-x-3">
           {selectedCandidates.size > 0 && (
             <>
               {(() => {
                 const selectedCandidatesData = candidates.filter(c => selectedCandidates.has(c.user_id));
                 const canReject = selectedCandidatesData.some(c => c.approval_status === 'approved' || c.approval_status === 'pending');
                 const canApprove = selectedCandidatesData.some(c => c.approval_status === 'rejected' || c.approval_status === 'pending');
                 
                 return (
                   <>
                     {canReject && (
                       <Button
                         variant="outline"
                         onClick={() => handleBulkAction('reject')}
                         disabled={approvalStatus.loading}
                         className="border-red-600 text-red-600 hover:bg-red-50"
                       >
                         Reject Selected ({selectedCandidates.size})
                       </Button>
                     )}
                     {canApprove && (
                       <Button
                         onClick={() => handleBulkAction('approve')}
                         disabled={approvalStatus.loading}
                         className="bg-emerald-600 hover:bg-emerald-700"
                       >
                         Approve Selected ({selectedCandidates.size})
                       </Button>
                     )}
                   </>
                 );
               })()}
             </>
           )}
         </div>
      </div>

      {/* Status Messages */}
      {approvalStatus.message && (
        <div className={`p-4 rounded-lg ${
          approvalStatus.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {approvalStatus.message}
        </div>
      )}

      {approvalStatus.error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          {approvalStatus.error}
        </div>
      )}

             {/* Filters */}
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle className="text-lg">Filters</CardTitle>
             <div className="flex items-center space-x-2">
               {filterLoading && (
                 <div className="flex items-center space-x-2 text-sm text-gray-500">
                   <LoadingSpinner size="sm" />
                   <span>Applying filters...</span>
                 </div>
               )}
                                <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setFilters({
                       search: '',
                       gender: 'all',
                       profileCompletion: 'all',
                       approvalStatus: 'pending',
                       dateRange: { from: null, to: null }
                     });
                   }}
                   disabled={filterLoading}
                 >
                   Clear Filters
                   {(() => {
                     const activeFilters = [
                       filters.search,
                       filters.gender !== 'all',
                       filters.profileCompletion !== 'all',
                       filters.approvalStatus !== 'pending'
                     ].filter(Boolean).length;
                     return activeFilters > 0 ? ` (${activeFilters})` : '';
                   })()}
                 </Button>
             </div>
           </div>
         </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormInput
              placeholder="Search by name, email, or NIC..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="md:col-span-2"
            />
            <FormSelect
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              options={[
                { value: 'all', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' }
              ]}
            />
            {/* <FormSelect
              value={filters.profileCompletion}
              onChange={(e) => handleFilterChange('profileCompletion', e.target.value)}
              options={[
                { value: 'all', label: 'All Profiles' },
                { value: 'complete', label: 'Complete' },
                { value: 'incomplete', label: 'Incomplete' }
              ]}
            /> */}
            <FormSelect
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

             {/* Results Summary */}
       <div className="flex items-center justify-between text-sm text-gray-600">
         <span>
           Showing {startIndex}-{endIndex} of {total} candidates
         </span>
       </div>

      {/* Candidates Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === candidates.length && candidates.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('first_name')}
                  >
                    Name
                    {sort.field === 'first_name' && (
                      <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Profile
                   </th>
                   {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th> */}
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.has(candidate.user_id)}
                        onChange={() => handleSelectCandidate(candidate.user_id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.first_name} {candidate.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {candidate.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.nic || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPhone(candidate.phone1)}
                      {candidate.phone2 && (
                        <div className="text-xs text-gray-500">
                          Alt: {formatPhone(candidate.phone2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {candidate.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(candidate.date_of_birth)}
                    </td>
                                         {/* <td className="px-6 py-4 whitespace-nowrap">
                                              {getProfileCompletionBadge(candidate.profile_completion_percentage, candidate.completedProfile || false)}
                     </td> */}
                     <td className="px-6 py-4 whitespace-nowrap">
                       {getApprovalStatusBadge(candidate.approval_status)}
                     </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <Button
                             size="sm"
                             variant="outline"
                          onClick={() => window.location.href = `/mis/candidate-profiles/${candidate.user_id}`}
                          // onClick={() => window.open(`/mis/candidate-profiles/${candidate.user_id}`, '_blank')}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          View Profile
                             </Button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {candidates.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">
                No candidates waiting for approval
              </div>
              <p className="text-gray-400">
                All candidates have been processed or there are no pending approvals.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
