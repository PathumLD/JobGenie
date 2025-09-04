'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  applied_date: string;
  experience_years: number;
  skills: string[];
  resume_url?: string;
}

export default function EmployerApplicationsPage() {
  const [applications] = useState<Application[]>([
    {
      id: '1',
      candidate_name: 'John Smith',
      candidate_email: 'john.smith@email.com',
      job_title: 'Senior Software Engineer',
      status: 'pending',
      applied_date: '2024-01-20',
      experience_years: 5,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      resume_url: '/resumes/john-smith.pdf'
    },
    {
      id: '2',
      candidate_name: 'Sarah Johnson',
      candidate_email: 'sarah.johnson@email.com',
      job_title: 'Product Manager',
      status: 'shortlisted',
      applied_date: '2024-01-18',
      experience_years: 7,
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      resume_url: '/resumes/sarah-johnson.pdf'
    },
    {
      id: '3',
      candidate_name: 'Mike Chen',
      candidate_email: 'mike.chen@email.com',
      job_title: 'UX Designer',
      status: 'interviewed',
      applied_date: '2024-01-15',
      experience_years: 4,
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      resume_url: '/resumes/mike-chen.pdf'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'interviewed':
        return 'bg-indigo-100 text-indigo-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      hired: 0,
      rejected: 0
    };

    applications.forEach(app => {
      counts[app.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage candidate applications</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filter
          </Button>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.reviewed}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statusCounts.shortlisted}</div>
            <div className="text-sm text-gray-600">Shortlisted</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{statusCounts.interviewed}</div>
            <div className="text-sm text-gray-600">Interviewed</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{statusCounts.hired}</div>
            <div className="text-sm text-gray-600">Hired</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{application.candidate_name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{application.candidate_email}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                        </svg>
                        {application.job_title}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {application.experience_years} years experience
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Applied {new Date(application.applied_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      View Resume
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm">
                        Actions
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
