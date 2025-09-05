'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { NotificationModal } from './NotificationModal';
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
  professional_qualification: string | null;
  created_at: Date | null;
  date_of_birth: Date | null;
  educations: Array<{
    degree_diploma: string | null;
    field_of_study: string | null;
    university_school: string | null;
  }>;
  skills: Array<{
    name: string;
  }>;
  work_experiences: Array<{
    title: string | null;
    company: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
  }>;
}

interface FilterCriteria {
  field: string;
  designation: string;
  salary_min: string;
  salary_max: string;
  years_of_experience: string;
  qualification: string;
}

interface FilterOptions {
  fields: Array<{
    unit: number;
    description: string;
    major: number;
    major_label: string;
    sub_major: number;
    sub_major_label: string;
  }>;
  designations: Array<{
    id: number;
    name: string;
    isco_08_unit: number;
    isco_08_major: number;
    isco_08_major_label: string;
  }>;
  qualifications: Array<{
    value: string;
    label: string;
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
  readonly currentFilterCriteria?: FilterCriteria | null;
  readonly filterOptions?: FilterOptions | null;
}

export function CandidateResults({ 
  candidates, 
  total, 
  page, 
  totalPages, 
  loading = false, 
  onPageChange, 
  onViewProfile,
  currentFilterCriteria,
  filterOptions
}: CandidateResultsProps) {
  const [interestedCandidates, setInterestedCandidates] = useState<Set<string>>(new Set());
  const [notifiedCandidates, setNotifiedCandidates] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<FilteredCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedCandidateForNotification, setSelectedCandidateForNotification] = useState<FilteredCandidate | null>(null);

  // Load notified candidates from localStorage on component mount
  useEffect(() => {
    const savedNotifiedCandidates = localStorage.getItem('notifiedCandidates');
    if (savedNotifiedCandidates) {
      try {
        const parsed = JSON.parse(savedNotifiedCandidates);
        setNotifiedCandidates(new Set(parsed));
      } catch (error) {
        console.error('Error parsing notified candidates from localStorage:', error);
      }
    }
  }, []);

