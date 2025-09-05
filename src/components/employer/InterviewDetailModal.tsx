'use client';

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

interface InterviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: InterviewNotification | null;
}

export function InterviewDetailModal({ 
  isOpen, 
  onClose, 
  notification 
}: Readonly<InterviewDetailModalProps>) {
  if (!isOpen || !notification) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Response';
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
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed mt-20 inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen  px-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <button 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity w-full h-full"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          type="button"
          aria-label="Close modal"
        ></button>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Interview Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {notification.designation || 'Interview Invitation'}
                  </h4>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(notification.status)}`}>
                  {getStatusText(notification.status)}
                </span>
              </div>

              {/* Timeline */}
              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Timeline</h5>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><span className="font-medium">Invited:</span> {formatDateTime(notification.created_at)}</span>
                  </div>
                  {notification.updated_at !== notification.created_at && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span><span className="font-medium">Last Updated:</span> {formatDateTime(notification.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Available Time Slots</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {notification.time_slots.map((slot, index) => (
                    <div 
                      key={`${slot.date}-${slot.time}-${index}`}
                      className={`p-3 rounded-lg border ${
                        notification.selected_slot && 
                        notification.selected_slot.date === slot.date && 
                        notification.selected_slot.time === slot.time
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(slot.date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {slot.time}
                          </p>
                        </div>
                        {notification.selected_slot && 
                         notification.selected_slot.date === slot.date && 
                         notification.selected_slot.time === slot.time && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Slot */}
              {notification.selected_slot && (
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Selected Time Slot</h5>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {formatDate(notification.selected_slot.date)}
                        </p>
                        <p className="text-sm text-green-700">
                          {notification.selected_slot.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {notification.message && (
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Message</h5>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {notification.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
