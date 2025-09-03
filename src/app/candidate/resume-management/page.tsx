'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, Download, Star, Trash2, Upload, Plus, FileText, Calendar, HardDrive } from 'lucide-react';
import { Resume } from '@/types/resume-management';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ResumeListResponse {
  success: boolean;
  data: {
    candidate_id: string;
    resumes: Resume[];
    total_count: number;
    primary_resume: Resume | null;
  };
}

interface ResumeUpdateResponse {
  success: boolean;
  message: string;
  data: Resume;
}

interface ResumeDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deleted_resume_id: string;
    candidate_id: string;
  };
}

export default function ResumeManagementPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [primaryResume, setPrimaryResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Resume Management Page - useEffect triggered');
    console.log('🔑 Token available:', !!token);
    console.log('👤 User:', user);
    console.log('⏳ Auth loading:', authLoading);
  }, [token, user, authLoading]);

  // Fetch resumes on component mount
  useEffect(() => {
    if (token && !authLoading) {
      console.log('✅ Token found and auth not loading, fetching resumes...');
      fetchResumes();
    } else if (!authLoading && !token) {
      console.log('❌ No token available, setting loading to false');
      setLoading(false);
    }
  }, [token, authLoading]);

  const fetchResumes = async () => {
    try {
      console.log('🔄 Starting to fetch resumes...');
      setLoading(true);
      
      const response = await fetch('/api/candidate/resume/upload', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`);
      }

      const data: ResumeListResponse = await response.json();
      console.log('📊 Received data:', data);
      
      setResumes(data.data.resumes);
      setPrimaryResume(data.data.primary_resume);
      console.log('✅ Resumes loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleMakePrimary = async (resumeId: string) => {
    if (!confirm('Are you sure you want to set this resume as primary? This will replace your current primary resume.')) {
      return;
    }

    try {
      setUpdating(resumeId);
      const response = await fetch('/api/candidate/resume/manage', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
          is_primary: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      const data: ResumeUpdateResponse = await response.json();
      toast.success('Primary resume updated successfully');
      
      // Refresh the list
      await fetchResumes();
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Failed to update primary resume');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(resumeId);
      const response = await fetch('/api/candidate/resume/manage', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      const data: ResumeDeleteResponse = await response.json();
      toast.success('Resume deleted successfully');
      
      // Refresh the list
      await fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewResume = (resume: Resume) => {
    if (resume.resume_url) {
      // Check if it's a PDF or image that can be viewed in browser
      if (resume.file_type?.includes('pdf') || resume.file_type?.includes('image')) {
        window.open(resume.resume_url, '_blank');
      } else {
        // For other file types, trigger download
        handleDownloadResume(resume);
      }
    } else {
      toast.error('Resume file not available');
    }
  };

  const handleDownloadResume = (resume: Resume) => {
    if (resume.resume_url) {
      const link = document.createElement('a');
      link.href = resume.resume_url;
      link.download = resume.original_filename || 'resume';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Resume file not available');
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileType: string | null): React.ReactNode => {
    if (!fileType) return <FileText className="w-5 h-5" />;
    
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('doc')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('txt')) return <FileText className="w-5 h-5 text-gray-500" />;
    
    return <FileText className="w-5 h-5" />;
  };

  // Show loading state while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching resumes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading resume management...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!token || !user) {
    return (
      <div className="min-h-screen mx-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access resume management.</p>
          <button
            onClick={() => window.location.href = '/candidate/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Management</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage and organize your professional resumes. Set a primary resume for job applications.
        </p>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="flex justify-center">
          <Card className="bg-white border-2 border-dashed border-gray-300 max-w-md w-full">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded yet</h3>
              <p className="text-gray-500 mb-6">
                Upload your first resume to get started with job applications.
              </p>
              <Button
                onClick={() => window.location.href = '/candidate/upload-cv'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className={`bg-white border-2 transition-all duration-200 hover:shadow-lg ${
                resume.is_primary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(resume.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium text-gray-900 truncate">
                        {resume.original_filename || 'Untitled Resume'}
                      </CardTitle>
                      <div className="flex items-center mt-1 space-x-2">
                        {resume.is_primary && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-xs text-yellow-700 font-medium ml-1">Primary</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 capitalize">
                          {resume.file_type?.split('/')[1] || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Resume Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <HardDrive className="w-3 h-3 mr-1" />
                    {formatFileSize(resume.file_size)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Uploaded {formatDate(resume.uploaded_at)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewResume(resume)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadResume(resume)}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>

                {/* Primary and Delete Actions */}
                <div className="flex gap-2 mt-3">
                  {!resume.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMakePrimary(resume.id)}
                      disabled={updating === resume.id}
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      {updating === resume.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Star className="w-3 h-3 mr-1" />
                          Make Primary
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteResume(resume.id)}
                    disabled={deleting === resume.id}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {deleting === resume.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
