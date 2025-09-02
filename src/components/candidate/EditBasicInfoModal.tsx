'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { toast } from 'sonner';
import { BasicInfoSection } from '@/types/candidate-profile';
import { authenticatedFetch } from '@/lib/auth-storage';

interface EditBasicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  basicInfo: BasicInfoSection;
  onUpdate: (updatedInfo: BasicInfoSection) => void;
}

interface EditBasicInfoFormData {
  first_name: string;
  last_name: string;
  title: string;
  current_position: string;
  industry: string;
  location: string;
  country: string;
  city: string;
  address: string;
  phone1: string;
  phone2: string;
  personal_website: string;
  linkedin_url: string;
  github_url: string;
  bio: string;
  about: string;
  professional_summary: string;
  availability_status: 'available' | 'open_to_opportunities' | 'not_looking';
  availability_date: string;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  years_of_experience: number;
  total_years_experience: number;
  remote_preference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  open_to_relocation: boolean;
  willing_to_travel: boolean;
  work_authorization: 'citizen' | 'permanent_resident' | 'work_visa' | 'requires_sponsorship' | 'other' | '';
  notice_period: number;
  work_availability: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'volunteer';
  interview_ready: boolean;
  pre_qualified: boolean;
  // Additional fields
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  nic: string;
  passport: string;
  pronouns: string;
  disability_status: string;
  veteran_status: string;
  security_clearance: boolean;
  visa_assistance_needed: boolean;
  salary_visibility: 'confidential' | 'range_only' | 'exact' | 'negotiable' | '';
  expected_salary_min: number;
  expected_salary_max: number;
  currency: string;
  skills: string;
  certifications: string;
  awards: string;
  volunteer_experience: string;
}

