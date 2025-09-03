'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { CandidateAuthGuard } from '@/components/auth/CandidateAuthGuard';

interface CandidateData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  nic: string | null;
  gender: string | null;
  date_of_birth: Date | null;
  address: string | null;
  phone: string | null;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  nic: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone: string;
}

export default function CompleteProfilePage() {
  return (
    <CandidateAuthGuard>
      <CompleteProfileContent />
    </CandidateAuthGuard>
  );
}

function CompleteProfileContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    nic: '',
    gender: '',
    date_of_birth: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/candidate/login');
          return;
        }

        const response = await fetch('/api/candidate/profile/profile-completion-check', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.isProfileComplete) {
              // Profile is already complete, redirect to jobs
              router.push('/candidate/jobs');
              return;
            }
            
            // Pre-fill form with existing data
            setCandidateData(data.candidateData);
            setFormData({
              first_name: data.candidateData.first_name || '',
              last_name: data.candidateData.last_name || '',
              email: data.candidateData.email || '',
              nic: data.candidateData.nic || '',
              gender: data.candidateData.gender || '',
              date_of_birth: data.candidateData.date_of_birth 
                ? new Date(data.candidateData.date_of_birth).toISOString().split('T')[0] 
                : '',
              address: data.candidateData.address || '',
              phone: data.candidateData.phone || ''
            });
          }
        } else {
          setError('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, [router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/candidate/login');
        return;
      }

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email', 'nic', 'gender', 'date_of_birth', 'address', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]?.trim());
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Update profile using the basic-info API
      const response = await fetch('/api/candidate/profile/sections/basic-info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          nic: formData.nic,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          phone: formData.phone
        }),
      });

      if (response.ok) {
        console.log('✅ Basic info updated successfully');
        
        // Also update the user table with name and address if it came from Google
        const userResponse = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address
          }),
        });

        if (userResponse.ok) {
          console.log('✅ User profile updated successfully');
        } else {
          console.warn('⚠️ User profile update failed:', await userResponse.text());
        }

        // Profile updated successfully, redirect to jobs page
        console.log('✅ Profile updated successfully, redirecting to jobs page...');
        router.push('/candidate/jobs');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Complete Your Profile
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please fill in the required information to access job listings
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="First Name *"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('first_name', e.target.value)}
                  required
                />
                <FormInput
                  label="Last Name *"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('last_name', e.target.value)}
                  required
                />
              </div>

              <FormInput
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                disabled
                helperText="Email cannot be changed as it's linked to your account"
                variant="filled"
              />

              <FormInput
                label="NIC Number *"
                name="nic"
                type="text"
                value={formData.nic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nic', e.target.value)}
                placeholder="Enter your NIC number"
                required
              />

              <FormInput
                label="Phone Number *"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Gender *"
                  name="gender"
                  value={formData.gender}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('gender', e.target.value)}
                  placeholder="Select gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                  ]}
                  required
                />
                <FormInput
                  label="Date of Birth *"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('date_of_birth', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full address"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/candidate/login')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Complete Profile'
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