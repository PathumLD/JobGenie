'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/auth-storage';

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    industry: string;
    logo_url?: string;
  } | null;
  customCompanyName?: string;
  location: string | null;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  experience_level: string;
  job_type: string;
  created_at: string;
}

export function CandidateDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await authenticatedFetch('/api/candidate/jobs?limit=6');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency || 'LKR'}`;
    if (min) return `${min.toLocaleString()}+ ${currency || 'LKR'}`;
    if (max) return `Up to ${max.toLocaleString()} ${currency || 'LKR'}`;
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchJobs} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Job Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing opportunities that match your skills and career goals
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Search Jobs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Find jobs that match your skills and preferences
            </p>
            <Link href="/candidate/jobs">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Update Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Keep your profile updated for better job matches
            </p>
            <Link href="/candidate/profile">
              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Applications</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track your job applications and responses
            </p>
            <Link href="/candidate/applications">
              <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                View Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Job Opportunities</h2>
          <Link href="/candidate/jobs">
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
              View All Jobs →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 line-clamp-2 mb-2">
                      {job.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {job.company?.name || job.customCompanyName || 'Company not specified'}
                    </p>
                  </div>
                  {job.company?.logo_url && (
                    <img
                      src={job.company.logo_url}
                      alt={`${job.company.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover ml-3"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span>📍</span>
                    <span>{job.location || 'Remote'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💼</span>
                    <span>{job.job_type.replace('_', ' ')}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span>🎯</span>
                    <span>{job.experience_level}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💰</span>
                    <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Posted {formatDate(job.created_at)}
                    </span>
                    <Link href={`/candidate/jobs/${job.id}`}>
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Find Your Dream Job?
          </h3>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            Our AI-powered system analyzes thousands of jobs to find the perfect match for your skills and career goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/candidate/jobs">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-50">
                Start Job Search
              </Button>
            </Link>
            <Link href="/candidate/profile">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Complete Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
