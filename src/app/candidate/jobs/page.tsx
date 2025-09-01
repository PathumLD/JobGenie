'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OAuthHandler } from '@/components/auth/OAuthHandler';
import { useEffect, useState } from 'react';

export default function CandidateJobsPage() {
  const [shouldHandleOAuth, setShouldHandleOAuth] = useState(false);

  useEffect(() => {
    // Check if URL contains OAuth success parameters
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const tempToken = urlParams.get('temp_token');
    const hasOAuthSuccess = oauthSuccess === 'true' && tempToken;
    setShouldHandleOAuth(!!hasOAuthSuccess);
  }, []);

  // If OAuth tokens are present, show the OAuth handler
  if (shouldHandleOAuth) {
    return <OAuthHandler />;
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-2">Find your next career opportunity</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Advanced Filters
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="w-48">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All Locations</option>
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            </div>
            <Button className="px-8 bg-emerald-600 hover:bg-emerald-700">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-0 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Job Type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Type</h4>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
                <div className="space-y-2">
                  {['Entry', 'Junior', 'Mid', 'Senior', 'Lead'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                <div className="space-y-2">
                  {['$0 - $50k', '$50k - $100k', '$100k - $150k', '$150k+'].map((range) => (
                    <label key={range} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="ml-2 text-sm text-gray-700">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Results */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {/* Sample Job Cards */}
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Senior Software Engineer
                      </h3>
                      <p className="text-gray-600 mb-3">
                        We are looking for a talented Senior Software Engineer to join our growing team...
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          San Francisco, CA
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                          </svg>
                          Full-time
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          $120k - $180k
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                        Apply Now
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
