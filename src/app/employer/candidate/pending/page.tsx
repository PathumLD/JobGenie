'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { InterviewNotificationCard } from '@/components/employer/InterviewNotificationCard';
import { InterviewDetailModal } from '@/components/employer/InterviewDetailModal';

interface InterviewNotification {
  id: string;
  employer_id: string;
  candidate_id: string;
  time_slots: Array<{
    date: string;
    time: string;
  }>;
  status: string;
  selected_slot?: {
    date: string;
    time: string;
  };
  message?: string;
  designation?: string;
  created_at: string;
  updated_at: string;
  candidate: {
    user: {
      first_name: string | null;
      last_name: string | null;
      email: string;
    };
  };
}

interface InterviewNotificationsResponse {
  success: boolean;
  notifications: InterviewNotification[];
  total: number;
  message: string;
}

export default function PendingCandidatesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<InterviewNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<InterviewNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const fetchNotifications = async (page: number = 1, status: string = 'all') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        router.push('/employer/login');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/employer/interview-notifications?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: InterviewNotificationsResponse = await response.json();
        setNotifications(data.notifications);
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
        throw new Error('Failed to fetch interview notifications');
      }
    } catch (error) {
      console.error('Error fetching interview notifications:', error);
      setError('Failed to load interview notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, statusFilter);
  }, [statusFilter]);

  // Auto-refresh every 30 seconds to get updated statuses
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isModalOpen) {
        fetchNotifications(pagination.page, statusFilter);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, isModalOpen, pagination.page, statusFilter]);

  const handlePageChange = (page: number) => {
    fetchNotifications(page, statusFilter);
  };

  const handleViewDetails = (notification: InterviewNotification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const getStatusCounts = () => {
    const counts = {
      all: pagination.total,
      pending: 0,
      accepted: 0,
      rejected: 0,
      expired: 0
    };

    notifications.forEach(notification => {
      if (notification.status in counts) {
        counts[notification.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Notifications</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchNotifications(1, statusFilter)}>
              Try Again
            </Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Interview Notifications</h1>
              <p className="mt-2 text-gray-600">
                Manage your sent interview invitations and track candidate responses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchNotifications(pagination.page, statusFilter)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => router.push('/employer/candidate/find')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Send New Invitation
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
              { key: 'expired', label: 'Expired', count: statusCounts.expired }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Grid */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No interview notifications found' : `No ${statusFilter} notifications`}
            </h3>
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all' 
                ? 'You haven\'t sent any interview invitations yet.'
                : `You don't have any ${statusFilter} interview notifications.`
              }
            </p>
            <Button onClick={() => router.push('/employer/candidate/find')}>
              Find Candidates
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {notifications.map((notification) => (
                <InterviewNotificationCard
                  key={notification.id}
                  notification={notification}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} notifications
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        <InterviewDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          notification={selectedNotification}
        />
      </div>
    </div>
  );
}