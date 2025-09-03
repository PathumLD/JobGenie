'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { CandidateRegistrationRequest } from '@/types/api';
import Link from 'next/link';

interface CandidateRegistrationFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface FormData extends Omit<CandidateRegistrationRequest, 'date_of_birth'> {
  date_of_birth: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CandidateRegistrationForm({ isLoading, setIsLoading }: CandidateRegistrationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    nic: '',
    passport: '',
    gender: 'prefer_not_to_say',
    date_of_birth: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Check if passwords are valid for enabling submit button
  const arePasswordsValid = (): boolean => {
    return formData.password.length >= 8 && 
           formData.confirm_password.length > 0 && 
           formData.password === formData.confirm_password;
  };

  // Check if form is ready for submission
  const isFormReady = (): boolean => {
    return !isLoading && arePasswordsValid();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length > 100) {
      newErrors.first_name = 'First name must be less than 100 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length > 100) {
      newErrors.last_name = 'Last name must be less than 100 characters';
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC/Passport is required';
    } else if (formData.nic.length > 50) {
      newErrors.nic = 'NIC/Passport must be less than 50 characters';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 100) {
        newErrors.date_of_birth = 'Age must be between 16 and 100 years';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be less than 20 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Registration successful! Please check your email to verify your account.');
        
        // Store email for redirect before resetting form
        const userEmail = formData.email;
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          nic: '',
          passport: '',
          gender: 'prefer_not_to_say',
          date_of_birth: '',
          address: '',
          phone: '',
          email: '',
          password: '',
          confirm_password: ''
        });
        
        // Redirect to verification page after 1 second
        setTimeout(() => {
          router.push(`/candidate/verify-email?email=${encodeURIComponent(userEmail)}`);
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        if (data.details) {
          const fieldErrors: FormErrors = {};
          data.details.forEach((detail: { path: string[]; message: string }) => {
            if (detail.path.length > 0) {
              fieldErrors[detail.path[0]] = detail.message;
            }
          });
          setErrors(fieldErrors);
        }
      }
         } catch {
       setErrorMessage('Network error. Please check your connection and try again.');
     } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    return `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
      errors[fieldName] 
        ? 'border-red-300 bg-red-50' 
        : 'border-gray-300 bg-white hover:border-gray-400'
    }`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className={getInputClassName('first_name')}
            placeholder="Enter first name"
            disabled={isLoading}
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className={getInputClassName('last_name')}
            placeholder="Enter last name"
            disabled={isLoading}
          />
          {errors.last_name && (
            <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* NIC and Passport */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
            NIC *
          </label>
          <input
            type="text"
            id="nic"
            name="nic"
            value={formData.nic}
            onChange={handleInputChange}
            className={getInputClassName('nic')}
            placeholder="Enter NIC"
            disabled={isLoading}
          />
          {errors.nic && (
            <p className="text-red-500 text-xs mt-1">{errors.nic}</p>
          )}
        </div>

        <div>
          <label htmlFor="passport" className="block text-sm font-medium text-gray-700 mb-1">
            Passport (Optional)
          </label>
          <input
            type="text"
            id="passport"
            name="passport"
            value={formData.passport}
            onChange={handleInputChange}
            className={getInputClassName('passport')}
            placeholder="Enter passport number"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Gender and Date of Birth */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={getInputClassName('gender')}
            disabled={isLoading}
          >
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            className={getInputClassName('date_of_birth')}
            disabled={isLoading}
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={getInputClassName('address')}
          placeholder="Enter your address"
          disabled={isLoading}
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={getInputClassName('phone')}
          placeholder="Enter phone number"
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={getInputClassName('email')}
          placeholder="Enter email address"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={getInputClassName('password')}
              placeholder="Enter password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-2.16 3.19m-6.72-3.19A10.07 10.07 0 0 1 12 4c-7 0-11 8-11 8a18.45 18.45 0 0 1 5.06-5.94" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                )}
              </svg>
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
          {formData.password && !errors.password && (
            <p className={`text-xs mt-1 ${
              formData.password.length >= 8
                ? 'text-emerald-600'
                : 'text-gray-500'
            }`}>
              {formData.password.length >= 8
                ? '✓ Password meets requirements'
                : `${8 - formData.password.length} more characters needed`
              }
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              className={getInputClassName('confirm_password')}
              placeholder="Confirm password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-2.16 3.19m-6.72-3.19A10.07 10.07 0 0 1 12 4c-7 0-11 8-11 8a18.45 18.45 0 0 1 5.06-5.94" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                )}
              </svg>
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
          )}
          {formData.confirm_password && !errors.confirm_password && (
            <p className={`text-xs mt-1 ${
              formData.password === formData.confirm_password && formData.password.length >= 8
                ? 'text-emerald-600'
                : 'text-gray-500'
            }`}>
              {formData.password === formData.confirm_password && formData.password.length >= 8
                ? '✓ Passwords match'
                : formData.password.length < 8
                ? 'Password must be at least 8 characters'
                : 'Passwords do not match'
              }
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormReady()}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <GoogleSignInButton 
        onError={(error) => setErrorMessage(`Google Sign-In failed: ${error}`)}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Already have an account?</span>
        </div>
      </div>

      <div className="text-center">
        <a href="/candidate/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Sign in here
        </a>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Do you want to see jobs?</p>
        <Link 
          href="/jobs" 
          className="block text-lg border  px-4 py-2 rounded-md hover:bg-emerald-100 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-3 border-b border-emerald-100"
        >
          See all Jobs
        </Link>
      </div>

      {/* Terms and Privacy */}
      <p className="text-xs text-gray-500 text-center">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-emerald-600 hover:text-emerald-700 underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
