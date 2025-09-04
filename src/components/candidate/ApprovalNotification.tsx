'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApprovalNotificationProps {
  onDismiss: () => void;
}

export function ApprovalNotification({ onDismiss }: ApprovalNotificationProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    try {
      setIsDismissing(true);
      const token = localStorage.getItem('access_token');
      
      if (token) {
        const response = await fetch('/api/candidate/profile/dismiss-approval-notification', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          onDismiss();
        } else {
          console.error('Failed to dismiss notification');
        }
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Success Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              🎉 Congratulations! Your Profile Has Been Approved
            </h3>
            <p className="text-green-700 text-base leading-relaxed mb-4">
              Great news! Your profile has been reviewed and approved by our MIS team. 
              You can now apply for jobs and access all the features of our platform. 
              We're excited to help you find your next career opportunity!
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDismiss}
                disabled={isDismissing}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isDismissing ? 'Dismissing...' : 'Got it, thanks!'}
              </Button>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