export const EditBasicInfoModal: React.FC<EditBasicInfoModalProps> = ({
  isOpen,
  onClose,
  basicInfo,
  onUpdate
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<EditBasicInfoFormData>({
    defaultValues: {
      first_name: basicInfo.first_name || '',
      last_name: basicInfo.last_name || '',
      title: basicInfo.title || '',
      current_position: basicInfo.current_position || '',
      industry: basicInfo.industry || '',
      location: basicInfo.location || '',
      country: basicInfo.country || '',
      city: basicInfo.city || '',
      address: basicInfo.address || '',
      phone1: basicInfo.phone1 || '',
      phone2: basicInfo.phone2 || '',
      personal_website: basicInfo.personal_website || '',
      linkedin_url: basicInfo.linkedin_url || '',
      github_url: basicInfo.github_url || '',
      bio: basicInfo.bio || '',
      professional_summary: basicInfo.professional_summary || '',
      availability_status: basicInfo.availability_status || 'available',
      availability_date: basicInfo.availability_date ? new Date(basicInfo.availability_date).toISOString().split('T')[0] : '',
      experience_level: basicInfo.experience_level || 'entry',
      years_of_experience: basicInfo.years_of_experience || 0,
      total_years_experience: basicInfo.total_years_experience || 0,
      remote_preference: basicInfo.remote_preference || 'flexible',
      open_to_relocation: basicInfo.open_to_relocation || false,
      willing_to_travel: basicInfo.willing_to_travel || false,
      work_authorization: basicInfo.work_authorization || '',
      notice_period: basicInfo.notice_period || 30,
      work_availability: basicInfo.work_availability || 'full_time',
      interview_ready: basicInfo.interview_ready || false,
      pre_qualified: basicInfo.pre_qualified || false,
              // Additional fields
        date_of_birth: basicInfo.date_of_birth ? new Date(basicInfo.date_of_birth).toISOString().split('T')[0] : '',
      gender: basicInfo.gender || '',
      nic: basicInfo.nic || '',
      passport: basicInfo.passport || '',
      pronouns: basicInfo.pronouns || '',
      disability_status: basicInfo.disability_status || '',
      veteran_status: basicInfo.veteran_status || '',
      security_clearance: basicInfo.security_clearance || false,
      visa_assistance_needed: basicInfo.visa_assistance_needed || false,
      salary_visibility: basicInfo.salary_visibility || '',
      expected_salary_min: basicInfo.expected_salary_min || 0,
      expected_salary_max: basicInfo.expected_salary_max || 0,
      currency: basicInfo.currency || '',
      skills: basicInfo.skills || '',
      certifications: basicInfo.certifications || '',
      awards: basicInfo.awards || '',
      volunteer_experience: basicInfo.volunteer_experience || ''
    }
  });

  const handleSubmit = async (data: EditBasicInfoFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!data.first_name || !data.last_name) {
        toast.error('First name and last name are required');
        return;
      }

      if (!data.title) {
        toast.error('Professional title is required');
        return;
      }

      if (!data.phone1) {
        toast.error('Phone number is required');
        return;
      }

      if (!data.location) {
        toast.error('Location is required');
        return;
      }

      const loadingToast = toast.loading('Updating profile...');

      const updateData = {
        basic_info: {
          first_name: data.first_name,
          last_name: data.last_name,
          title: data.title,
          current_position: data.current_position || null,
          industry: data.industry || null,
          location: data.location,
          country: data.country || null,
          city: data.city || null,
          address: data.address || null,
          phone1: data.phone1,
          phone2: data.phone2 || null,
          personal_website: data.personal_website || null,
          linkedin_url: data.linkedin_url || null,
          github_url: data.github_url || null,
          bio: data.bio || null,
          about: data.about || null,
          professional_summary: data.professional_summary || null,
          availability_status: data.availability_status,
          availability_date: data.availability_date ? new Date(data.availability_date) : null,
          experience_level: data.experience_level,
          years_of_experience: data.years_of_experience,
          total_years_experience: data.total_years_experience,
          remote_preference: data.remote_preference,
          open_to_relocation: data.open_to_relocation,
          willing_to_travel: data.willing_to_travel,
          work_authorization: data.work_authorization || null,
          notice_period: data.notice_period,
          work_availability: data.work_availability,
          interview_ready: data.interview_ready,
          pre_qualified: data.pre_qualified,
          // Additional fields
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
          gender: data.gender || null,
          nic: data.nic || null,
          passport: data.passport || null,
          pronouns: data.pronouns || null,
          disability_status: data.disability_status || null,
          veteran_status: data.veteran_status || null,
          security_clearance: data.security_clearance,
          visa_assistance_needed: data.visa_assistance_needed,
          salary_visibility: data.salary_visibility || null,
          expected_salary_min: data.expected_salary_min,
          expected_salary_max: data.expected_salary_max,
          currency: data.currency || null,
          skills: data.skills || null,
          certifications: data.certifications || null,
          awards: data.awards || null,
          volunteer_experience: data.volunteer_experience || null
        }
      };

      const profileFormData = new FormData();
      profileFormData.append('profileData', JSON.stringify(updateData));

      const response = await authenticatedFetch('/api/candidate/profile/update-profile', {
        method: 'PUT',
        body: profileFormData,
      });

      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedBasicInfo: BasicInfoSection = {
        ...basicInfo,
        ...updateData.basic_info
      };
      
      onUpdate(updatedBasicInfo);
      toast.success('Profile updated successfully!');
      onClose();
      
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Edit Basic Information</CardTitle>
            <Button
              variant="ghost"
              size="default"
              onClick={onClose}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="First Name *"
                {...methods.register('first_name', { required: true })}
              />
              <FormInput
                label="Last Name *"
                {...methods.register('last_name', { required: true })}
              />
              <FormInput
                label="Professional Title *"
                {...methods.register('title', { required: true })}
              />
              <FormInput
                label="Current Position"
                {...methods.register('current_position')}
              />
              <FormInput
                label="Industry"
                {...methods.register('industry')}
              />
              <FormInput
                label="Location *"
                {...methods.register('location', { required: true })}
              />
              <FormInput
                label="Phone *"
                {...methods.register('phone1', { required: true })}
              />
              <FormInput
                label="Alternative Phone"
                {...methods.register('phone2')}
              />
              <FormInput
                label="Country"
                {...methods.register('country')}
              />
              <FormInput
                label="City"
                {...methods.register('city')}
              />
              <FormInput
                label="Address"
                {...methods.register('address')}
              />
              <FormInput
                label="GitHub URL"
                {...methods.register('github_url')}
              />
              <FormInput
                label="LinkedIn URL"
                {...methods.register('linkedin_url')}
              />
              <FormInput
                label="Personal Website"
                {...methods.register('personal_website')}
              />
            </div>

            {/* Experience and Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Years of Experience"
                type="number"
                {...methods.register('years_of_experience', { valueAsNumber: true })}
              />
              <FormInput
                label="Total Years Experience"
                type="number"
                step="0.1"
                {...methods.register('total_years_experience', { valueAsNumber: true })}
              />
              <FormSelect
                label="Experience Level"
                {...methods.register('experience_level')}
                options={[
                  { value: 'entry', label: 'Entry Level' },
                  { value: 'junior', label: 'Junior' },
                  { value: 'mid', label: 'Mid Level' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'principal', label: 'Principal' }
                ]}
              />
              <FormSelect
                label="Remote Preference"
                {...methods.register('remote_preference')}
                options={[
                  { value: 'remote_only', label: 'Remote Only' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'onsite', label: 'On-site Only' },
                  { value: 'flexible', label: 'Flexible' }
                ]}
              />
              <FormSelect
                label="Availability Status"
                {...methods.register('availability_status')}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'open_to_opportunities', label: 'Open to Opportunities' },
                  { value: 'not_looking', label: 'Not Looking' }
                ]}
              />
              <FormInput
                label="Available From"
                type="date"
                {...methods.register('availability_date')}
              />
              <FormSelect
                label="Work Authorization"
                {...methods.register('work_authorization')}
                options={[
                  { value: '', label: 'Select Work Authorization' },
                  { value: 'citizen', label: 'Citizen' },
                  { value: 'permanent_resident', label: 'Permanent Resident' },
                  { value: 'work_visa', label: 'Work Visa' },
                  { value: 'requires_sponsorship', label: 'Requires Sponsorship' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              <FormSelect
                label="Work Availability"
                {...methods.register('work_availability')}
                options={[
                  { value: 'full_time', label: 'Full Time' },
                  { value: 'part_time', label: 'Part Time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'freelance', label: 'Freelance' },
                  { value: 'internship', label: 'Internship' },
                  { value: 'volunteer', label: 'Volunteer' }
                ]}
              />
              <FormInput
                label="Notice Period (Days)"
                type="number"
                {...methods.register('notice_period', { valueAsNumber: true })}
              />
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Date of Birth"
                type="date"
                {...methods.register('date_of_birth')}
              />
              <FormSelect
                label="Gender"
                {...methods.register('gender')}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer Not to Say' }
                ]}
              />
              <FormInput
                label="NIC (National Identity Card)"
                {...methods.register('nic')}
              />
              <FormInput
                label="Passport Number"
                {...methods.register('passport')}
              />
              <FormInput
                label="Expected Minimum Salary (LKR)"
                type="number"
                {...methods.register('expected_salary_min', { valueAsNumber: true })}
              />
              <FormInput
                label="Expected Maximum Salary (LKR)"
                type="number"
                {...methods.register('expected_salary_max', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  {...methods.register('bio')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Brief professional summary"
                />
              </div> */}
              
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                <textarea
                  {...methods.register('about')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Tell us about yourself"
                />
              </div> */}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                <textarea
                  {...methods.register('professional_summary')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Detailed professional summary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};
