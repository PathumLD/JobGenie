'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SavedCandidate {
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

interface SavedCandidateResultsProps {
  readonly candidates: SavedCandidate[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly loading?: boolean;
  readonly onPageChange: (page: number) => void;
  readonly onViewProfile: (candidateId: string) => void;
}

export function SavedCandidateResults({ 
  candidates, 
  total, 
  page, 
  totalPages, 
  loading = false, 
  onPageChange, 
  onViewProfile 
}: SavedCandidateResultsProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<SavedCandidate | null>(null);
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
    const workExperienceTitles = workExperiences
      .map(exp => exp.title)
      .filter(Boolean);
    
    const allTitles = [...workExperienceTitles];
    if (currentPosition && !allTitles.includes(currentPosition)) {
      allTitles.unshift(currentPosition);
    }
    
    const uniqueTitles = allTitles.filter((value, index, self) => self.indexOf(value) === index);
    
    return uniqueTitles.length > 0 ? uniqueTitles.join(', ') : 'Not specified';
  };

  const getAcademicQualifications = (educations: Array<{degree_diploma: string | null; field_of_study: string | null; university_school: string | null}>): string => {
    if (educations.length === 0) return 'Not specified';
    
    const qualifications = educations
      .map(edu => edu.degree_diploma || edu.field_of_study)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return qualifications.length > 0 ? qualifications.join(', ') : 'Not specified';
  };

  const handleCardClick = (candidate: SavedCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Candidates</CardTitle>
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
          <CardTitle>Saved Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved candidates yet</h3>
            <p className="text-gray-500">Start by finding and selecting candidates for interviews.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Saved Candidates
          <span className="text-sm font-normal text-gray-500">
            {total} candidate{total !== 1 ? 's' : ''} saved
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <Card 
              key={`candidate-${candidate.user_id}-${index}`} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-green-300 bg-green-50 hover:border-green-400"
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Selected
                  </span>
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
                                  <p className="text-blue-600 font-medium">
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
