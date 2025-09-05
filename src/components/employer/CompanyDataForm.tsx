'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CompanyData {
  company_name: string;
  business_registration_no: string;
  business_registration_certificate: File | null;
  business_registered_address: string;
  industry: string;
}

interface CompanyDataFormProps {
  readonly data: CompanyData;
  readonly onSubmit: (data: CompanyData) => void;
  readonly isLoading: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface DocumentValidationResult {
  companyNameMatch: boolean;
  registrationNoMatch: boolean;
  canProceed: boolean;
  mismatches: string[];
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Transportation',
  'Energy',
  'Media & Entertainment',
  'Food & Beverage',
  'Automotive',
  'Aerospace',
  'Construction',
  'Consulting',
  'Other'
];

export function CompanyDataForm({ data, onSubmit, isLoading }: CompanyDataFormProps) {
  const [formData, setFormData] = useState<CompanyData>(data);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear validation result when form data changes
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const analyzeDocument = async (file: File) => {
    if (!formData.company_name.trim() || !formData.business_registration_no.trim()) {
      setErrors(prev => ({
        ...prev,
        business_registration_certificate: 'Please fill in company name and registration number first'
      }));
      return;
    }

    setIsAnalyzing(true);
    setValidationResult(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('companyName', formData.company_name);
      formDataToSend.append('businessRegistrationNo', formData.business_registration_no);
      formDataToSend.append('documentFile', file);

      const response = await fetch('/api/employer/document-analysis', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      if (result.success && result.validationResult) {
        setValidationResult(result.validationResult);
        
        if (!result.validationResult.canProceed) {
          setErrors(prev => ({
            ...prev,
            business_registration_certificate: 'Document validation failed. Please check the mismatches below.'
          }));
        } else {
          // Clear any existing errors
          setErrors(prev => ({ ...prev, business_registration_certificate: '' }));
        }
      }
    } catch (error) {
      console.error('Document analysis error:', error);
      setErrors(prev => ({
        ...prev,
        business_registration_certificate: 'Failed to analyze document. Please try again.'
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, business_registration_certificate: file }));
      if (errors.business_registration_certificate) {
        setErrors(prev => ({ ...prev, business_registration_certificate: '' }));
      }
      
      // Automatically analyze the document
      analyzeDocument(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      setFormData(prev => ({ ...prev, business_registration_certificate: files[0] }));
      if (errors.business_registration_certificate) {
        setErrors(prev => ({ ...prev, business_registration_certificate: '' }));
      }
      
      // Automatically analyze the document
      analyzeDocument(files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    } else if (formData.company_name.length > 200) {
      newErrors.company_name = 'Company name must be less than 200 characters';
    }

    if (!formData.business_registration_no.trim()) {
      newErrors.business_registration_no = 'Business registration number is required';
    } else if (formData.business_registration_no.length > 20) {
      newErrors.business_registration_no = 'Business registration number must be less than 20 characters';
    }

    if (!formData.business_registration_certificate) {
      newErrors.business_registration_certificate = 'Business registration certificate is required';
    } else if (validationResult && !validationResult.canProceed) {
      newErrors.business_registration_certificate = 'Document validation failed. Please check the mismatches below.';
    }

    if (!formData.business_registered_address.trim()) {
      newErrors.business_registered_address = 'Business registered address is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isFormValid = (): boolean => {
    return formData.company_name.trim() !== '' &&
           formData.business_registration_no.trim() !== '' &&
           formData.business_registration_certificate !== null &&
           formData.business_registered_address.trim() !== '' &&
           formData.industry !== '' &&
           (!validationResult || validationResult.canProceed) &&
           !isAnalyzing;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Company Information
        </h2>
        <p className="text-gray-600 mb-6">
          Please provide your company details. This information will be used to create your company profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.company_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter company name"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="business_registration_no" className="block text-sm font-medium text-gray-700 mb-2">
            Business Registration No *
          </label>
          <input
            type="text"
            id="business_registration_no"
            name="business_registration_no"
            value={formData.business_registration_no}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.business_registration_no ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter registration number"
          />
          {errors.business_registration_no && (
            <p className="mt-1 text-sm text-red-600">{errors.business_registration_no}</p>
          )}
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.industry ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="business_registered_address" className="block text-sm font-medium text-gray-700 mb-2">
            Business Registered Address *
          </label>
          <textarea
            id="business_registered_address"
            name="business_registered_address"
            value={formData.business_registered_address}
            onChange={handleInputChange as any}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.business_registered_address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter complete business address"
          />
          {errors.business_registered_address && (
            <p className="mt-1 text-sm text-red-600">{errors.business_registered_address}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="business_registration_certificate" className="block text-sm font-medium text-gray-700 mb-2">
            Business Registration Certificate *
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300'
            } ${errors.business_registration_certificate ? 'border-red-300' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('business_registration_certificate')?.click();
              }
            }}
          >
            <input
              type="file"
              id="business_registration_certificate"
              name="business_registration_certificate"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label htmlFor="business_registration_certificate" className="cursor-pointer">
              <span className="sr-only">Upload business registration certificate</span>
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-gray-600">
                  <span className="font-medium text-emerald-600 hover:text-emerald-500">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB
                </p>
              </div>
            </label>
          </div>
          {formData.business_registration_certificate && (
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {formData.business_registration_certificate.name}
            </div>
          )}

          {/* Document Analysis Status */}
          {isAnalyzing && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-blue-700">
                  Analyzing document... This may take a few moments.
                </span>
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && !isAnalyzing && (
            <div className={`mt-3 p-3 rounded-md border ${
              validationResult.canProceed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {validationResult.canProceed ? (
                  <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    validationResult.canProceed ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.canProceed 
                      ? 'Document validation successful!' 
                      : 'Document validation failed'
                    }
                  </p>
                  {validationResult.mismatches.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-red-700 font-medium">Mismatches found:</p>
                      <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                        {validationResult.mismatches.map((mismatch, index) => (
                          <li key={`mismatch-${index}`}>{mismatch}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {errors.business_registration_certificate && (
            <p className="mt-1 text-sm text-red-600">{errors.business_registration_certificate}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="px-6 py-2"
        >
          {(() => {
            if (isLoading) return 'Processing...';
            if (isAnalyzing) return 'Analyzing Document...';
            if (validationResult && !validationResult.canProceed) return 'Fix Document Issues';
            return 'Continue to Employer Information';
          })()}
        </Button>
      </div>
    </form>
  );
}
