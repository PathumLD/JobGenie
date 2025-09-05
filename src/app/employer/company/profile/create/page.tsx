'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { 
  CompanyProfileFormData, 
  CompanyProfileResponse, 
  CompanyProfileErrorResponse,
  FormErrors,
  CompanySizeOption,
  CompanyTypeOption
} from '@/types/company-profile';

const companySizeOptions: CompanySizeOption[] = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'one_to_ten', label: '1-10 employees' },
  { value: 'eleven_to_fifty', label: '11-50 employees' },
  { value: 'fifty_one_to_two_hundred', label: '51-200 employees' },
  { value: 'two_hundred_one_to_five_hundred', label: '201-500 employees' },
  { value: 'five_hundred_one_to_one_thousand', label: '501-1000 employees' },
  { value: 'one_thousand_plus', label: '1000+ employees' }
];

const companyTypeOptions: CompanyTypeOption[] = [
  { value: 'startup', label: 'Startup' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'agency', label: 'Agency' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' }
];

export default function CreateCompanyProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyProfileFormData>({
    name: '',
    contact: '',
    description: '',
    website: '',
    headquarters_location: '',
    founded_year: null,
    company_size: 'startup',
    company_type: 'startup',
    slug: '',
    industry: '',
    logo: undefined,
    social_media_links: {
      linkedin: ''
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/employer/login');
          return;
        }

        const response = await fetch('/api/employer/company/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success && data.company) {
          setFormData(prev => ({
            ...prev,
            name: data.company.name,
            industry: data.company.industry
          }));
        } else {
          throw new Error(data.error || 'Failed to fetch company data');
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCompanyData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      social_media_links: {
        ...prev.social_media_links,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error when user selects a file
      if (errors.logo) {
        setErrors(prev => ({ ...prev, logo: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Company description is required';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (starting with http:// or https://)';
    }

    if (!formData.headquarters_location.trim()) {
      newErrors.headquarters_location = 'Headquarters location is required';
    }

    if (formData.founded_year && (formData.founded_year < 1800 || formData.founded_year > new Date().getFullYear())) {
      newErrors.founded_year = 'Please enter a valid founded year';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Company slug is required';
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    // Validate LinkedIn URL
    if (formData.social_media_links.linkedin && !/^https?:\/\/.+/.test(formData.social_media_links.linkedin)) {
      newErrors.social_linkedin = 'Please enter a valid LinkedIn URL';
    }

    // Validate logo file
    if (formData.logo) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(formData.logo.type)) {
        newErrors.logo = 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.';
      } else if (formData.logo.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.logo = 'File size too large. Maximum size is 5MB.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/employer/login');
        return;
      }

      // Create FormData for multipart upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('contact', formData.contact);
      submitFormData.append('description', formData.description);
      submitFormData.append('website', formData.website);
      submitFormData.append('headquarters_location', formData.headquarters_location);
      submitFormData.append('founded_year', formData.founded_year?.toString() || '');
      submitFormData.append('company_size', formData.company_size);
      submitFormData.append('company_type', formData.company_type);
      submitFormData.append('slug', formData.slug);
      submitFormData.append('industry', formData.industry);
      submitFormData.append('linkedin', formData.social_media_links.linkedin || '');
      
      if (formData.logo) {
        submitFormData.append('logo', formData.logo);
      }

      const response = await fetch('/api/employer/company/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      const result: CompanyProfileResponse | CompanyProfileErrorResponse = await response.json();

      if (!response.ok) {
        const errorMsg = 'error' in result && result.error
          ? result.error
          : 'Failed to create company profile';
        throw new Error(errorMsg);
      }

      if ('success' in result && result.success) {
        // Profile created successfully, redirect to view profile
        router.push('/employer/company/profile/view');
      } else {
        throw new Error('Failed to create company profile');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Company Profile</h1>
          <p className="mt-2 text-gray-600">
            Complete your company profile to start posting jobs and attracting top talent.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={formData.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Company name cannot be changed</p>
                </div>
                <div>
                  <FormInput
                    label="Contact Number"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    error={errors.contact}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                {logoPreview ? (
                  <div className="mt-1">
                    <div className="flex items-center space-x-4">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                      />
                      <div>
                        <p className="text-sm text-gray-600">Selected: {formData.logo?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setFormData(prev => ({ ...prev, logo: undefined }));
                            const fileInput = document.getElementById('logo') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="mt-1 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="logo"
                          className="relative flex items-center justify-center cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                        >
                          <span className="text-center items-center justify-center flex mx-auto ml-8">Upload a file</span>
                          <input
                            id="logo"
                            name="logo"
                            type="file"
                            className="sr-only text-center items-center justify-center"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
                {errors.logo && (
                  <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your company, its mission, and what makes it unique..."
                  className={errors.description ? 'border-red-300' : ''}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormInput
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    error={errors.website}
                    placeholder="https://www.example.com"
                  />
                </div>
                <div>
                  <FormInput
                    label="Headquarters Location"
                    name="headquarters_location"
                    value={formData.headquarters_location}
                    onChange={handleInputChange}
                    error={errors.headquarters_location}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormInput
                    label="Company Slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    error={errors.slug}
                    required
                    placeholder="company slug"
                  />
                </div>
                <div>
                  <FormInput
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    error={errors.industry}
                    required
                    placeholder="Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <FormInput
                    label="Founded Year"
                    name="founded_year"
                    type="number"
                    value={formData.founded_year || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      founded_year: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    error={errors.founded_year}
                    placeholder="2020"
                  />
                </div>
                <div>
                  <FormSelect
                    label="Company Size"
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleSelectChange}
                    options={companySizeOptions}
                    error={errors.company_size}
                  />
                </div>
                <div>
                  <FormSelect
                    label="Company Type"
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleSelectChange}
                    options={companyTypeOptions}
                    error={errors.company_type}
                  />
                </div>
              </div>

              <div>
                <FormInput
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.social_media_links.linkedin}
                  onChange={handleSocialMediaChange}
                  error={errors.social_linkedin}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating Profile...</span>
                    </div>
                  ) : (
                    'Create Profile'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
