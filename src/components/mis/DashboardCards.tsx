'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PendingCandidatesResponse } from '@/types/candidate-approval';
import type { PendingCompaniesResponse } from '@/types/company-verification';

interface DashboardCardsProps {
  className?: string;
  type?: 'candidates' | 'companies' | 'both';
}

export function DashboardCards({ className, type = 'both' }: DashboardCardsProps) {
  const router = useRouter();
  const [pendingCandidatesCount, setPendingCandidatesCount] = useState<number>(0);
  const [pendingCompaniesCount, setPendingCompaniesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch pending candidates count
        const candidatesResponse = await fetch('/api/mis/pending-candidates?limit=1&approvalStatus=pending');
        if (!candidatesResponse.ok) {
          throw new Error('Failed to fetch pending candidates count');
        }
        const candidatesData: PendingCandidatesResponse = await candidatesResponse.json();
        setPendingCandidatesCount(candidatesData.total);

        // Fetch pending companies count
        const companiesResponse = await fetch('/api/mis/pending-companies?limit=1&approvalStatus=pending');
        if (!companiesResponse.ok) {
          throw new Error('Failed to fetch pending companies count');
        }
        const companiesData: PendingCompaniesResponse = await companiesResponse.json();
        setPendingCompaniesCount(companiesData.total);

      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const handlePendingCandidatesClick = () => {
    router.push('/mis/candidate-approval');
  };

  const handlePendingCompaniesClick = () => {
    router.push('/mis/company-verification');
  };

  const renderCard = (cardType: 'candidates' | 'companies') => {
    if (loading) {
      return (
        <Card className={`animate-pulse ${className || ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {cardType === 'candidates' ? 'Pending Candidates' : 'Pending Companies'}
            </CardTitle>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className={`border-red-200 bg-red-50 ${className || ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Error</CardTitle>
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-600">{error}</div>
          </CardContent>
        </Card>
      );
    }

    if (cardType === 'candidates') {
      return (
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 border-emerald-200 hover:border-emerald-300 ${className || ''}`}
          onClick={handlePendingCandidatesClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Pending Candidates</CardTitle>
            <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{pendingCandidatesCount}</div>
            <p className="text-xs text-emerald-600 mt-1">Click to review and approve</p>
          </CardContent>
        </Card>
      );
    }

    if (cardType === 'companies') {
      return (
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 border-green-200 hover:border-green-300 ${className || ''}`}
          onClick={handlePendingCompaniesClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Pending Companies</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{pendingCompaniesCount}</div>
            <p className="text-xs text-green-600 mt-1">Click to verify and approve</p>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  if (type === 'both') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className || ''}`}>
        {renderCard('candidates')}
        {renderCard('companies')}
      </div>
    );
  }

  return renderCard(type);
}
