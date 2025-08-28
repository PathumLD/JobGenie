'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileSection } from '@/components/candidate/ProfileSection';
import { CandidateProfileResponse, BasicInfoSection } from '@/types/candidate-profile';

export default function CandidateProfilePage() {
  const [profileData, setProfileData] = useState<CandidateProfileResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch profile using the current user endpoint
        const response = await fetch('/api/candidate/profile/current');
        const data = await response.json();
        
        if (data.success) {
          setProfileData(data.data);
        } else {
          if (data.error === 'UNAUTHORIZED') {
            setError('You are not logged in. Please log in to view your profile.');
          } else {
            setError(data.message || 'Failed to fetch profile');
          }
        }
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Your profile could not be found.</p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Make sure you have completed your profile setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const basicInfoSection = profileData.sections.find(s => s.data.type === 'basic_info');
  const basicInfo = basicInfoSection?.data as BasicInfoSection;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Professional information and experience</p>
            </div>
            <Button className="bg-gray-600 hover:bg-gray-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                {/* Profile Photo Section */}
                <div className="flex-shrink-0 text-center lg:text-left">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 overflow-hidden">
                    {basicInfo?.profile_image_url ? (
                      <img 
                        src={basicInfo.profile_image_url} 
                        alt={`${basicInfo.first_name} ${basicInfo.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-gray-600 font-semibold">
                        {basicInfo?.first_name?.[0]}{basicInfo?.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" className="w-full lg:w-auto border-gray-600 text-gray-600 hover:bg-gray-50">
                    Upload Photo
                  </Button>
                </div>

                {/* Profile Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {basicInfo?.first_name} {basicInfo?.last_name}
                    </h3>
                    {basicInfo?.title && (
                      <p className="text-lg text-gray-600 mb-1">{basicInfo.title}</p>
                    )}
                    {basicInfo?.current_position && (
                      <p className="text-gray-600 mb-1">{basicInfo.current_position}</p>
                    )}
                    {basicInfo?.industry && (
                      <p className="text-gray-500">{basicInfo.industry}</p>
                    )}
                  </div>

                  {/* Contact & Location Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {basicInfo?.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{basicInfo.location}</span>
                      </div>
                    )}
                    {/* {basicInfo?.work_availability && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 002-2z" />
                        </svg>
                        <span>{basicInfo.work_availability.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </div>
                    )} */}
                    {/* {basicInfo?.availability_status && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{basicInfo.availability_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </div>
                    )} */}
                  </div>

                  {/* Social Media Links */}
                  {(basicInfo?.linkedin_url || basicInfo?.github_url || basicInfo?.personal_website) && (
                    <div className="flex gap-3 mb-4 pt-4 border-t border-gray-200">
                      {basicInfo.linkedin_url && (
                        <a 
                          href={basicInfo.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {basicInfo.github_url && (
                        <a 
                          href={basicInfo.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                          title="GitHub"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {basicInfo.personal_website && (
                        <a 
                          href={basicInfo.personal_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                          title="Personal Website"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats Section */}
                {/* <div className="flex-shrink-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700 mb-1">
                        {profileData.profile_summary.total_experience_years}
                      </div>
                      <div className="text-sm text-gray-600">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700 mb-1">
                        {profileData.profile_summary.total_projects}
                      </div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700 mb-1">
                        {profileData.profile_summary.total_skills}
                      </div>
                      <div className="text-sm text-gray-600">Skills</div>
                    </div>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {profileData.sections
            .filter(section => section.data.type !== 'basic_info')
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <ProfileSection key={section.id} section={section} />
            ))}
        </div>
      </div>
    </div>
  );
}