  // Save notified candidates to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('notifiedCandidates', JSON.stringify([...notifiedCandidates]));
  }, [notifiedCandidates]);

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


  const getAcademicQualifications = (educations: Array<{degree_diploma: string | null; field_of_study: string | null; university_school: string | null}>): string => {
    if (educations.length === 0) return 'Not specified';
    
    // Get all unique qualifications
    const qualifications = educations
      .map(edu => edu.degree_diploma || edu.field_of_study)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return qualifications.length > 0 ? qualifications.join(', ') : 'Not specified';
  };

  const formatProfessionalQualification = (qualification: string | null): string => {
    if (!qualification) return 'Not specified';
    
    const qualificationMap: Record<string, string> = {
      'high_school': 'High School',
      'associate_degree': 'Associate Degree',
      'bachelors_degree': 'Bachelor\'s Degree',
      'masters_degree': 'Master\'s Degree',
      'doctorate_phd': 'Doctorate (PhD)',
      'undergraduate': 'Undergraduate',
      'post_graduate': 'Post Graduate',
      'diploma': 'Diploma',
      'certificate': 'Certificate',
      'professional_certification': 'Professional Certification',
      'vocational_training': 'Vocational Training',
      'some_college': 'Some College',
      'no_formal_education': 'No Formal Education'
    };
    
    return qualificationMap[qualification] || qualification;
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
          // Select: Add to interested
          setInterestedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.add(candidateId);
            return newSet;
          });
        } else {
          // Unselect: Remove from interested
          setInterestedCandidates(prev => {
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
        } else {
          setInterestedCandidates(prev => {
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

  const handleViewCandidate = (candidate: FilteredCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleNotifyCandidate = (candidate: FilteredCandidate) => {
    console.log('handleNotifyCandidate called with filter options:', filterOptions);
    console.log('Current filter criteria:', currentFilterCriteria);
    setSelectedCandidateForNotification(candidate);
    setNotificationModalOpen(true);
  };

  // Get designation name from filter criteria
  const getDesignationName = (): string => {
    console.log('getDesignationName called with:', {
      currentFilterCriteria,
      filterOptions,
      designation: currentFilterCriteria?.designation
    });
    
    if (!currentFilterCriteria?.designation || !filterOptions?.designations) {
      console.log('Missing data - returning default');
      return 'Position';
    }
    
    const designationId = parseInt(currentFilterCriteria.designation);
    const designation = filterOptions.designations.find(d => d.id === designationId);
    
    console.log('Found designation:', designation);
    
    return designation?.name || 'Position';
  };

  const handleNotificationSuccess = (message: string) => {
    console.log('Notification sent successfully:', message);
    
    // Add candidate to notified list
    if (selectedCandidateForNotification) {
      setNotifiedCandidates(prev => new Set([...prev, selectedCandidateForNotification.user_id]));
    }
    
    // Close the modal
    setNotificationModalOpen(false);
    setSelectedCandidateForNotification(null);
    
    // You can add a toast notification here if you have one
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
    <>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Education
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professional Qualification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((candidate, index) => (
                <tr 
              key={`candidate-${candidate.user_id}-${index}`} 
                  className={`hover:bg-gray-50 ${
                interestedCandidates.has(candidate.user_id) 
                      ? 'bg-green-50' 
                      : ''
              }`}
            >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                  <div>
                        <div className="text-sm font-medium text-emerald-600">
                      Candidate {index + 1}
                  </div>
                  {interestedCandidates.has(candidate.user_id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Selected
                    </span>
                  )}
                </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateAge(candidate.date_of_birth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{candidate.city || 'Not specified'}</div>
                      <div className="text-gray-500">{candidate.country || ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProfessionalTitle(candidate.work_experiences, candidate.current_position)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatExperience(candidate.years_of_experience, candidate.total_years_experience)}</div>
                      <div className="text-gray-500">{candidate.experience_level || ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatSalary(candidate.expected_salary_min, candidate.expected_salary_max, candidate.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getAcademicQualifications(candidate.educations)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill.name}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatProfessionalQualification(candidate.professional_qualification)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {interestedCandidates.has(candidate.user_id) ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInterestToggle(candidate.user_id, false)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Unselect
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onViewProfile(candidate.user_id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          View Profile
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCandidate(candidate)}
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          View
                        </Button>
                        {notifiedCandidates.has(candidate.user_id) ? (
                          <Button
                            size="sm"
                            disabled
                            className="bg-gray-400 text-white cursor-not-allowed"
                          >
                            Notified
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleNotifyCandidate(candidate)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Notify
                          </Button>
                        )}
                        
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      </CardContent>
    </Card>

    {/* Candidate Details Modal */}
    {isModalOpen && selectedCandidate && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Candidate Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Professional Title</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.title || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Position</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.current_position || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.industry || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedCandidate.experience_level || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience in current position</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.years_of_experience || 0} years</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Years Experience in all positions</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.total_years_experience || 0} years</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Professional Qualification</label>
                  <p className="text-sm text-gray-900">{formatProfessionalQualification(selectedCandidate.professional_qualification)}</p>
                </div>
              </div>

              {/* Location & Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location & Availability</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.location || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.country || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="text-sm text-gray-900">{selectedCandidate.city || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability Status</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedCandidate.availability_status || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Salary Range</label>
                  <p className="text-sm text-gray-900">
                    {selectedCandidate.expected_salary_min && selectedCandidate.expected_salary_max 
                      ? `${selectedCandidate.expected_salary_min.toLocaleString()} - ${selectedCandidate.expected_salary_max.toLocaleString()} ${selectedCandidate.currency || 'LKR'}`
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            {selectedCandidate.professional_summary && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Professional Summary</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedCandidate.professional_summary}</p>
              </div>
            )}

            {/* Skills */}
            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {selectedCandidate.work_experiences && selectedCandidate.work_experiences.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Work Experience</h3>
                <div className="space-y-4">
                  {selectedCandidate.work_experiences.slice(0, 3).map((exp, index) => (
                    <div key={index} className="border-l-4 border-emerald-200 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{exp.title || 'Position not specified'}</h4>
                          <p className="text-sm text-gray-600">{exp.company || 'Company not specified'}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {exp.start_date && (
                            <span>{new Date(exp.start_date).toLocaleDateString()}</span>
                          )}
                          {exp.end_date ? (
                            <span> - {new Date(exp.end_date).toLocaleDateString()}</span>
                          ) : exp.is_current ? (
                            <span> - Present</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate.educations && selectedCandidate.educations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Education</h3>
                <div className="space-y-4">
                  {selectedCandidate.educations.slice(0, 3).map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-200 pl-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{edu.degree_diploma || 'Degree not specified'}</h4>
                        <p className="text-sm text-gray-600">{edu.field_of_study || 'Field not specified'}</p>
                        <p className="text-sm text-gray-500">{edu.university_school || 'Institution not specified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Notification Modal */}
    {notificationModalOpen && selectedCandidateForNotification && (
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        candidateId={selectedCandidateForNotification.user_id}
        candidateName={`Candidate ${candidates.findIndex(c => c.user_id === selectedCandidateForNotification.user_id) + 1}`}
        designationName={getDesignationName()}
        onSuccess={handleNotificationSuccess}
      />
    )}
    </>
  );
}
