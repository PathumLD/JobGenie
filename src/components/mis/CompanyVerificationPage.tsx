'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { 
  PendingCompany, 
  PendingCompaniesResponse, 
  CompanyTableFilters, 
  CompanyTableSort,
  VerificationStatus 
} from '@/types/company-verification';

export function CompanyVerificationPage() {
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<CompanyTableFilters>({
    search: '',
    industry: 'all',
    companySize: 'all',
    companyType: 'all',
    approvalStatus: 'pending',
    dateRange: { from: null, to: null }
  });
  const [sort, setSort] = useState<CompanyTableSort>({
    field: 'created_at',
    direction: 'desc'
  });
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    loading: false,
    success: false,
    error: null,
    message: null
  });

  // Fetch companies
  const fetchCompanies = async () => {
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
        ...(filters.industry !== 'all' && { industry: filters.industry }),
        ...(filters.companySize !== 'all' && { companySize: filters.companySize }),
        ...(filters.companyType !== 'all' && { companyType: filters.companyType }),
        ...(filters.approvalStatus && { approvalStatus: filters.approvalStatus })
      });

      const response = await fetch(`/api/mis/pending-companies?${params}`);
      const data: PendingCompaniesResponse = await response.json();

      if (data.success) {
        setCompanies(data.companies);
        setTotal(data.total);
      } else {
        console.error('Failed to fetch companies:', data.message);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };


  // Handle bulk verification/rejection
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedCompanies.size === 0) return;

    try {
      setVerificationStatus({
        loading: true,
        success: false,
        error: null,
        message: null
      });

      // Filter companies based on action and current status
      const selectedCompaniesData = companies.filter(c => selectedCompanies.has(c.id));
      let companyIdsToProcess: string[] = [];
      
      if (action === 'approve') {
        // Can only approve rejected or pending companies
        companyIdsToProcess = selectedCompaniesData
          .filter(c => c.approval_status === 'rejected' || c.approval_status === 'pending')
          .map(c => c.id);
      } else if (action === 'reject') {
        // Can only reject approved or pending companies
        companyIdsToProcess = selectedCompaniesData
          .filter(c => c.approval_status === 'approved' || c.approval_status === 'pending')
          .map(c => c.id);
      }

      if (companyIdsToProcess.length === 0) {
        setVerificationStatus({
          loading: false,
          success: false,
          error: `No companies can be ${action === 'approve' ? 'approved' : 'rejected'} with their current status`,
          message: null
        });
        return;
      }

      const response = await fetch(`/api/mis/company-verification?action=bulk-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          companyIds: companyIdsToProcess,
          action 
        })
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationStatus({
          loading: false,
          success: true,
          error: null,
          message: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${companyIdsToProcess.length} company(ies)`
        });

        // Remove all selected companies from the list
        setCompanies(prev => prev.filter(c => !selectedCompanies.has(c.id)));
        setTotal(prev => prev - selectedCompanies.size);
        setSelectedCompanies(new Set());

        // Clear message after 3 seconds
        setTimeout(() => {
          setVerificationStatus(prev => ({ ...prev, message: null }));
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to process bulk request');
      }
    } catch (error) {
      setVerificationStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        message: null
      });
    }
  };

  // Handle selection
  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCompanies.size === companies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(companies.map(c => c.id)));
    }
  };

  // Handle sorting
  const handleSort = (field: keyof PendingCompany) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof CompanyTableFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Fetch companies when dependencies change
  useEffect(() => {
    fetchCompanies();
  }, [currentPage, sort]);

  // Separate effect for filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      setFilterLoading(true);
      fetchCompanies();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);


  // Get company size label
  const getCompanySizeLabel = (size: string) => {
    const sizeLabels: Record<string, string> = {
      'startup': 'Startup',
      'one_to_ten': '1-10',
      'eleven_to_fifty': '11-50',
      'fifty_one_to_two_hundred': '51-200',
      'two_hundred_one_to_five_hundred': '201-500',
      'five_hundred_one_to_one_thousand': '501-1000',
      'one_thousand_plus': '1000+'
    };
    return sizeLabels[size] || size;
  };

  // Get company type label
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

  if (loading && companies.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Company Verification</h1>
          <p className="text-gray-600">Review and manage company verification statuses</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCompanies.size > 0 && (
            <>
              {(() => {
                const selectedCompaniesData = companies.filter(c => selectedCompanies.has(c.id));
                const canReject = selectedCompaniesData.some(c => c.approval_status === 'approved' || c.approval_status === 'pending');
                const canApprove = selectedCompaniesData.some(c => c.approval_status === 'rejected' || c.approval_status === 'pending');
                
                return (
                  <>
                    {canReject && (
                      <Button
                        variant="outline"
                        onClick={() => handleBulkAction('reject')}
                        disabled={verificationStatus.loading}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Reject Selected ({selectedCompanies.size})
                      </Button>
                    )}
                    {canApprove && (
                      <Button
                        onClick={() => handleBulkAction('approve')}
                        disabled={verificationStatus.loading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Approve Selected ({selectedCompanies.size})
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
      {verificationStatus.message && (
        <div className={`p-4 rounded-lg ${
          verificationStatus.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {verificationStatus.message}
        </div>
      )}

      {verificationStatus.error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          {verificationStatus.error}
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
                    industry: 'all',
                    companySize: 'all',
                    companyType: 'all',
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
                    filters.industry !== 'all',
                    filters.companySize !== 'all',
                    filters.companyType !== 'all',
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
              placeholder="Search by name, email, or registration number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="md:col-span-2"
            />
            <FormSelect
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              options={[
                { value: 'all', label: 'All Industries' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Education', label: 'Education' },
                { value: 'Manufacturing', label: 'Manufacturing' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Other', label: 'Other' }
              ]}
            />
            <FormSelect
              value={filters.companySize}
              onChange={(e) => handleFilterChange('companySize', e.target.value)}
              options={[
                { value: 'all', label: 'All Sizes' },
                { value: 'startup', label: 'Startup' },
                { value: 'one_to_ten', label: '1-10' },
                { value: 'eleven_to_fifty', label: '11-50' },
                { value: 'fifty_one_to_two_hundred', label: '51-200' },
                { value: 'two_hundred_one_to_five_hundred', label: '201-500' },
                { value: 'five_hundred_one_to_one_thousand', label: '501-1000' },
                { value: 'one_thousand_plus', label: '1000+' }
              ]}
            />
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
          Showing {startIndex}-{endIndex} of {total} companies
        </span>
      </div>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.size === companies.length && companies.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Company Name
                    {sort.field === 'name' && (
                      <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Founded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.has(company.id)}
                        onChange={() => handleSelectCompany(company.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {company.id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCompanySizeLabel(company.company_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCompanyTypeLabel(company.company_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.business_registration_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.founded_year || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalStatusBadge(company.approval_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/mis/company-profile/view?companyId=${company.id}`, '_blank')}
                          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        >
                          View Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {companies.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">
                No companies waiting for verification
              </div>
              <p className="text-gray-400">
                All companies have been processed or there are no pending verifications.
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
