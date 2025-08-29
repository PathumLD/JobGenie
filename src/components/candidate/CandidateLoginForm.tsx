'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { GoogleSignInButton } from './GoogleSignInButton';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function CandidateLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, id } = e.target;
    
    // Use either name or extract from id as fallback
    const fieldName = name || (id ? id.replace('input-', '') : '');
    
    if (fieldName && (fieldName === 'email' || fieldName === 'password')) {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
      // Clear error when user starts typing
      if (errors[fieldName as keyof LoginFormErrors]) {
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is a candidate
        if (data.user_type === 'candidate') {
          // Redirect to candidate dashboard or landing page
          router.push('/candidate/jobs');
        } else {
          setErrors({ general: 'This login is for candidates only. Please use the appropriate login page.' });
        }
      } else {
        setErrors({ general: data.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome Back
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Sign in to your candidate account
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            leftIcon={<span className="text-gray-400">📧</span>}
            error={errors.email}
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            leftIcon={<span className="text-gray-400">🔒</span>}
            error={errors.password}
            required
          />

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center space-x-2">
                <span>⚠️</span>
                <span>{errors.general}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/candidate/forgot-password"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <GoogleSignInButton 
          onError={(error) => setErrors({ general: `Google Sign-In failed: ${error}` })}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New to Job Genie?</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/candidate/register">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Create Candidate Account
            </Button>
          </Link>
          
          <Link href="/employer/login">
            <Button
              variant="ghost"
              className="w-full h-12 text-base font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            >
              I&apos;m an Employer
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-emerald-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
