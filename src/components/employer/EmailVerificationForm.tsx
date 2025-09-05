'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface EmailVerificationFormProps {
  email: string;
  userId: string;
  onSuccess: () => void;
  onBack: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export function EmailVerificationForm({ email, userId, onSuccess, onBack }: EmailVerificationFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setVerificationCode(value);
    
    // Clear error when user starts typing
    if (errors.verificationCode) {
      setErrors(prev => ({ ...prev, verificationCode: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed');
      }

      // Verification successful
      onSuccess();
    } catch (error) {
      setErrors({
        verificationCode: error instanceof Error ? error.message : 'Verification failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend verification code');
      }

      setResendMessage('Verification code has been resent to your email');
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const isFormValid = (): boolean => {
    return verificationCode.trim() !== '' && verificationCode.length === 6;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Email Verification
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent a 6-digit verification code to <span className="font-medium text-gray-900">{email}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Please check your email and enter the verification code below to complete your registration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code *
          </label>
          <input
            type="text"
            id="verificationCode"
            name="verificationCode"
            value={verificationCode}
            onChange={handleInputChange}
            maxLength={6}
            className={`w-full px-4 py-3 text-center text-lg font-mono border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.verificationCode ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="000000"
            style={{ letterSpacing: '0.5em' }}
          />
          {errors.verificationCode && (
            <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
          )}
        </div>

        <div className="text-center">
          <Button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="px-8 py-3 text-base"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </div>
      </form>

      <div className="text-center space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-emerald-600 hover:text-emerald-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'Resend verification code'}
          </button>
        </div>

        {resendMessage && (
          <div className={`p-3 rounded-md text-sm ${
            resendMessage.includes('Failed') 
              ? 'bg-red-50 text-red-800 border border-red-200' 
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {resendMessage}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="px-6 py-2"
          >
            Back to Employer Information
          </Button>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-emerald-800">
              Need help?
            </h3>
            <div className="mt-2 text-sm text-emerald-700">
              <p>
                If you're having trouble receiving the verification code, please check your spam folder or contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
