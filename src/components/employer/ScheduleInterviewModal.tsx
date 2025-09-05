'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  onSuccess: (message: string) => void;
}

interface ScheduleInterviewFormData {
  interview_type: 'phone_screening' | 'video_call' | 'ai_video' | 'technical' | 'behavioral' | 'final';
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  meeting_link: string;
  meeting_id: string;
  interview_notes: string;
}

export function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  candidateId, 
  candidateName,
  onSuccess 
}: ScheduleInterviewModalProps) {
  const [formData, setFormData] = useState<ScheduleInterviewFormData>({
    interview_type: 'video_call',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    meeting_link: '',
    meeting_id: '',
    interview_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const interviewTypes = [
    { value: 'phone_screening', label: 'Phone Screening' },
    { value: 'video_call', label: 'Video Call' },
    { value: 'ai_video', label: 'AI Video Interview' },
    { value: 'technical', label: 'Technical Interview' },
    { value: 'behavioral', label: 'Behavioral Interview' },
    { value: 'final', label: 'Final Interview' }
  ];

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  const handleInputChange = (field: keyof ScheduleInterviewFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Date is required';
    }

    if (!formData.scheduled_time) {
      newErrors.scheduled_time = 'Time is required';
    }

    // Check if the scheduled date/time is in the future
    if (formData.scheduled_date && formData.scheduled_time) {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      if (scheduledDateTime <= new Date()) {
        newErrors.scheduled_date = 'Interview must be scheduled for a future date and time';
      }
    }

    if (formData.duration_minutes < 15 || formData.duration_minutes > 240) {
      newErrors.duration_minutes = 'Duration must be between 15 minutes and 4 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString();

      const response = await fetch('/api/employer/candidates/schedule-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          interview_type: formData.interview_type,
          scheduled_at: scheduledAt,
          duration_minutes: formData.duration_minutes,
          meeting_link: formData.meeting_link || undefined,
          meeting_id: formData.meeting_id || undefined,
          interview_notes: formData.interview_notes || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.message);
        onClose();
        // Reset form
        setFormData({
          interview_type: 'video_call',
          scheduled_date: '',
          scheduled_time: '',
          duration_minutes: 60,
          meeting_link: '',
          meeting_id: '',
          interview_notes: ''
        });
      } else {
        setErrors({ scheduled_date: result.message });
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setErrors({ scheduled_date: 'Failed to schedule interview. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Schedule Interview</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              <strong>Candidate:</strong> {candidateName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interview Type */}
            <div>
              <label htmlFor="interview_type" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type *
              </label>
              <select
                id="interview_type"
                value={formData.interview_type}
                onChange={(e) => handleInputChange('interview_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                {interviewTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.scheduled_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.scheduled_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.scheduled_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.scheduled_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduled_time}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <select
                id="duration_minutes"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.duration_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
              )}
            </div>

            {/* Meeting Link */}
            <div>
              <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link (Optional)
              </label>
              <input
                id="meeting_link"
                type="url"
                value={formData.meeting_link}
                onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Meeting ID */}
            <div>
              <label htmlFor="meeting_id" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting ID (Optional)
              </label>
              <input
                id="meeting_id"
                type="text"
                value={formData.meeting_id}
                onChange={(e) => handleInputChange('meeting_id', e.target.value)}
                placeholder="Meeting ID or room number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Interview Notes */}
            <div>
              <label htmlFor="interview_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Notes (Optional)
              </label>
              <textarea
                id="interview_notes"
                value={formData.interview_notes}
                onChange={(e) => handleInputChange('interview_notes', e.target.value)}
                placeholder="Any specific topics to discuss or preparation notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Scheduling...</span>
                  </>
                ) : (
                  'Schedule Interview'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
