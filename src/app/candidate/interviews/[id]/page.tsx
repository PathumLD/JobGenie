'use client';

import { useEffect, useState, use } from 'react';
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

interface InterviewDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InterviewDetailsPage({ params }: InterviewDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params) as { id: string };
  const [interviewNotification, setInterviewNotification] = useState<InterviewNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInterviewNotification = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetch(`/api/candidate/interview-notification/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInterviewNotification(data.data);
        } else {
          setError('Failed to load interview notification');
        }
      } catch (err) {
        console.error('Error fetching interview notification:', err);
        setError('An error occurred while loading the interview notification');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewNotification();
  }, [resolvedParams.id]);

  const handleSlotSelection = (slot: {date: string, time: string}) => {
    setSelectedSlot(slot);
  };

  const handleConfirmSlot = async () => {
    if (!selectedSlot || !interviewNotification) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`/api/candidate/interview-notification/${interviewNotification.id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selected_slot: selectedSlot
        })
      });

      if (response.ok) {
        // Update the local state
        setInterviewNotification(prev => prev ? {
          ...prev,
          status: 'accepted',
          selected_slot: selectedSlot
        } : null);
        
        // Show success message
        alert('Interview slot confirmed successfully!');
      } else {
        setError('Failed to confirm interview slot');
      }
    } catch (err) {
      console.error('Error confirming interview slot:', err);
      setError('An error occurred while confirming the interview slot');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <div className="max-w-4xl mx-auto ">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/candidate/interviews')}>
              Back to Interviews
            </Button>
          </div>
        </div>
      </CandidateLayoutWrapper>
    );
  }

  if (!interviewNotification) {
    return (
      <CandidateLayoutWrapper>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Not Found</h2>
            <p className="text-gray-600 mb-4">The requested interview notification could not be found.</p>
            <Button onClick={() => router.push('/candidate/interviews')}>
              Back to Interviews
            </Button>
          </div>
        </div>
      </CandidateLayoutWrapper>
    );
  }

  return (
    <CandidateLayoutWrapper>
      <div className="max-w-4xl mx-auto ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Interview Details</h1>
          <p className="text-gray-600">Interview invitation details and time slot selection</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interview Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Company</h3>
              <p className="text-gray-600">{interviewNotification.employer.company.name}</p>
            </div>

            {/* Designation */}
            {interviewNotification.designation && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Position</h3>
                <p className="text-gray-600">{interviewNotification.designation}</p>
              </div>
            )}

            {/* Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Status</h3>
              {(() => {
                const status = interviewNotification.status;
                const statusClasses = status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : status === 'accepted'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800';
                
                return (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                );
              })()}
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h3>
              {interviewNotification.status === 'pending' ? (
                <div className="space-y-3">
                  {interviewNotification.time_slots.map((slot, index) => (
                    <button
                      key={`${slot.date}-${slot.time}`}
                      type="button"
                      className={`w-full p-4 border rounded-lg cursor-pointer transition-colors text-left ${
                        selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSlotSelection(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                          <p className="text-gray-600">{slot.time}</p>
                        </div>
                        {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && (
                          <div className="text-emerald-600">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    Selected: {formatDate(interviewNotification.selected_slot!.date)} at {interviewNotification.selected_slot!.time}
                  </p>
                </div>
              )}
            </div>

            {/* Message */}
            {interviewNotification.message && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Message</h3>
                <p className="text-gray-600">{interviewNotification.message}</p>
              </div>
            )}

            {/* Actions */}
            {interviewNotification.status === 'pending' && (
              <div className="flex space-x-4">
                <Button
                  onClick={handleConfirmSlot}
                  disabled={!selectedSlot || submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Confirming...' : 'Confirm Time Slot'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CandidateLayoutWrapper>
  );
}
