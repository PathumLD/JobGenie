'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, AlertCircle, X, Plus } from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth-storage';
import { CandidateAuthGuard } from '@/components/auth/CandidateAuthGuard';
import { ProfilePreview } from '@/components/candidate/ProfilePreview';
import { CandidateProfileResponse } from '@/types/candidate-profile';

interface MergeResults {
  basic_info_updated: boolean;
  new_work_experiences: number;
  new_educations: number;
  new_certificates: number;
  new_projects: number;
  new_skills: number;
  new_awards: number;
  new_volunteering: number;
  new_languages: number;
  new_accomplishments: number;
  skipped_duplicates: {
    work_experiences: number;
    educations: number;
    certificates: number;
    projects: number;
    skills: number;
    awards: number;
    volunteering: number;
    languages: number;
    accomplishments: number;
  };
}



interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface ExtractedData {
  basic_info: Record<string, any>;
  work_experiences: Array<Record<string, any>>;
  educations: Array<Record<string, any>>;
  skills: Array<Record<string, any>>;
  projects: Array<Record<string, any>>;
  certificates: Array<Record<string, any>>;
  awards: Array<Record<string, any>>;
  volunteering: Array<Record<string, any>>;
  languages: Array<Record<string, any>>;
  accomplishments: Array<Record<string, any>>;
}



interface MergeResponse {
  success: boolean;
  message: string;
  data: {
    file_info: FileInfo;
    merge_results: MergeResults;
    resume_record?: Record<string, unknown>; // Resume record if created
    upload_result?: Record<string, unknown>; // Upload result if successful
    extracted_data?: ExtractedData; // Actual extracted data from CV
  };
}

export default function UploadCVPage() {
  return (
    <CandidateAuthGuard>
      <UploadCVContent />
    </CandidateAuthGuard>
  );
}

function UploadCVContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergeResults, setMergeResults] = useState<MergeResults | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [existingProfile, setExistingProfile] = useState<CandidateProfileResponse['data'] | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  // Fetch existing profile data when component mounts
  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      const response = await authenticatedFetch('/api/candidate/profile/current', {
        method: 'GET',
      });

      if (response.ok) {
        const profileData: CandidateProfileResponse = await response.json();
        setExistingProfile(profileData.data);
      }
    } catch (error) {
      console.error('Failed to fetch existing profile:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for fast processing
        setError('File size must be less than 2MB for fast processing');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setMergeResults(null);
      setFileInfo(null);
      setExtractedData(null);
      setShowProfilePreview(false);
    }
  };

  const handleUploadCV = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
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

      const result: MergeResponse = await response.json();
      
      if (result.success) {
              setMergeResults(result.data.merge_results);
      setFileInfo(result.data.file_info);
        
        // For ProfilePreview, we need to create a mock extracted data structure
        // since the actual extracted data is not returned by the merge API
        // This will show the merge results in the preview
        // Use the actual extracted data from the API response
        if (result.data.extracted_data) {
          setExtractedData(result.data.extracted_data);
        } else {
          // Fallback: Create minimal data structure if extracted_data is not available
          const extractedDataStructure = {
            basic_info: {},
            work_experiences: [],
            educations: [],
            skills: [],
            projects: [],
            certificates: [],
            awards: [],
            volunteering: [],
            languages: [],
            accomplishments: []
          };
          setExtractedData(extractedDataStructure);
        }
        setShowProfilePreview(true);
        
        // Check if resume was uploaded successfully
        if (result.data.resume_record && result.data.upload_result) {
          toast.success('CV processed and resume uploaded successfully! Your profile has been updated with new information.');
          
          // Dispatch custom event to notify header to refresh resume status
          window.dispatchEvent(new CustomEvent('resume-uploaded'));
        } else {
          toast.success('CV processed successfully! Your profile has been updated with new information.');
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
      toast.error('Failed to process CV');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setMergeResults(null);
    setFileInfo(null);
    setExtractedData(null);
    setShowProfilePreview(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewProfile = () => {
    window.location.href = '/candidate/view-profile';
  };

  const handleUploadAnother = () => {
    clearFile();
  };

  // If showing profile preview, render the ProfilePreview component
  if (showProfilePreview && mergeResults && extractedData) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfilePreview
            existingProfile={existingProfile}
            newData={extractedData}
            mergeResults={mergeResults}
            onViewProfile={handleViewProfile}
            onUploadAnother={handleUploadAnother}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Additional CV
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload another CV to automatically extract and add new information to your existing profile.
            We'll intelligently merge the data and skip any duplicates.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF Resume/CV
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="mb-4">
                  <label
                    htmlFor="cv-upload"
                    className="cursor-pointer bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Choose PDF File
                  </label>
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Maximum file size: 10MB
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleUploadCV}
            disabled={!selectedFile || isUploading}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              !selectedFile || isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing CV...
              </div>
            ) : (
              'Upload and Process CV'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
