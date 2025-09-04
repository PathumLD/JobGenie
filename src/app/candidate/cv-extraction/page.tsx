'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { authenticatedFetch, debugAuthStatus, refreshTokenFromStorage } from '@/lib/auth-storage';
import { CandidateAuthGuard } from '@/components/auth/CandidateAuthGuard';

import { toast } from 'sonner';

interface ExtractedBasicInfo {
  first_name: string;
  last_name: string;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  bio: string | null;
  about: string | null;
  country: string | null;
  city: string | null;
  location: string | null;
  address: string | null;
  phone1: string | null;
  phone2: string | null;
  personal_website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_of_experience: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  date_of_birth: string | null;
  nic: string | null;
  passport: string | null;
  remote_preference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible' | null;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string | null;
  availability_status: 'available' | 'open_to_opportunities' | 'not_looking' | null;
  availability_date: string | null;
  professional_summary: string | null;
  total_years_experience: number | null;
  open_to_relocation: boolean | null;
  willing_to_travel: boolean | null;
  security_clearance: boolean | null;
  disability_status: string | null;
  veteran_status: string | null;
  pronouns: string | null;
  salary_visibility: 'confidential' | 'visible' | null;
  notice_period: number | null;
  work_authorization: string | null;
  visa_assistance_needed: boolean | null;
  work_availability: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer' | null;
  interview_ready: boolean | null;
  pre_qualified: boolean | null;
}

interface ExtractedWorkExperience {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  skill_ids: string[];
  media_url: string | null;
}

interface ExtractedEducation {
  degree_diploma: string;
  university_school: string;
  field_of_study: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  grade: string | null;
  activities_societies: string | null;
  skill_ids: string[];
  media_url: string | null;
}

interface ExtractedSkill {
  name: string;
  category: string | null;
  description: string | null;
  proficiency: number | null;
}

interface ExtractedProject {
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

interface ExtractedCertificate {
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

interface ExtractedAward {
  title: string;
  offered_by: string;
  associated_with: string | null;
  date: string;
  description: string | null;
  media_url: string | null;
  skill_ids: string[];
}

interface ExtractedVolunteering {
  role: string;
  institution: string;
  cause: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  media_url: string | null;
}

interface ExtractedLanguage {
  language: string;
  is_native: boolean;
  oral_proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic' | null;
  written_proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic' | null;
}

interface ExtractedAccomplishment {
  title: string;
  description: string;
  work_experience_id: string | null;
  resume_id: string | null;
}

interface ExtractedData {
  basic_info: ExtractedBasicInfo;
  work_experiences: ExtractedWorkExperience[];
  educations: ExtractedEducation[];
  skills: ExtractedSkill[];
  projects: ExtractedProject[];
  certificates: ExtractedCertificate[];
  awards: ExtractedAward[];
  volunteering: ExtractedVolunteering[];
  languages: ExtractedLanguage[];
  accomplishments: ExtractedAccomplishment[];
}

interface ExtractionResponse {
  success: boolean;
  message: string;
  data: {
    extracted_data: ExtractedData;
    file_info: {
      name: string;
      size: number;
      type: string;
    };
    resumeFile: string; // Base64 encoded resume file
    resume_record?: Record<string, unknown>; // Resume record if created
    upload_result?: Record<string, unknown>; // Upload result if successful
    extraction_summary: {
      work_experiences_count: number;
      educations_count: number;
      skills_count: number;
      projects_count: number;
      certificates_count: number;
      volunteering_count: number;
      awards_count: number;
      languages_count: number;
      accomplishments_count: number;
    };
  };
}

interface ExtractionSummary {
  work_experiences_count?: number;
  educations_count?: number;
  skills_count?: number;
  projects_count?: number;
  certificates_count?: number;
  volunteering_count?: number;
  awards_count?: number;
}

interface ProfileSection {
  id: string;
  title: string;
  data: {
    type: string;
    completedProfile?: boolean;
    [key: string]: unknown;
  };
  order: number;
}

export default function CVExtractionPage() {
  return (
    <CandidateAuthGuard>
      <CVExtractionContent />
    </CandidateAuthGuard>
  );
}

function CVExtractionContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractionSummary, setExtractionSummary] = useState<ExtractionSummary | null>(null);
  const [membershipNumber, setMembershipNumber] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authenticatedFetch('/api/candidate/profile/current', {
          method: 'GET',
        });

