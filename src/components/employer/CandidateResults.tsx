'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
// Simple modal implementation since dialog component might not exist

interface FilteredCandidate {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  years_of_experience: number | null;
  total_years_experience: number | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string | null;
  experience_level: string | null;
  availability_status: string | null;
  country: string | null;
  city: string | null;
  location: string | null;
  profile_image_url: string | null;
  professional_summary: string | null;
  created_at: Date | null;
  date_of_birth: Date | null;
  educations: Array<{
    degree_diploma: string | null;
    field_of_study: string | null;
    university_school: string | null;
  }>;
  skills: Array<{
    name: string;
    proficiency: number | null;
  }>;
  work_experiences: Array<{
    title: string | null;
    company: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
  }>;
}

interface CandidateResultsProps {
  readonly candidates: FilteredCandidate[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly loading?: boolean;
  readonly onPageChange: (page: number) => void;
  readonly onViewProfile: (candidateId: string) => void;
}

export function CandidateResults({ 
  candidates, 
  total, 
  page, 
  totalPages, 
  loading = false, 
  onPageChange, 
  onViewProfile 
}: CandidateResultsProps) {
  const [interestedCandidates, setInterestedCandidates] = useState<Set<string>>(new Set());
  const [notInterestedCandidates, setNotInterestedCandidates] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<FilteredCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateAge = (dateOfBirth: Date | null): string => {
    if (!dateOfBirth) return 'Not specified';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null): string => {
    if (!min && !max) return 'Not specified';
    
    const curr = currency || 'LKR';
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${curr} ${max.toLocaleString()}`;
    } else if (min) {
      return `${curr} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${curr} ${max.toLocaleString()}`;
    }
    return 'Not specified';
  };

  const formatExperience = (years: number | null, totalYears: number | null): string => {
    const exp = totalYears || years;
    if (!exp) return 'Not specified';
    return `${exp} year${exp !== 1 ? 's' : ''}`;
  };

  const getProfessionalQualifications = (workExperiences: Array<{title: string | null; company: string | null; start_date: Date | null; end_date: Date | null; is_current: boolean | null}>, currentPosition?: string | null): string => {
    // Debug: Log the work experiences data
    console.log('Work Experiences for Professional Qualifications:', workExperiences);
    
    // Collect all titles from work experience
    const workExperienceTitles = workExperiences
      .map(exp => exp.title)
      .filter(Boolean);
    
    // Combine with current position if available
    const allTitles = [...workExperienceTitles];
    if (currentPosition && !allTitles.includes(currentPosition)) {
      allTitles.unshift(currentPosition); // Add current position at the beginning
    }
    
    // Remove duplicates while preserving order
    const uniqueTitles = allTitles.filter((value, index, self) => self.indexOf(value) === index);
    
    console.log('All titles (work experience + current position):', uniqueTitles);
    
    return uniqueTitles.length > 0 ? uniqueTitles.join(', ') : 'Not specified';
  };

  const getAcademicQualifications = (educations: Array<{degree_diploma: string | null; field_of_study: string | null; university_school: string | null}>): string => {
    if (educations.length === 0) return 'Not specified';
    
    // Get all unique qualifications
    const qualifications = educations
      .map(edu => edu.degree_diploma || edu.field_of_study)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return qualifications.length > 0 ? qualifications.join(', ') : 'Not specified';
  };

  const getSpecializedField = (industry: string | null, skills: Array<{name: string; proficiency: number | null}>): string => {
    if (industry) return industry;
    if (skills.length > 0) {
      // Get top 3 skills by proficiency or just top 3
      const sortedSkills = skills.toSorted((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
      const topSkills = sortedSkills
        .slice(0, 3)
        .map(skill => skill.name);
      return topSkills.join(', ');
    }
    return 'Not specified';
  };

  const getWorkExperience = (workExperiences: Array<{title: string | null; company: string | null; start_date: Date | null; end_date: Date | null; is_current: boolean | null}>, industry?: string | null): string => {
    // Debug: Log the work experiences data
    console.log('Work Experiences for Work Experience column:', workExperiences);
    
    if (workExperiences.length === 0) {
      // If no work experience, try to use industry
      console.log('No work experiences found, using industry:', industry);
      return industry || 'Not specified';
    }
    
    // Get all title and company combinations from work experience
    const experiences = workExperiences
      .map(exp => {
        const title = exp.title || 'Unknown Position';
        const company = exp.company || 'Unknown Company';
        return `${title} at ${company}`;
      })
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    console.log('Work experience combinations:', experiences);
    
    return experiences.length > 0 ? experiences.join('; ') : (industry || 'Not specified');
  };

  const handleInterestToggle = async (candidateId: string, isInterested: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/employer/candidates/update-interview-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          interview_ready: isInterested
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Interview status updated:', result.message);
        
        // Update local state based on the action
        if (isInterested) {
          // Select: Add to interested, remove from not interested
          setInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.add(candidateId);
            return newSet;
          });
          setNotInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
        } else {
          // Unselect: Remove from interested, don't add to not interested
          setInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
          setNotInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to update interview status:', errorData.message || response.statusText);
        // Still update local state even if API fails
        if (isInterested) {
          setInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.add(candidateId);
            return newSet;
          });
          setNotInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
        } else {
          setInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
          setNotInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
    }
  };

  const handleCardClick = (candidate: FilteredCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const getProfessionalTitle = (workExperiences: Array<{title: string | null; company: string | null; start_date: Date | null; end_date: Date | null; is_current: boolean | null}>, currentPosition?: string | null): string => {
    // Get current position or most recent work experience title
    if (currentPosition) return currentPosition;
    
    const currentExp = workExperiences.find(exp => exp.is_current);
    if (currentExp?.title) return currentExp.title;
    
    if (workExperiences.length > 0) {
      return workExperiences[0].title || 'Not specified';
    }
    
    return 'Not specified';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500">Try adjusting your search criteria to find more candidates.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Search Results
          <span className="text-sm font-normal text-gray-500">
            {total} candidate{total !== 1 ? 's' : ''} found
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <Card 
              key={`candidate-${candidate.user_id}-${index}`} 
              className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-emerald-300 ${
                interestedCandidates.has(candidate.user_id) 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleCardClick(candidate)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-emerald-600">
                      Candidate {index + 1}
                    </CardTitle>
                    <p className="text-xs text-gray-500">ID: {candidate.user_id}</p>
                  </div>
                  {interestedCandidates.has(candidate.user_id) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Selected
                    </span>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="text-sm text-gray-700">
              Showing page {page} of {totalPages} ({total} total candidates)
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Candidate Detail Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Candidate Details</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
            
            {selectedCandidate && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Age:</span>
                        <span className="text-gray-900">{calculateAge(selectedCandidate.date_of_birth)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Location:</span>
                        <span className="text-gray-900">{selectedCandidate.city || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Country:</span>
                        <span className="text-gray-900">{selectedCandidate.country || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Industry:</span>
                        <span className="text-gray-900">{selectedCandidate.industry || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Current Position:</span>
                        <span className="text-gray-900">{selectedCandidate.current_position || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Experience Level:</span>
                        <span className="text-gray-900">{selectedCandidate.experience_level || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Years of Experience:</span>
                        <span className="text-gray-900">{formatExperience(selectedCandidate.years_of_experience, selectedCandidate.total_years_experience)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Expected Salary:</span>
                        <span className="text-gray-900">{formatSalary(selectedCandidate.expected_salary_min, selectedCandidate.expected_salary_max, selectedCandidate.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Qualifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Qualifications</h3>
                  <p className="text-gray-700">{getProfessionalQualifications(selectedCandidate.work_experiences, selectedCandidate.current_position)}</p>
                </div>

                                 {/* Education */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Education</h3>
                   {selectedCandidate.educations.length > 0 ? (
                     <div className="space-y-4">
                       {selectedCandidate.educations.map((education, index) => (
                         <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                           <div className="space-y-2">
                             <h4 className="font-semibold text-gray-900">
                               {education.degree_diploma || 'Degree not specified'}
                             </h4>
                             {education.field_of_study && (
                               <p className="text-blue-600 font-medium">
                                 {education.field_of_study}
                               </p>
                             )}
                             {education.university_school && (
                               <p className="text-sm text-gray-600">
                                 {education.university_school}
                               </p>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-gray-700">No education information available</p>
                   )}
                 </div>

                                 {/* Work Experience */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Work Experience</h3>
                   {selectedCandidate.work_experiences.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCandidate.work_experiences.map((experience, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {experience.title || 'Position not specified'}
                              </h4>
                              <p className="text-emerald-600 font-medium">
                                {experience.company || 'Company not specified'}
                              </p>
                            </div>
                            {experience.is_current && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {experience.start_date && (
                              <span>
                                {new Date(experience.start_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </span>
                            )}
                            {experience.start_date && experience.end_date && (
                              <span> - </span>
                            )}
                            {experience.end_date && !experience.is_current && (
                              <span>
                                {new Date(experience.end_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </span>
                            )}
                            {experience.is_current && (
                              <span> - Present</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                                     ) : (
                     <div className="space-y-3">
                       <p className="text-gray-700 font-medium">No work experience records found</p>
                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                         <div className="flex">
                           <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                             </svg>
                           </div>
                           <div className="ml-3">
                             <div className=" text-sm text-yellow-700">
                               <p className="">This candidate may not have added work experience details yet.</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                </div>

                {/* Skills */}
                {selectedCandidate.skills.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Summary */}
                {selectedCandidate.professional_summary && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Summary</h3>
                    <p className="text-gray-700">{selectedCandidate.professional_summary}</p>
                  </div>
                )}

                                 {/* Action Buttons */}
                 <div className="flex justify-between items-center pt-4 border-t">
                   
                   {interestedCandidates.has(selectedCandidate.user_id) ? (
                     <div className="flex items-center space-x-3">
                       <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                         ✓ Selected
                       </span>
                       <Button
                         variant="outline"
                         onClick={async () => {
                           await handleInterestToggle(selectedCandidate.user_id, false);
                           setIsModalOpen(false);
                         }}
                         className="border-orange-300 text-orange-700 hover:bg-orange-50"
                       >
                         Unselect
                       </Button>
                     </div>
                   ) : (
                     <div className="flex space-x-3">
                       <Button
                         variant="destructive"
                         onClick={() => {
                           handleInterestToggle(selectedCandidate.user_id, false);
                           setIsModalOpen(false);
                         }}
                         className="bg-red-600 hover:bg-red-700"
                       >
                         Reject
                       </Button>
                       <Button
                         onClick={async () => {
                           await handleInterestToggle(selectedCandidate.user_id, true);
                           setIsModalOpen(false);
                         }}
                         className="bg-green-600 hover:bg-green-700"
                       >
                         Select
                       </Button>
                     </div>
                   )}
                 </div>
              </div>
            )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
