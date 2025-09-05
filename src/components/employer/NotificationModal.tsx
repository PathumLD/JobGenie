'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  designationName?: string;
  onSuccess: (message: string) => void;
}

export function NotificationModal({ 
  isOpen, 
  onClose, 
  candidateId, 
  candidateName,
  designationName,
  onSuccess 
}: NotificationModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate 30-minute time slots between 09:00 and 17:00
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}.${endMinute.toString().padStart(2, '0')}`;
        const timeString = `${startTime} - ${endTime}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlotOptions = generateTimeSlots();

  const addTimeSlot = () => {
    if (timeSlots.length >= 3) return;
    
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      date: '',
      time: ''
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    // Clear any errors for this slot
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`date_${id}`];
      delete newErrors[`time_${id}`];
      return newErrors;
    });
  };

  const updateTimeSlot = (id: string, field: 'date' | 'time', value: string) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === id) {
        const updatedSlot = { ...slot, [field]: value };
        
        // If date is changed, check if current time is still available
        if (field === 'date' && slot.time) {
          const timeSlotsWithStatus = getTimeSlotsWithStatus(id, value);
          const currentTimeSlot = timeSlotsWithStatus.find(ts => ts.time === slot.time);
          if (!currentTimeSlot?.isAvailable) {
            updatedSlot.time = ''; // Clear time if no longer available
          }
        }
        
        return updatedSlot;
      }
      return slot;
    }));
    
    // Clear error when user starts typing
    const errorKey = `${field}_${id}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Get time slots with availability status for a specific slot
  const getTimeSlotsWithStatus = (currentSlotId: string, currentDate: string) => {
    if (!currentDate) return timeSlotOptions.map(time => ({ time, isAvailable: true }));
    
    const usedSlots = timeSlots
      .filter(slot => slot.id !== currentSlotId && slot.date === currentDate && slot.time)
      .map(slot => slot.time);
    
    return timeSlotOptions.map(time => ({
      time,
      isAvailable: !usedSlots.includes(time)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (timeSlots.length === 0) {
      newErrors.general = 'Please add at least one time slot';
      setErrors(newErrors);
      return false;
    }

    // Check for duplicate time slots
    const usedSlots = new Set<string>();
    timeSlots.forEach(slot => {
      if (slot.date && slot.time) {
        const slotKey = `${slot.date}-${slot.time}`;
        if (usedSlots.has(slotKey)) {
          newErrors[`time_${slot.id}`] = 'This time slot is already selected';
        } else {
          usedSlots.add(slotKey);
        }
      }
    });

    timeSlots.forEach(slot => {
      if (!slot.date) {
        newErrors[`date_${slot.id}`] = 'Date is required';
      } else {
        // Check if the date is in the future
        const selectedDate = new Date(slot.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors[`date_${slot.id}`] = 'Date must be in the future';
        }
      }

      if (!slot.time) {
        newErrors[`time_${slot.id}`] = 'Time is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('NotificationModal handleSubmit called with designationName:', designationName);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/employer/candidates/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          time_slots: timeSlots.map(slot => ({
            date: slot.date,
            time: slot.time
          })),
          designation_name: designationName
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.message);
        onClose();
        // Reset form
        setTimeSlots([]);
        setErrors({});
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setErrors({ general: 'Failed to send notification. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setTimeSlots([]);
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Send Interview Notification</h2>
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
            {/* Time Slots Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Available Time Slots</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTimeSlot}
                  disabled={timeSlots.length >= 3 || isSubmitting}
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Time Slot
                </Button>
              </div>

              {timeSlots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No time slots added yet. Click "Add Time Slot" to get started.</p>
                </div>
              )}

              <div className="space-y-4">
                {timeSlots.map((slot, index) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Time Slot {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(slot.id)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`date_${slot.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          id={`date_${slot.id}`}
                          type="date"
                          value={slot.date}
                          onChange={(e) => updateTimeSlot(slot.id, 'date', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors[`date_${slot.id}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                          min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          required
                        />
                        {errors[`date_${slot.id}`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`date_${slot.id}`]}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`time_${slot.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Time Slot*
                        </label>
                        <select
                          id={`time_${slot.id}`}
                          value={slot.time}
                          onChange={(e) => updateTimeSlot(slot.id, 'time', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors[`time_${slot.id}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting || !slot.date}
                        >
                          <option value="">Select time</option>
                          {getTimeSlotsWithStatus(slot.id, slot.date).map(({ time, isAvailable }) => (
                            <option 
                              key={time} 
                              value={time}
                              disabled={!isAvailable}
                              className={!isAvailable ? 'text-gray-400 bg-gray-100' : ''}
                            >
                              {time} {!isAvailable ? '(Already selected)' : ''}
                            </option>
                          ))}
                        </select>
                        {errors[`time_${slot.id}`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`time_${slot.id}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {timeSlots.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {timeSlots.length} of 3 time slots added
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

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
                disabled={isSubmitting || timeSlots.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Send Notification'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
