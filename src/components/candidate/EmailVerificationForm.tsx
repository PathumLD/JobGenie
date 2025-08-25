'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EmailVerificationFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userEmail: string;
  onVerificationSuccess: () => void;
}

interface FormData {
  verificationCode: string;
}

interface FormErrors {
  [key: string]: string;
}

export function EmailVerificationForm({ 
  isLoading, 
  setIsLoading, 
  userEmail, 
  onVerificationSuccess 
}: EmailVerificationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    verificationCode: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    } else if (!/^\d{6}$/.test(formData.verificationCode)) {
      newErrors.verificationCode = 'Verification code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Email verified successfully!');
        // Wait a moment before calling success callback
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Verification failed. Please try again.');
      }
         } catch {
       setErrorMessage('Network error. Please check your connection and try again.');
     } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Verification code resent successfully! Check your email.');
        setResendCountdown(60); // 60 second cooldown
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to resend verification code.');
      }
         } catch {
       setErrorMessage('Network error. Please try again later.');
     } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}



      {/* Verification Code Field */}
      <div>
        <FormInput
          label="Verification Code"
          type="text"
          name="verificationCode"
          value={formData.verificationCode}
          onChange={handleInputChange}
          placeholder="Enter 6-digit code"
          error={errors.verificationCode}
          disabled={isLoading}
          helperText="Enter the 6-digit code sent to your email"
          maxLength={6}
        />
      </div>

      {/* Resend Code Section */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Didn&apos;t receive the code?
        </p>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendCountdown > 0 || isResending || isLoading}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <span className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" color="emerald" />
              <span>Resending...</span>
            </span>
          ) : resendCountdown > 0 ? (
            `Resend code in ${resendCountdown}s`
          ) : (
            'Resend verification code'
          )}
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" color="white" />
            <span>Verifying...</span>
          </div>
        ) : (
          'Verify Email'
        )}
      </Button>

      {/* Additional Help */}
      <div className="text-center space-y-2">
                 <p className="text-xs text-gray-500">
           Check your spam folder if you don&apos;t see the email
         </p>
        <p className="text-xs text-gray-500">
          Having trouble?{' '}
          <a href="/support" className="text-emerald-600 hover:text-emerald-700 underline">
            Contact support
          </a>
        </p>
      </div>
    </form>
  );
}
