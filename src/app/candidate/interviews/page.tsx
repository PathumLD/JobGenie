'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CandidateLayoutWrapper } from '@/components/candidate/CandidateLayoutWrapper';

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
  employer: {
    company: {
      name: string;
    };
  };
}

export default function CandidateInterviewsPage() {
  const router = useRouter();
  const [interviewNotifications, setInterviewNotifications] = useState<InterviewNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetch('/api/candidate/interview-notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInterviewNotifications(data.data);
        } else {
          setError('Failed to load interview notifications');
        }
      } catch (err) {
        console.error('Error fetching interview notifications:', err);
        setError('An error occurred while loading interview notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = (notificationId: string) => {
    router.push(`/candidate/interviews/${notificationId}`);
  };

  if (loading) {
    return (
      <CandidateLayoutWrapper>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </CandidateLayoutWrapper>
    );
  }

  if (error) {
    return (
      <CandidateLayoutWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/candidate/jobs')}>
              Back to Jobs
            </Button>
          </div>
        </div>
      </CandidateLayoutWrapper>
    );
  }

  return (
    <CandidateLayoutWrapper>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
          <p className="text-gray-600">View and manage your interview invitations</p>
        </div>

        {interviewNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Interviews Yet</h2>
            <p className="text-gray-600 mb-4">You haven't received any interview invitations yet.</p>
            <Button onClick={() => router.push('/candidate/jobs')}>
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleCardClick(notification.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 mb-1">
                        {notification.employer.company.name}
                      </CardTitle>
                      {notification.designation && (
                        <p className="text-sm text-gray-600 mb-2">{notification.designation}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Time Information */}
                    {notification.status === 'accepted' && notification.selected_slot ? (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Confirmed</p>
                        <p className="text-sm text-green-700">
                          {formatDate(notification.selected_slot.date)}
                        </p>
                        <p className="text-sm text-green-700">
                          {notification.selected_slot.time}
                        </p>
                      </div>
                    ) : notification.status === 'pending' ? (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">Pending Selection</p>
                        <p className="text-sm text-yellow-700">
                          {notification.time_slots.length} time slot{notification.time_slots.length > 1 ? 's' : ''} available
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">Status: {notification.status}</p>
                      </div>
                    )}

                    {/* Message Preview */}
                    {notification.message && (
                      <div className="text-sm text-gray-600">
                        <p className="truncate">{notification.message}</p>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="text-xs text-gray-500">
                      Received: {new Date(notification.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CandidateLayoutWrapper>
  );
}