        if (response.ok) {
          const profileData = await response.json();
          if (profileData.success) {
            // Get membership number from the profile data
            const basicInfoSection = profileData.data?.sections?.find(
              (section: ProfileSection) => section.data.type === 'basic_info'
            );
            
            if (basicInfoSection?.data) {
              const firstName = basicInfoSection.data.first_name || '';
              const lastName = basicInfoSection.data.last_name || '';
              setUserName(`${firstName} ${lastName}`.trim());
              
              // Get membership number from candidate data
              const candidateResponse = await authenticatedFetch('/api/candidate/profile/update-profile', {
                method: 'GET',
              });
              
              if (candidateResponse.ok) {
                const candidateData = await candidateResponse.json();
                if (candidateData.success && candidateData.data?.membership_no) {
                  setMembershipNumber(candidateData.data.membership_no);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

    const handleExtractCV = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      // Debug authentication status before making API calls
      console.log('🔍 === CV EXTRACTION DEBUG ===');
      debugAuthStatus();
      
      // Try to refresh token if needed
      if (!refreshTokenFromStorage()) {
        console.log('❌ Failed to refresh token, redirecting to login...');
        window.location.href = '/candidate/login';
        return;
      }
      
      console.log('✅ Token refreshed, proceeding with API calls...');
      
      // First check if user has an existing profile and check completedProfile status
      const profileCheckResponse = await authenticatedFetch('/api/candidate/profile/current', {
        method: 'GET',
      });

      if (!profileCheckResponse.ok) {
        if (profileCheckResponse.status === 401) {
          console.log('❌ Authentication failed during profile check');
          debugAuthStatus();
          throw new Error('Authentication failed. Please login again.');
        }
        
        const errorData = await profileCheckResponse.json();
        throw new Error(errorData.error || 'Failed to check profile status');
      }

      // Get profile data to check completedProfile status
      const profileData = await profileCheckResponse.json();
      const basicInfoSection = profileData.data?.sections?.find(
        (section: ProfileSection) => section.data.type === 'basic_info'
      );
      const completedProfile = basicInfoSection?.data?.completedProfile;

      if (completedProfile === true) {
        // User has completed profile, use merge API to add new CV data
        console.log('✅ User has completed profile, merging CV data...');
        
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await authenticatedFetch('/api/candidate/profile/extract-and-merge-cv', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process CV');
        }

        const result = await response.json();
        
        if (result.success) {
          toast.success('CV processed successfully! Your profile has been updated with new information.');
          
          // Dispatch custom event to notify header to refresh resume status
          window.dispatchEvent(new CustomEvent('resume-uploaded'));
          
          // Redirect to view profile since they already have a completed profile
          setTimeout(() => {
            window.location.href = '/candidate/view-profile';
          }, 1000);
        } else {
          throw new Error(result.message || 'Processing failed');
        }
      } else {
        // User doesn't have completed profile (first time), use extraction API for new profile creation
        console.log('✅ User is uploading CV for first time, extracting data for profile creation...');
        
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await authenticatedFetch('/api/candidate/profile/extract-cv', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('❌ Authentication failed during CV extraction');
            debugAuthStatus();
            throw new Error('Authentication failed. Please login again.');
          }
          
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to extract CV data');
        }

        const result: ExtractionResponse = await response.json();
        
        if (result.success) {
          setExtractedData(result.data.extracted_data);
          setExtractionSummary(result.data.extraction_summary);
          
          // Save extracted data and resume file to localStorage for use in create-profile page
          const dataToStore = {
            extracted_data: result.data.extracted_data,
            resumeFile: result.data.resumeFile // Include the resume file data
          };
          localStorage.setItem('cv_extraction_data', JSON.stringify(dataToStore));
          
          // Check if resume was uploaded successfully
          if (result.data.resume_record && result.data.upload_result) {
            toast.success('CV data extracted and resume uploaded successfully! You can now create your profile.');
            
            // Dispatch custom event to notify header to refresh resume status
            window.dispatchEvent(new CustomEvent('resume-uploaded'));
          } else {
            toast.success('CV data extracted successfully! You can now create your profile.');
          }
          
          // Since this is first time, redirect to create-profile page
          setTimeout(() => {
            window.location.href = '/candidate/create-profile';
          }, 1000);
        } else {
          throw new Error(result.message || 'Extraction failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveProfile = async () => {
    // Profile saving is handled by the create-profile page
    // This function redirects to the create-profile page with extracted data
    window.location.href = '/candidate/create-profile';
  };

  const handleCreateProfile = async () => {
    try {
      // Check completedProfile status and redirect accordingly
      const profileResponse = await authenticatedFetch('/api/candidate/profile/current', {
        method: 'GET',
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        // Find the basic_info section which contains the completedProfile field
        const basicInfoSection = profileData.data?.sections?.find(
          (section: ProfileSection) => section.data.type === 'basic_info'
        );
        const completedProfile = basicInfoSection?.data?.completedProfile;
        
        // Redirect based on completedProfile status
        if (completedProfile === true) {
          // Profile is completed, redirect to view-profile
          window.location.href = '/candidate/view-profile';
        } else {
          // Profile is not completed, redirect to create-profile
          window.location.href = '/candidate/create-profile';
        }
      } else {
        // If profile check fails, default to create-profile
        window.location.href = '/candidate/create-profile';
      }
    } catch (profileError) {
      console.error('Error checking profile completion status:', profileError);
      // If profile check fails, default to create-profile
      window.location.href = '/candidate/create-profile';
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setExtractionSummary(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      {membershipNumber && (
        <div className="bg-emerald-700 rounded-lg p-6 text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to JobGenie!</h1>
            <p className="text-xl mb-4">
              {userName ? `Hello, ${userName}!` : 'Hello!'}
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-sm text-emerald-100 mb-1">Your Membership Number</p>
              <p className="text-2xl font-mono font-bold text-white">
                {membershipNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mt-2">
            Upload your CV to automatically extract and populate your profile information, or skip to browse jobs
          </p>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-emerald-800">CV Extraction is Optional</h3>
            <p className="text-sm text-emerald-700 mt-1">
              You can skip CV extraction and still access all features. Upload your CV later to enhance your profile and get better job matches.
            </p>
            </div>
            <Button
            variant="outline"
            onClick={() => window.location.href = '/candidate/jobs'}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium"
          >
            Skip to Jobs
          </Button>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Upload CV</CardTitle>
          
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!selectedFile ? (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-600 hover:text-emerald-500 font-medium"
                    >
                      Click to upload
                    </button>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF files only, max 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleExtractCV}
                    disabled={isExtracting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isExtracting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extracting...
                      </>
                    ) : (
                      'Extract CV Data'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isExtracting}
                  >
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Results */}
      {extractedData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {extractionSummary?.work_experiences_count || 0}
                </div>
                <div className="text-sm text-gray-600">Work Experience</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {extractionSummary?.educations_count || 0}
                </div>
                <div className="text-sm text-gray-600">Education</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {extractionSummary?.skills_count || 0}
                </div>
                <div className="text-sm text-gray-600">Skills</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {extractionSummary?.projects_count || 0}
                </div>
                <div className="text-sm text-gray-600">Projects</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {extractionSummary?.certificates_count || 0}
                </div>
                <div className="text-sm text-gray-600">Certificates</div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  value={extractedData.basic_info.first_name || ''}
                  readOnly
                />
                <FormInput
                  label="Last Name"
                  value={extractedData.basic_info.last_name || ''}
                  readOnly
                />
                <FormInput
                  label="Professional Title"
                  value={extractedData.basic_info.title || ''}
                  readOnly
                />
                <FormInput
                  label="Current Position"
                  value={extractedData.basic_info.current_position || ''}
                  readOnly
                />
                <FormInput
                  label="Industry"
                  value={extractedData.basic_info.industry || ''}
                  readOnly
                />
                <FormInput
                  label="Location"
                  value={extractedData.basic_info.location || ''}
                  readOnly
                />
                <FormInput
                  label="Phone"
                  value={extractedData.basic_info.phone1 || ''}
                  readOnly
                />
                <FormInput
                  label="Years of Experience"
                  value={extractedData.basic_info.years_of_experience?.toString() || ''}
                  readOnly
                />
              </div>
              
              {extractedData.basic_info.bio && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <p className="text-gray-600 text-sm">{extractedData.basic_info.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          {extractedData.work_experiences.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedData.work_experiences.map((exp, index) => (
                    <div key={index} className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {exp.employment_type} • {exp.location || 'Location not specified'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {extractedData.educations.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedData.educations.map((edu, index) => (
                    <div key={index} className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{edu.degree_diploma}</h4>
                      <p className="text-gray-600">{edu.university_school}</p>
                      <p className="text-sm text-gray-500">
                        {edu.field_of_study && `${edu.field_of_study} • `}
                        {edu.start_date} - {edu.end_date || 'Not specified'}
                      </p>
                      {edu.grade && (
                        <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                      )}
                      {edu.description && (
                        <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {extractedData.skills.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full"
                    >
                      {skill.name}
                      {skill.proficiency && ` (${skill.proficiency}%)`}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {extractedData.projects && extractedData.projects.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedData.projects.map((proj, index) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{proj.name}</h4>
                      <p className="text-gray-600">{proj.role || 'Role not specified'}</p>
                      <p className="text-sm text-gray-500">
                        {proj.start_date && `${proj.start_date} - ${proj.is_current ? 'Present' : proj.end_date || 'Not specified'}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Technologies: {proj.technologies.join(', ') || 'Not specified'}
                      </p>
                      {proj.description && (
                        <p className="text-gray-700 mt-2 text-sm">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificates */}
          {extractedData.certificates && extractedData.certificates.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedData.certificates.map((cert, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      <p className="text-gray-600">Issued by: {cert.issuing_authority}</p>
                      <p className="text-sm text-gray-500">
                        {cert.issue_date && `Issue Date: ${cert.issue_date}`}
                        {cert.expiry_date && ` • Expiry: ${cert.expiry_date}`}
                      </p>
                      {cert.description && (
                        <p className="text-gray-700 mt-2 text-sm">{cert.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Volunteering */}
          {extractedData.volunteering && extractedData.volunteering.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Volunteering</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedData.volunteering.map((vol, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{vol.role}</h4>
                      <p className="text-gray-600">{vol.institution}</p>
                      <p className="text-sm text-gray-500">
                        {vol.start_date} - {vol.is_current ? 'Present' : vol.end_date || 'Not specified'}
                      </p>
                      {vol.cause && (
                        <p className="text-sm text-gray-500">Cause: {vol.cause}</p>
                      )}
                      {vol.description && (
                        <p className="text-gray-700 mt-2 text-sm">{vol.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Awards */}
          {extractedData.awards && extractedData.awards.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedData.awards.map((award, index) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{award.title}</h4>
                      <p className="text-gray-600">Offered by: {award.offered_by}</p>
                      <p className="text-sm text-gray-500">
                        Date: {award.date}
                        {award.associated_with && ` • Associated: ${award.associated_with}`}
                      </p>
                      {award.description && (
                        <p className="text-gray-700 mt-2 text-sm">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={resetForm}>
              Extract Another CV
            </Button>
            <Button 
              onClick={handleSaveProfile}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save to Profile
            </Button>
            <Button 
              onClick={handleCreateProfile}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Create Profile
            </Button>
          </div>
          
          {/* Note about uploading later */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> You can always upload your CV later from your profile or dashboard to enhance your job matching.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
