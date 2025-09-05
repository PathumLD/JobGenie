'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface InterviewNotificationCardProps {
  notification: InterviewNotification;
  onViewDetails: (notification: InterviewNotification) => void;
}

export function InterviewNotificationCard({ 
  notification, 
  onViewDetails 
}: Readonly<InterviewNotificationCardProps>) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(notification)}>
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {notification.designation || 'Interview Invitation'}
            </CardTitle>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
            {getStatusText(notification.status)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Invited: {formatDate(notification.created_at)}</span>
          </div>
          
          {notification.selected_slot && (
            <div className="flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirmed: {formatDate(notification.selected_slot.date)} at {notification.selected_slot.time}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{notification.time_slots.length} time slot{notification.time_slots.length > 1 ? 's' : ''} offered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
