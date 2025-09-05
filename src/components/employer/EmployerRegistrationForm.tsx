'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CompanyDataForm } from './CompanyDataForm';
import { EmployerDataForm } from './EmployerDataForm';
import { EmailVerificationForm } from './EmailVerificationForm';
import type { EmployerRegistrationRequest } from '@/types/api';

type RegistrationStep = 'company' | 'employer' | 'verification';

interface CompanyData {
  company_name: string;
  business_registration_no: string;
  business_registration_certificate: File | null;
  business_registered_address: string;
  industry: string;
}

interface EmployerData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export function EmployerRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('company');
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    business_registration_no: '',
    business_registration_certificate: null,
    business_registered_address: '',
    industry: ''
  });
  const [employerData, setEmployerData] = useState<EmployerData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState<string>('');

  const handleCompanyDataSubmit = (data: CompanyData) => {
    setCompanyData(data);
    setCurrentStep('employer');
    setErrorMessage('');
  };

  const handleEmployerDataSubmit = async (data: EmployerData) => {
    setEmployerData(data);
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('company_name', companyData.company_name);
      formData.append('business_registration_no', companyData.business_registration_no);
      formData.append('business_registration_certificate', companyData.business_registration_certificate!);
      formData.append('business_registered_address', companyData.business_registered_address);
      formData.append('industry', companyData.industry);
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirm_password);

      const response = await fetch('/api/auth/register-employer', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setUserId(result.user.id);
      setSuccessMessage('Registration successful! Please check your email for verification.');
      setCurrentStep('verification');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCompany = () => {
    setCurrentStep('company');
    setErrorMessage('');
  };

  const handleBackToEmployer = () => {
    setCurrentStep('employer');
    setErrorMessage('');
  };

  const handleVerificationSuccess = () => {
    // Redirect to employer dashboard or login
    window.location.href = '/employer/login';
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'company' || currentStep === 'employer' || currentStep === 'verification'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`ml-2 text-sm font-medium ${
            currentStep === 'company' ? 'text-emerald-600' : 'text-gray-500'
          }`}>
            Company Information
          </div>
        </div>
        
        <div className="mx-4 w-12 h-0.5 bg-gray-300"></div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'employer' || currentStep === 'verification'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`ml-2 text-sm font-medium ${
            currentStep === 'employer' ? 'text-emerald-600' : 'text-gray-500'
          }`}>
            Employer Information
          </div>
        </div>
        
        <div className="mx-4 w-12 h-0.5 bg-gray-300"></div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'verification'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
          <div className={`ml-2 text-sm font-medium ${
            currentStep === 'verification' ? 'text-emerald-600' : 'text-gray-500'
          }`}>
            Email Verification
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {renderStepIndicator()}
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Login Link */}
      <div className="text-center mb-6 border-b border-gray-300 pb-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/employer/login" 
            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      {currentStep === 'company' && (
        <CompanyDataForm
          data={companyData}
          onSubmit={handleCompanyDataSubmit}
          isLoading={isLoading}
        />
      )}

      {currentStep === 'employer' && (
        <EmployerDataForm
          data={employerData}
          onSubmit={handleEmployerDataSubmit}
          onBack={handleBackToCompany}
          isLoading={isLoading}
        />
      )}

      {currentStep === 'verification' && (
        <EmailVerificationForm
          email={employerData.email}
          userId={userId}
          onSuccess={handleVerificationSuccess}
          onBack={handleBackToEmployer}
        />
      )}
    </div>
  );
}
