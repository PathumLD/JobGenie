'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, Download, Star, Trash2, Upload, Plus, FileText, Calendar, HardDrive, AlertCircle } from 'lucide-react';
import { Resume, ResumeListResponse, ResumeUpdateResponse, ResumeDeleteResponse } from '@/types/resume-management';
import { CandidateAuthGuard } from '@/components/auth/CandidateAuthGuard';
import { tokenStorage } from '@/lib/auth-storage';
import { toast } from 'react-hot-toast';

export default function ResumeManagementPage() {
  return (
    <CandidateAuthGuard>
      <ResumeManagementContent />
    </CandidateAuthGuard>
  );
}

function ResumeManagementContent() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [primaryResume, setPrimaryResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const token = tokenStorage.getAccessToken();
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('/api/candidate/resume/upload', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`);
      }

      const data: ResumeListResponse = await response.json();
      
      if (data.success) {
        setResumes(data.data.resumes);
        setPrimaryResume(data.data.primary_resume);
      } else {
        throw new Error('Failed to load resumes');
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrimary = async (resumeId: string): Promise<void> => {
    if (!confirm('Are you sure you want to set this resume as primary? This will replace your current primary resume.')) {
      return;
    }

    try {
      setUpdating(resumeId);
      const token = tokenStorage.getAccessToken();
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

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
      
      if (data.success) {
        toast.success('Primary resume updated successfully');
        // Refresh the list
        await fetchResumes();
      } else {
        throw new Error(data.message || 'Failed to update resume');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Failed to update primary resume');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteResume = async (resumeId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(resumeId);
      const token = tokenStorage.getAccessToken();
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

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
      
      if (data.success) {
        toast.success('Resume deleted successfully');
        // Refresh the list
        await fetchResumes();
      } else {
        throw new Error(data.message || 'Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewResume = (resume: Resume): void => {
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

  const handleDownloadResume = (resume: Resume): void => {
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
    if (fileType.includes('doc')) return <FileText className="w-5 h-5 text-emerald-500" />;
    if (fileType.includes('txt')) return <FileText className="w-5 h-5 text-gray-500" />;
    
    return <FileText className="w-5 h-5" />;
  };

  // Show loading state while fetching resumes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading resume management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
              <p className="text-gray-600 mt-2">Manage and organize your professional resumes. Set a primary resume for job applications.</p>
            </div>
          </div>
        </div>

        {/* Resumes Grid */}
        {resumes.length === 0 ? (
          <div className="flex justify-center">
            <Card className="bg-white border-2 border-dashed border-gray-300 max-w-md w-full shadow-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded yet</h3>
                <p className="text-gray-500 mb-6">
                  Upload your first resume to get started with job applications.
                </p>
                <Button
                  onClick={() => window.location.href = '/candidate/upload-cv'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                className={`bg-white border-0 shadow-sm hover:shadow-md transition-shadow ${
                  resume.is_primary ? 'border-l-4 border-l-emerald-500 bg-emerald-50' : ''
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
                        className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
    </div>
  );
}
