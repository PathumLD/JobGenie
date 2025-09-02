'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { toast } from 'sonner';
import { authenticatedFetch } from '@/lib/auth-storage';

// Types
interface BasicInfo {
  first_name: string;
  last_name: string;
  title: string;
  current_position: string | null;
  industry: string | null;
  bio: string | null;
  about: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nic: string | null;
  passport: string | null;
  open_to_relocation: boolean | null;
  willing_to_travel: boolean | null;
  security_clearance: boolean | null;
  visa_assistance_needed: boolean | null;
  interview_ready: boolean | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  salary_visibility: string | null;
  notice_period: string | null;
  availability_status: string | null;
  availability_date: string | null;
  work_authorization: string | null;
  disability_status: string | null;
  veteran_status: string | null;
  pre_qualified: boolean | null;
  total_years_experience: number | null;
  work_availability: string | null;
  currency: string | null;
  pronouns: string | null;
  remote_preference: string | null;
  professional_summary: string | null;
  skills: string | null;
  certifications: string | null;
  awards: string | null;
  volunteer_experience: string | null;
  location: string | null;
  phone1: string;
  phone2: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  personal_website: string | null;
  years_of_experience: number | null;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
  profile_image_url: string | null;
}

interface WorkExperience {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
}

interface Education {
  degree_diploma: string;
  university_school: string;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  grade: string | null;
}

interface Skill {
  name: string;
  category: string | null;
}

interface Project {
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  role: string | null;
  responsibilities: string[];
  technologies: string[];
  tools: string[];
  methodologies: string[];
  is_confidential: boolean;
  can_share_details: boolean;
  url: string | null;
  repository_url: string | null;
  media_urls: string[];
  skills_gained: string[];
}

interface Certificate {
  name: string;
  issuing_authority: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  skill_ids: string[];
  media_url: string | null;
}

interface Volunteering {
  role: string;
  institution: string;
  cause: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  media_url: string | null;
}

interface Award {
  title: string;
  offered_by: string;
  associated_with: string | null;
  date: string;
  description: string | null;
  media_url: string | null;
  skill_ids: string[];
}

interface ProfileFormData {
  basic_info: BasicInfo;
  work_experiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  volunteering: Volunteering[];
  awards: Award[];
}

interface JobDesignation {
  id: number;
  name: string;
}

const sections = [
  { id: 'basic_info', label: 'Basic Information', description: 'Personal & contact details' },
  { id: 'work_experiences', label: 'Work Experience', description: 'Employment history' },
  { id: 'educations', label: 'Education', description: 'Academic background' },
  { id: 'skills', label: 'Skills', description: 'Technical & soft skills' },
  { id: 'projects', label: 'Projects', description: 'Portfolio & achievements' },
  { id: 'certificates', label: 'Certificates', description: 'Professional certifications' },
  { id: 'volunteering', label: 'Volunteering', description: 'Community involvement' },
  { id: 'awards', label: 'Awards', description: 'Recognition & honors' },
  { id: 'preview', label: 'Preview & Submit', description: 'Review all information' }
];

