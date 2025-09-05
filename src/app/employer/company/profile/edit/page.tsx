'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput } from '@/components/ui/form-input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { 
  CompanyProfileFormData, 
  CompanyProfileUpdateResponse, 
  CompanyProfileErrorResponse,
  CompanyProfileStatusResponse,
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

export default function EditCompanyProfilePage() {
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
    const fetchCompanyProfile = async () => {
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

        const data: CompanyProfileStatusResponse = await response.json();

        if (!response.ok) {
          throw new Error((data as any)?.error || 'Failed to fetch company profile');
        }

        if (data.success && data.company) {
          const company = data.company;
          setFormData({
            name: company.name,
            contact: company.contact || '',
            description: company.description || '',
            website: company.website || '',
            headquarters_location: company.headquarters_location || '',
            founded_year: company.founded_year,
            company_size: company.company_size,
            company_type: company.company_type,
            slug: company.slug || '',
            industry: company.industry,
            social_media_links: company.social_media_links || {
              linkedin: ''
            }
          });
        } else {
          throw new Error('Company profile not found');
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCompanyProfile();
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
      if (errorMessage) {
        setErrorMessage('');
      }
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

    // Validate logo file
    if (formData.logo) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(formData.logo.type)) {
        newErrors.logo = 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.';
      }
      if (formData.logo.size > 5 * 1024 * 1024) {
        newErrors.logo = 'File size must be less than 5MB.';
      }
    }

    // Validate LinkedIn URL
    if (formData.social_media_links.linkedin && !/^https?:\/\/.+/.test(formData.social_media_links.linkedin)) {
      newErrors.social_linkedin = 'Please enter a valid LinkedIn URL';
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
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      const result: CompanyProfileUpdateResponse | CompanyProfileErrorResponse = await response.json();

      if (!response.ok) {
        const errorMsg = 'error' in result && result.error
          ? result.error
          : 'Failed to update company profile';
        throw new Error(errorMsg);
      }

      if ('success' in result && result.success) {
        // Profile updated successfully, redirect to view profile
        router.push('/employer/company/profile/view');
      } else {
        throw new Error('Failed to update company profile');
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
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Company Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your company profile information.
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
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="logo"
                        name="logo"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                      {errors.logo && (
                        <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                      )}
                    </div>
                    {(logoPreview || formData.logo) && (
                      <div className="flex-shrink-0">
                        <img
                          src={logoPreview || (formData.logo ? URL.createObjectURL(formData.logo) : '')}
                          alt="Logo preview"
                          className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
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
                    placeholder="company-name"
                  />
                  <p className="mt-1 text-xs text-gray-500">Used in URLs (letters, numbers, and hyphens only)</p>
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
                  <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    id="company_size"
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {companySizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.company_size && (
                    <p className="text-red-500 text-xs mt-1">{errors.company_size}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="company_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Type
                  </label>
                  <select
                    id="company_type"
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {companyTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.company_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.company_type}</p>
                  )}
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
                  onClick={() => router.push('/employer/company/profile/view')}
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
                      <span className="ml-2">Updating Profile...</span>
                    </div>
                  ) : (
                    'Update Profile'
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