export default function CreateProfilePage() {
  const [activeSection, setActiveSection] = useState('basic_info');
  const [isSubmitting, setIsSubmitting] = useState(false);
     const [cvData, setCvData] = useState<{
     extracted_data?: {
       basic_info?: Partial<BasicInfo>;
       work_experiences?: WorkExperience[];
       educations?: Education[];
       skills?: Skill[];
       projects?: Project[];
       certificates?: Certificate[];
       volunteering?: Volunteering[];
       awards?: Award[];
     };
     resumeFile?: string;
   } | null>(null);
  const [designations, setDesignations] = useState<JobDesignation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const methods = useForm<ProfileFormData>({
    defaultValues: {
      basic_info: {
        first_name: '',
        last_name: '',
        title: '',
        current_position: '',
        industry: '',
        bio: '',
        about: '',
        country: '',
        city: '',
        location: '',
        phone1: '',
        phone2: '',
        github_url: '',
        linkedin_url: '',
        personal_website: '',
        years_of_experience: 0,
        experience_level: 'entry',
        profile_image_url: ''
      },
      work_experiences: [],
      educations: [],
      skills: [],
      projects: [],
      certificates: [],
      volunteering: [],
      awards: []
    }
  });

  const { fields: workExperienceFields, append: appendWorkExperience, remove: removeWorkExperience } = useFieldArray({
    control: methods.control,
    name: 'work_experiences'
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: methods.control,
    name: 'educations'
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: methods.control,
    name: 'skills'
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: methods.control,
    name: 'projects'
  });

  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({
    control: methods.control,
    name: 'certificates'
  });

  const { fields: volunteeringFields, append: appendVolunteering, remove: removeVolunteering } = useFieldArray({
    control: methods.control,
    name: 'volunteering'
  });

  const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
    control: methods.control,
    name: 'awards'
  });

  // Load CV data from localStorage
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const savedCvData = localStorage.getItem('cv_extraction_data');
    if (savedCvData) {
      try {
        const parsedData = JSON.parse(savedCvData);
        setCvData(parsedData);
        
        // Extract the actual data from the new structure
        const extractedData = parsedData.extracted_data || parsedData;
        
        // Pre-populate form with CV data
        methods.reset({
          basic_info: { ...methods.getValues().basic_info, ...extractedData.basic_info },
          work_experiences: extractedData.work_experiences || [],
          educations: extractedData.educations || [],
          skills: extractedData.skills || [],
          projects: extractedData.projects || [],
          certificates: extractedData.certificates || [],
          volunteering: extractedData.volunteering || [],
          awards: extractedData.awards || []
        });
        
        toast.success('CV data loaded successfully!');
      } catch (error) {
        console.error('Error loading CV data:', error);
      }
    }
  }, [methods]);

  // Load job designations
  useEffect(() => {
    const loadDesignations = async () => {
      try {
        const response = await authenticatedFetch('/api/candidate/designations');
        if (response.ok) {
          const data = await response.json();
          setDesignations(data.designations || []);
        }
      } catch (error) {
        console.error('Error loading designations:', error);
      }
    };
    loadDesignations();
  }, []);

  const handleDesignationSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setShowDesignationSuggestions(true);
    } else {
      setShowDesignationSuggestions(false);
    }
  };

  const handleDesignationSelect = (designation: JobDesignation) => {
    methods.setValue('basic_info.title', designation.name);
    setSearchQuery(designation.name);
    setShowDesignationSuggestions(false);
  };

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Store the file for later upload
    setSelectedImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImageUrl(previewUrl);
    
    toast.success('Profile image selected! It will be uploaded when you create your profile.');
  };

     const handleSubmitProfile = async () => {
     if (isSubmitting) return;
     
     setIsSubmitting(true);
     
     try {
       const formData = methods.getValues();
       
       // Validate required fields
       if (!formData.basic_info.first_name || !formData.basic_info.last_name) {
         toast.error('First name and last name are required');
         setActiveSection('basic_info');
         return;
       }

       if (!formData.basic_info.title) {
         toast.error('Professional title is required');
         setActiveSection('basic_info');
         return;
       }

       if (!formData.basic_info.phone1) {
         toast.error('Phone number is required');
         setActiveSection('basic_info');
         return;
       }

       if (!formData.basic_info.location) {
         toast.error('Location is required');
         setActiveSection('basic_info');
         return;
       }

       const loadingToast = toast.loading('Saving your profile...');
      
      // First, upload image if selected
      let imageUrl = formData.basic_info.profile_image_url;
      if (selectedImageFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('profile_image', selectedImageFile);

          const imageResponse = await authenticatedFetch('/api/candidate/profile/upload-image', {
            method: 'POST',
            body: imageFormData,
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            throw new Error(errorData.message || 'Failed to upload profile image');
          }

          const imageResult = await imageResponse.json();
          imageUrl = imageResult.data?.profile_image_url;
          toast.success('Profile image uploaded successfully!');
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload profile image');
          setIsSubmitting(false);
          return;
        }
      }

      // Update form data with new image URL
      const updatedFormData = {
        ...formData,
        basic_info: {
          ...formData.basic_info,
          profile_image_url: imageUrl
        }
      };
      
                    // Get the extracted resume file from localStorage if available
       let extractedResumeFile: File | null = null;
       if (typeof window !== 'undefined') {
         const cvData = localStorage.getItem('cv_extraction_data');
         if (cvData) {
           try {
             const parsedCvData = JSON.parse(cvData);
             if (parsedCvData.resumeFile) {
               // Convert base64 back to file
               const base64Response = await fetch(parsedCvData.resumeFile);
               const blob = await base64Response.blob();
               extractedResumeFile = new File([blob], 'extracted_resume.pdf', { type: 'application/pdf' });
             }
           } catch (error) {
             console.log('No resume file found in CV data');
           }
         }
       }
       
       // Save profile using update API (creates if doesn't exist)
       const profileFormData = new FormData();
       profileFormData.append('profileData', JSON.stringify(updatedFormData));
       
       if (selectedImageFile) {
         profileFormData.append('profileImage', selectedImageFile);
       }
       
       if (extractedResumeFile) {
         profileFormData.append('extractedResume', extractedResumeFile);
       }

      console.log('🔄 Sending profile update request...');
      const response = await authenticatedFetch('/api/candidate/profile/update-profile', {
        method: 'PUT',
        body: profileFormData,
      });

      console.log('📡 Response status:', response.status);
      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Profile update failed:', errorData);
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      console.log('✅ Profile update successful:', result);
      toast.success('Profile saved successfully!');
      
      // Clean up localStorage and preview URL
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cv_extraction_data');
      }
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      
             // Show success message with updated records count
       const recordCounts = result.data.updated_records;
       const totalRecords = Object.values(recordCounts).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0);
       
       toast.success(`Profile saved with ${totalRecords} records! Redirecting...`);
      
      setTimeout(() => {
        router.push('/candidate/view-profile');
      }, 3000);
      
         } catch (error) {
       console.error('Profile save error:', error);
       toast.error(error instanceof Error ? error.message : 'Failed to save profile');
     } finally {
       setIsSubmitting(false);
     }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const renderBasicInfoSection = () => (
    <div className="space-y-6">
      {/* Profile Image Upload */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {previewImageUrl ? (
              <img 
                src={previewImageUrl} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : methods.watch('basic_info.profile_image_url') ? (
              <img 
                src={methods.watch('basic_info.profile_image_url') || ''} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
            title={selectedImageFile ? 'Change image' : 'Add image'}
          >
            {selectedImageFile ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </Button>
        </div>
                 <div>
           <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
           <p className="text-sm text-gray-500">
             {selectedImageFile ? 'Image selected! Will be uploaded when you update your profile.' : 'Select a professional photo (max 5MB)'}
           </p>
           {cvData?.resumeFile && (
             <div className="mt-2 p-2 bg-blue-50 rounded-lg">
               <p className="text-sm text-blue-700">
                 📄 Resume extracted from CV - will be saved with your profile
               </p>
             </div>
           )}
         </div>
      </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormInput
           label="First Name *"
           {...methods.register('basic_info.first_name', { required: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.first_name || ''}
         />
         <FormInput
           label="Last Name *"
           {...methods.register('basic_info.last_name', { required: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.last_name || ''}
         />
         
         {/* Job Title with Designation Search */}
         <div className="relative">
           <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title *</label>
           <input
             type="text"
             value={searchQuery}
             onChange={(e) => handleDesignationSearch(e.target.value)}
             placeholder="Start typing to search job titles..."
             className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
           />
           {showDesignationSuggestions && (
             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
               {designations
                 .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                 .slice(0, 10)
                 .map((designation) => (
                   <div
                     key={designation.id}
                     className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                     onClick={() => handleDesignationSelect(designation)}
                   >
                     {designation.name}
                   </div>
                 ))}
             </div>
           )}
         </div>

         <FormInput
           label="Current Position"
           {...methods.register('basic_info.current_position')}
           defaultValue={cvData?.extracted_data?.basic_info?.current_position || ''}
         />
         <FormInput
           label="Industry"
           {...methods.register('basic_info.industry')}
           defaultValue={cvData?.extracted_data?.basic_info?.industry || ''}
         />
         <FormInput
           label="Location *"
           {...methods.register('basic_info.location', { required: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.location || ''}
         />
         <FormInput
           label="Phone *"
           {...methods.register('basic_info.phone1', { required: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.phone1 || ''}
         />
         <FormInput
           label="Alternative Phone"
           {...methods.register('basic_info.phone2')}
           defaultValue={cvData?.extracted_data?.basic_info?.phone2 || ''}
         />
         <FormInput
           label="Country"
           {...methods.register('basic_info.country')}
           defaultValue={cvData?.extracted_data?.basic_info?.country || ''}
         />
         <FormInput
           label="City"
           {...methods.register('basic_info.city')}
           defaultValue={cvData?.extracted_data?.basic_info?.city || ''}
         />
         <FormInput
           label="Address"
           {...methods.register('basic_info.address')}
           defaultValue={cvData?.extracted_data?.basic_info?.address || ''}
         />
         <FormInput
           label="Years of Experience"
           type="number"
           {...methods.register('basic_info.years_of_experience', { valueAsNumber: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.years_of_experience || 0}
         />
         <FormSelect
           label="Experience Level"
           {...methods.register('basic_info.experience_level')}
           defaultValue={cvData?.extracted_data?.basic_info?.experience_level || 'entry'}
           options={[
             { value: 'entry', label: 'Entry Level' },
             { value: 'junior', label: 'Junior' },
             { value: 'mid', label: 'Mid Level' },
             { value: 'senior', label: 'Senior' },
             { value: 'lead', label: 'Lead' },
             { value: 'principal', label: 'Principal' }
           ]}
         />
       </div>

       {/* Additional Personal Information */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormInput
           label="Date of Birth"
           type="date"
           {...methods.register('basic_info.date_of_birth')}
           defaultValue={cvData?.extracted_data?.basic_info?.date_of_birth || ''}
         />
         <FormSelect
           label="Gender"
           {...methods.register('basic_info.gender')}
           defaultValue={cvData?.extracted_data?.basic_info?.gender || ''}
           options={[
             { value: '', label: 'Select Gender' },
             { value: 'male', label: 'Male' },
             { value: 'female', label: 'Female' },
             { value: 'other', label: 'Other' },
             { value: 'prefer_not_to_say', label: 'Prefer not to say' }
           ]}
         />
         <FormInput
           label="NIC Number"
           {...methods.register('basic_info.nic')}
           defaultValue={cvData?.extracted_data?.basic_info?.nic || ''}
         />
         <FormInput
           label="Passport Number"
           {...methods.register('basic_info.passport')}
           defaultValue={cvData?.extracted_data?.basic_info?.passport || ''}
         />
         <FormSelect
           label="Remote Preference"
           {...methods.register('basic_info.remote_preference')}
           defaultValue={cvData?.extracted_data?.basic_info?.remote_preference || 'flexible'}
           options={[
             { value: 'remote_only', label: 'Remote Only' },
             { value: 'hybrid', label: 'Hybrid' },
             { value: 'onsite', label: 'On-site Only' },
             { value: 'flexible', label: 'Flexible' }
           ]}
         />
       </div>

       {/* Salary and Availability Information */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <FormInput
           label="Expected Minimum Salary (LKR)"
           type="number"
           {...methods.register('basic_info.expected_salary_min', { valueAsNumber: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.expected_salary_min || 0}
         />
         <FormInput
           label="Expected Maximum Salary (LKR)"
           type="number"
           {...methods.register('basic_info.expected_salary_max', { valueAsNumber: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.expected_salary_max || 0}
         />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormInput
           label="Notice Period (Days)"
           type="number"
           {...methods.register('basic_info.notice_period', { valueAsNumber: true })}
           defaultValue={cvData?.extracted_data?.basic_info?.notice_period || 30}
         />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormSelect
           label="Availability Status"
           {...methods.register('basic_info.availability_status')}
           defaultValue={cvData?.extracted_data?.basic_info?.availability_status || 'available'}
           options={[
             { value: 'available', label: 'Available' },
             { value: 'open_to_opportunities', label: 'Open to Opportunities' },
             { value: 'not_looking', label: 'Not Looking' }
           ]}
         />
         <FormInput
           label="Available From"
           type="date"
           {...methods.register('basic_info.availability_date')}
           defaultValue={cvData?.extracted_data?.basic_info?.availability_date || ''}
         />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormSelect
           label="Work Availability"
           {...methods.register('basic_info.work_availability')}
           defaultValue={cvData?.extracted_data?.basic_info?.work_availability || 'full_time'}
           options={[
             { value: 'full_time', label: 'Full Time' },
             { value: 'part_time', label: 'Part Time' },
             { value: 'contract', label: 'Contract' },
             { value: 'freelance', label: 'Freelance' },
             { value: 'internship', label: 'Internship' },
             { value: 'volunteer', label: 'Volunteer' }
           ]}
         />
       </div>
       
       <div className="space-y-4">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
           <textarea
             {...methods.register('basic_info.professional_summary')}
             rows={4}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
             placeholder="Brief professional summary"
             defaultValue={cvData?.extracted_data?.basic_info?.professional_summary || ''}
           />
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormInput
           label="GitHub URL"
           {...methods.register('basic_info.github_url')}
           defaultValue={cvData?.extracted_data?.basic_info?.github_url || ''}
         />
         <FormInput
           label="LinkedIn URL"
           {...methods.register('basic_info.linkedin_url')}
           defaultValue={cvData?.extracted_data?.basic_info?.linkedin_url || ''}
         />
         <FormInput
           label="Personal Website"
           {...methods.register('basic_info.personal_website')}
           defaultValue={cvData?.extracted_data?.basic_info?.personal_website || ''}
         />
       </div>
    </div>
  );

  const renderWorkExperienceSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => appendWorkExperience({
            title: '',
            company: '',
            employment_type: 'full_time',
            is_current: false,
            start_date: '',
            end_date: null,
            location: null,
            description: null
          })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Experience
        </Button>
      </div>

      {workExperienceFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No work experience added yet. Click &quot;Add Experience&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workExperienceFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeWorkExperience(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Job Title"
                      {...methods.register(`work_experiences.${index}.title`)}
                      defaultValue={field.title}
                    />
                    <FormInput
                      label="Company"
                      {...methods.register(`work_experiences.${index}.company`)}
                      defaultValue={field.company}
                    />
                    <FormSelect
                      label="Employment Type"
                      {...methods.register(`work_experiences.${index}.employment_type`)}
                      defaultValue={field.employment_type}
                      options={[
                        { value: 'full_time', label: 'Full Time' },
                        { value: 'part_time', label: 'Part Time' },
                        { value: 'contract', label: 'Contract' },
                        { value: 'internship', label: 'Internship' },
                        { value: 'freelance', label: 'Freelance' },
                        { value: 'volunteer', label: 'Volunteer' }
                      ]}
                    />
                    <FormInput
                      label="Location"
                      {...methods.register(`work_experiences.${index}.location`)}
                      defaultValue={field.location || ''}
                    />
                    <FormInput
                      label="Start Date"
                      type="date"
                      {...methods.register(`work_experiences.${index}.start_date`)}
                      defaultValue={field.start_date}
                    />
                    <FormInput
                      label="End Date"
                      type="date"
                      {...methods.register(`work_experiences.${index}.end_date`)}
                      defaultValue={field.end_date || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      {...methods.register(`work_experiences.${index}.description`)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your role and responsibilities"
                      defaultValue={field.description || ''}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-${index}`}
                      {...methods.register(`work_experiences.${index}.is_current`)}
                      defaultChecked={field.is_current}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor={`current-${index}`} className="text-sm text-gray-700">
                      This is my current position
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => appendEducation({
            degree_diploma: '',
            university_school: '',
            field_of_study: null,
            start_date: '',
            end_date: null,
            grade: null
          })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Education
        </Button>
      </div>

      {educationFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No education added yet. Click &quot;Add Education&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educationFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormInput
                    label="Degree/Diploma"
                    {...methods.register(`educations.${index}.degree_diploma`)}
                    defaultValue={field.degree_diploma}
                  />
                  <FormInput
                    label="Institution"
                    {...methods.register(`educations.${index}.university_school`)}
                    defaultValue={field.university_school}
                  />
                  <FormInput
                    label="Field of Study"
                    {...methods.register(`educations.${index}.field_of_study`)}
                    defaultValue={field.field_of_study || ''}
                  />
                  <FormInput
                    label="Start Date"
                    type="date"
                    {...methods.register(`educations.${index}.start_date`)}
                    defaultValue={field.start_date}
                  />
                  <FormInput
                    label="End Date"
                    type="date"
                    {...methods.register(`educations.${index}.end_date`)}
                    defaultValue={field.end_date || ''}
                  />
                  <FormInput
                    label="Grade"
                    {...methods.register(`educations.${index}.grade`)}
                    defaultValue={field.grade || ''}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {skillFields.length}/20 skills added
        </div>
        <Button
          type="button"
          onClick={() => appendSkill({
            name: '',
            category: null
          })}
          disabled={skillFields.length >= 20}
          className={`${skillFields.length >= 20 ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          Add Skill
        </Button>
      </div>

      {skillFields.length >= 20 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              Maximum of 20 skills reached. Remove some skills to add new ones.
            </p>
          </div>
        </div>
      )}

      {skillFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No skills added yet. Click &quot;Add Skill&quot; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">Skill #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-3">
                  <FormInput
                    label="Skill Name"
                    {...methods.register(`skills.${index}.name`)}
                    defaultValue={field.name}
                  />
                  <FormInput
                    label="Category"
                    {...methods.register(`skills.${index}.category`)}
                    defaultValue={field.category || ''}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjectsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => appendProject({
            name: '',
            description: '',
            start_date: null,
            end_date: null,
            is_current: false,
            role: null,
            responsibilities: [],
            technologies: [],
            tools: [],
            methodologies: [],
            is_confidential: false,
            can_share_details: true,
            url: null,
            repository_url: null,
            media_urls: [],
            skills_gained: []
          })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Project
        </Button>
      </div>

      {projectFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No projects added yet. Click &quot;Add Project&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projectFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Project Name"
                      {...methods.register(`projects.${index}.name`)}
                      defaultValue={field.name}
                    />
                    <FormInput
                      label="Role"
                      {...methods.register(`projects.${index}.role`)}
                      defaultValue={field.role || ''}
                    />
                    <FormInput
                      label="Start Date"
                      type="date"
                      {...methods.register(`projects.${index}.start_date`)}
                      defaultValue={field.start_date || ''}
                    />
                    <FormInput
                      label="End Date"
                      type="date"
                      {...methods.register(`projects.${index}.end_date`)}
                      defaultValue={field.end_date || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      {...methods.register(`projects.${index}.description`)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your project"
                      defaultValue={field.description}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-project-${index}`}
                      {...methods.register(`projects.${index}.is_current`)}
                      defaultChecked={field.is_current}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor={`current-project-${index}`} className="text-sm text-gray-700">
                      This is my current project
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCertificatesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => appendCertificate({
            name: '',
            issuing_authority: '',
            issue_date: null,
            expiry_date: null,
            credential_id: null,
            credential_url: null,
            description: null,
            skill_ids: [],
            media_url: null
          })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Certificate
        </Button>
      </div>

      {certificateFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No certificates added yet. Click &quot;Add Certificate&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificateFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Certificate #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCertificate(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Certificate Name"
                      {...methods.register(`certificates.${index}.name`)}
                      defaultValue={field.name}
                    />
                    <FormInput
                      label="Issuing Authority"
                      {...methods.register(`certificates.${index}.issuing_authority`)}
                      defaultValue={field.issuing_authority}
                    />
                    <FormInput
                      label="Issue Date"
                      type="date"
                      {...methods.register(`certificates.${index}.issue_date`)}
                      defaultValue={field.issue_date || ''}
                    />
                    <FormInput
                      label="Expiry Date"
                      type="date"
                      {...methods.register(`certificates.${index}.expiry_date`)}
                      defaultValue={field.expiry_date || ''}
                    />
                    <FormInput
                      label="Credential ID"
                      {...methods.register(`certificates.${index}.credential_id`)}
                      defaultValue={field.credential_id || ''}
                    />
                    <FormInput
                      label="Credential URL"
                      {...methods.register(`certificates.${index}.credential_url`)}
                      defaultValue={field.credential_url || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      {...methods.register(`certificates.${index}.description`)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your certificate"
                      defaultValue={field.description || ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderVolunteeringSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => appendVolunteering({
            role: '',
            institution: '',
            cause: null,
            start_date: '',
            end_date: null,
            is_current: false,
            description: null,
            media_url: null
          })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Volunteering
        </Button>
      </div>

      {volunteeringFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No volunteering experience added yet. Click &quot;Add Volunteering&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {volunteeringFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Volunteering #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVolunteering(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Role"
                      {...methods.register(`volunteering.${index}.role`)}
                      defaultValue={field.role}
                    />
                    <FormInput
                      label="Institution"
                      {...methods.register(`volunteering.${index}.institution`)}
                      defaultValue={field.institution}
                    />
                    <FormInput
                      label="Cause"
                      {...methods.register(`volunteering.${index}.cause`)}
                      defaultValue={field.cause || ''}
                    />
                    <FormInput
                      label="Start Date"
                      type="date"
                      {...methods.register(`volunteering.${index}.start_date`)}
                      defaultValue={field.start_date}
                    />
                    <FormInput
                      label="End Date"
                      type="date"
                      {...methods.register(`volunteering.${index}.end_date`)}
                      defaultValue={field.end_date || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      {...methods.register(`volunteering.${index}.description`)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your volunteering experience"
                      defaultValue={field.description || ''}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-volunteering-${index}`}
                      {...methods.register(`volunteering.${index}.is_current`)}
                      defaultChecked={field.is_current}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor={`current-volunteering-${index}`} className="text-sm text-gray-700">
                      This is my current volunteering position
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAwardsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => appendAward({
            title: '',
            offered_by: '',
            associated_with: null,
            date: '',
            description: null,
            media_url: null,
            skill_ids: []
          })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Award
        </Button>
      </div>

      {awardFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No awards added yet. Click &quot;Add Award&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {awardFields.map((field, index) => (
            <Card key={field.id} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Award #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAward(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Award Title"
                      {...methods.register(`awards.${index}.title`)}
                      defaultValue={field.title}
                    />
                    <FormInput
                      label="Offered By"
                      {...methods.register(`awards.${index}.offered_by`)}
                      defaultValue={field.offered_by}
                    />
                    <FormInput
                      label="Associated With"
                      {...methods.register(`awards.${index}.associated_with`)}
                      defaultValue={field.associated_with || ''}
                    />
                    <FormInput
                      label="Date"
                      type="date"
                      {...methods.register(`awards.${index}.date`)}
                      defaultValue={field.date}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      {...methods.register(`awards.${index}.description`)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your award"
                      defaultValue={field.description || ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreviewSection = () => {
    const formData = methods.getValues();
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              Please review all the information below before creating your profile. You can go back to any section to make changes.
            </p>
          </div>
        </div>

        {/* Basic Information Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Profile Image Preview */}
                         <div className="mb-6 flex items-center space-x-4">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                 {previewImageUrl ? (
                   <img 
                     src={previewImageUrl} 
                     alt="Profile Preview" 
                     className="w-full h-full object-cover"
                   />
                 ) : formData.basic_info.profile_image_url ? (
                   <img 
                     src={formData.basic_info.profile_image_url} 
                     alt="Profile" 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                 )}
               </div>
               <div>
                 <h4 className="font-medium text-gray-900">Profile Photo</h4>
                 <p className="text-sm text-gray-600">
                   {previewImageUrl ? 'New image selected' : formData.basic_info.profile_image_url ? 'Current profile image' : 'No profile image added'}
                 </p>
               </div>
             </div>
             
             {/* Resume Preview */}
             {cvData?.resumeFile && (
               <div className="mb-6 flex items-center space-x-4">
                 <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                   <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-900">Resume</h4>
                   <p className="text-sm text-gray-600">
                     Resume extracted from CV - will be saved with your profile
                   </p>
                 </div>
               </div>
             )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">
                  {formData.basic_info.first_name && formData.basic_info.last_name 
                    ? `${formData.basic_info.first_name} ${formData.basic_info.last_name}` 
                    : 'No data added'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Professional Title</label>
                <p className="text-gray-900">{formData.basic_info.title || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Current Position</label>
                <p className="text-gray-900">{formData.basic_info.current_position || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Industry</label>
                <p className="text-gray-900">{formData.basic_info.industry || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Country</label>
                <p className="text-gray-900">{formData.basic_info.country || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">City</label>
                <p className="text-gray-900">{formData.basic_info.city || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900">{formData.basic_info.location || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{formData.basic_info.phone1 || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Alternative Phone</label>
                <p className="text-gray-900">{formData.basic_info.phone2 || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">GitHub URL</label>
                <p className="text-gray-900">{formData.basic_info.github_url || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">LinkedIn URL</label>
                <p className="text-gray-900">{formData.basic_info.linkedin_url || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Personal Website</label>
                <p className="text-gray-900">{formData.basic_info.personal_website || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Experience Level</label>
                <p className="text-gray-900">{formData.basic_info.experience_level || 'No data added'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Years of Experience</label>
                <p className="text-gray-900">{formData.basic_info.years_of_experience || 'No data added'}</p>
              </div>
            </div>
            {/* <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">Bio</label>
              <p className="text-gray-900 mt-1">{formData.basic_info.bio || 'No data added'}</p>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">About</label>
              <p className="text-gray-900 mt-1">{formData.basic_info.about || 'No data added'}</p>
            </div> */}
          </CardContent>
        </Card>

        {/* Work Experience Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Work Experience ({formData.work_experiences.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.work_experiences.length > 0 ? (
              <div className="space-y-4">
                {formData.work_experiences.map((exp, index) => (
                  <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{exp.title || 'No title'}</h4>
                    <p className="text-gray-600">{exp.company || 'No company'}</p>
                    <p className="text-sm text-gray-500">
                      {exp.start_date || 'No start date'} - {exp.is_current ? 'Present' : exp.end_date || 'No end date'}
                    </p>
                    <p className="text-sm text-gray-500">Employment Type: {exp.employment_type || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">Location: {exp.location || 'No location'}</p>
                    <p className="text-gray-700 mt-2">{exp.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No work experience added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Education ({formData.educations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.educations.length > 0 ? (
              <div className="space-y-4">
                {formData.educations.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{edu.degree_diploma || 'No degree'}</h4>
                    <p className="text-gray-600">{edu.university_school || 'No institution'}</p>
                    <p className="text-sm text-gray-500">
                      {edu.start_date || 'No start date'} - {edu.end_date || 'No end date'}
                    </p>
                    <p className="text-sm text-gray-500">Field of Study: {edu.field_of_study || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">Grade: {edu.grade || 'Not specified'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No education added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Skills ({formData.skills.length}/20)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                  >
                    {skill.name || 'Unnamed skill'}
                    {skill.category && (
                      <span className="ml-2 text-xs text-emerald-600">({skill.category})</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No skills added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Projects ({formData.projects.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.projects.length > 0 ? (
              <div className="space-y-4">
                {formData.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{project.name || 'No project name'}</h4>
                    <p className="text-gray-600">Role: {project.role || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">
                      {project.start_date || 'No start date'} - {project.is_current ? 'Present' : project.end_date || 'No end date'}
                    </p>
                    <p className="text-gray-700 mt-2">{project.description || 'No description'}</p>
                    <p className="text-sm text-gray-500">URL: {project.url || 'No URL'}</p>
                    <p className="text-sm text-gray-500">Repository: {project.repository_url || 'No repository'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No projects added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificates Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Certificates ({formData.certificates.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.certificates.length > 0 ? (
              <div className="space-y-4">
                {formData.certificates.map((cert, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{cert.name || 'No certificate name'}</h4>
                    <p className="text-gray-600">{cert.issuing_authority || 'No issuing authority'}</p>
                    <p className="text-sm text-gray-500">
                      {cert.issue_date || 'No issue date'} - {cert.expiry_date || 'No expiry date'}
                    </p>
                    <p className="text-sm text-gray-500">Credential ID: {cert.credential_id || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">Credential URL: {cert.credential_url || 'No URL'}</p>
                    <p className="text-gray-700 mt-2">{cert.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No certificates added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volunteering Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Volunteering ({formData.volunteering.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.volunteering.length > 0 ? (
              <div className="space-y-4">
                {formData.volunteering.map((vol, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{vol.role || 'No role'}</h4>
                    <p className="text-gray-600">{vol.institution || 'No institution'}</p>
                    <p className="text-sm text-gray-500">Cause: {vol.cause || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">
                      {vol.start_date || 'No start date'} - {vol.is_current ? 'Present' : vol.end_date || 'No end date'}
                    </p>
                    <p className="text-gray-700 mt-2">{vol.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No volunteering experience added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Awards Preview */}
        <Card className="bg-gray-50 border-0">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Awards ({formData.awards.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formData.awards.length > 0 ? (
              <div className="space-y-4">
                {formData.awards.map((award, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{award.title || 'No award title'}</h4>
                    <p className="text-gray-600">{award.offered_by || 'No organization'}</p>
                    <p className="text-sm text-gray-500">Associated With: {award.associated_with || 'Not specified'}</p>
                    <p className="text-sm text-gray-500">Date: {award.date || 'No date'}</p>
                    <p className="text-gray-700 mt-2">{award.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No awards added</p>
              </div>
            )}
          </CardContent>
        </Card>

                 {/* Action Buttons */}
         <div className="flex justify-between pt-6">
           <Button
             variant="outline"
             onClick={() => {
               const currentIndex = sections.findIndex(s => s.id === activeSection);
               if (currentIndex > 0) {
                 handleSectionChange(sections[currentIndex - 1].id);
               }
             }}
             size="lg"
             className="px-8 py-3 text-lg"
           >
             Previous
           </Button>
           
                       <Button
              onClick={handleSubmitProfile}
              disabled={isSubmitting}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-lg"
            >
              {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
            </Button>
         </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic_info':
        return renderBasicInfoSection();
      case 'work_experiences':
        return renderWorkExperienceSection();
      case 'educations':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      case 'projects':
        return renderProjectsSection();
      case 'certificates':
        return renderCertificatesSection();
      case 'volunteering':
        return renderVolunteeringSection();
      case 'awards':
        return renderAwardsSection();
      case 'preview':
        return renderPreviewSection();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Section content will be implemented here</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
                 <div>
           <h1 className="text-3xl font-bold text-gray-900">Complete Profile</h1>
           <p className="text-gray-600 mt-2">
             {cvData ? 'Review and complete your profile using extracted CV data' : 'Complete or update your professional profile'}
           </p>
         </div>
      </div>

      {/* CV Data Status */}
      {cvData && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
                             <div>
                 <h3 className="font-medium text-emerald-900">CV Data Loaded Successfully!</h3>
                 <p className="text-sm text-emerald-700">
                   {cvData.extracted_data?.work_experiences?.length || 0} work experiences, {cvData.extracted_data?.educations?.length || 0} education entries, {cvData.extracted_data?.skills?.length || 0} skills extracted
                   {cvData.resumeFile && ' • Resume extracted'}
                 </p>
               </div>
            </div>
          </CardContent>
        </Card>
      )}

                    {/* Section Navigation */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    activeSection === section.id
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">{section.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Form Content */}
      <FormProvider {...methods}>
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{sections.find(s => s.id === activeSection)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderSectionContent()}
          </CardContent>
        </Card>
      </FormProvider>

      {/* Action Buttons */}
      {activeSection !== 'preview' && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = sections.findIndex(s => s.id === activeSection);
              if (currentIndex > 0) {
                handleSectionChange(sections[currentIndex - 1].id);
              }
            }}
            disabled={sections.findIndex(s => s.id === activeSection) === 0}
          >
            Previous
          </Button>

          <Button
            onClick={() => {
              const currentIndex = sections.findIndex(s => s.id === activeSection);
              if (currentIndex < sections.length - 1) {
                handleSectionChange(sections[currentIndex + 1].id);
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
