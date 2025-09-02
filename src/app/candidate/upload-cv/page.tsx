'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, X, Plus, Minus } from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth-storage';
import { CandidateAuthGuard } from '@/components/auth/CandidateAuthGuard';

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
  };
}

interface ExtractedSummary {
  work_experiences_count: number;
  educations_count: number;
  skills_count: number;
  projects_count: number;
  certificates_count: number;
  awards_count: number;
  volunteering_count: number;
  languages_count: number;
  accomplishments_count: number;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface MergeResponse {
  success: boolean;
  message: string;
  data: {
    file_info: FileInfo;
    merge_results: MergeResults;
    extracted_summary: ExtractedSummary;
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
  const [extractedSummary, setExtractedSummary] = useState<ExtractedSummary | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

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
      setExtractedSummary(null);
      setFileInfo(null);
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
        setExtractedSummary(result.data.extracted_summary);
        setFileInfo(result.data.file_info);
        
        toast.success('CV processed successfully! Your profile has been updated with new information.');
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
    setExtractedSummary(null);
    setFileInfo(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalNewItems = (results: MergeResults): number => {
    return results.new_work_experiences + 
           results.new_educations + 
           results.new_certificates + 
           results.new_projects + 
           results.new_skills + 
           results.new_awards + 
           results.new_volunteering + 
           results.new_languages + 
           results.new_accomplishments;
  };

  const getTotalSkippedItems = (results: MergeResults): number => {
    return results.skipped_duplicates.work_experiences + 
           results.skipped_duplicates.educations + 
           results.skipped_duplicates.certificates + 
           results.skipped_duplicates.projects + 
           results.skipped_duplicates.skills + 
           results.skipped_duplicates.awards + 
           results.skipped_duplicates.volunteering + 
           results.skipped_duplicates.languages;
  };

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

        {/* Results Section */}
        {mergeResults && extractedSummary && fileInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  CV Processed Successfully
                </h2>
                <p className="text-gray-600">
                  File: {fileInfo.name} ({formatFileSize(fileInfo.size)})
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-800">
                  {getTotalNewItems(mergeResults)}
                </div>
                <div className="text-sm text-green-600">New Items Added</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {getTotalSkippedItems(mergeResults)}
                </div>
                <div className="text-sm text-blue-600">Duplicates Skipped</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {mergeResults.basic_info_updated ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-purple-600">Basic Info Updated</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Results
              </h3>

              {/* New Items Added */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  New Items Added to Your Profile
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {mergeResults.new_work_experiences > 0 && (
                    <div className="flex justify-between">
                      <span>Work Experiences:</span>
                      <span className="font-medium">{mergeResults.new_work_experiences}</span>
                    </div>
                  )}
                  {mergeResults.new_educations > 0 && (
                    <div className="flex justify-between">
                      <span>Education:</span>
                      <span className="font-medium">{mergeResults.new_educations}</span>
                    </div>
                  )}
                  {mergeResults.new_skills > 0 && (
                    <div className="flex justify-between">
                      <span>Skills:</span>
                      <span className="font-medium">{mergeResults.new_skills}</span>
                    </div>
                  )}
                  {mergeResults.new_projects > 0 && (
                    <div className="flex justify-between">
                      <span>Projects:</span>
                      <span className="font-medium">{mergeResults.new_projects}</span>
                    </div>
                  )}
                  {mergeResults.new_certificates > 0 && (
                    <div className="flex justify-between">
                      <span>Certificates:</span>
                      <span className="font-medium">{mergeResults.new_certificates}</span>
                    </div>
                  )}
                  {mergeResults.new_awards > 0 && (
                    <div className="flex justify-between">
                      <span>Awards:</span>
                      <span className="font-medium">{mergeResults.new_awards}</span>
                    </div>
                  )}
                  {mergeResults.new_volunteering > 0 && (
                    <div className="flex justify-between">
                      <span>Volunteering:</span>
                      <span className="font-medium">{mergeResults.new_volunteering}</span>
                    </div>
                  )}
                  {mergeResults.new_languages > 0 && (
                    <div className="flex justify-between">
                      <span>Languages:</span>
                      <span className="font-medium">{mergeResults.new_languages}</span>
                    </div>
                  )}
                  {mergeResults.new_accomplishments > 0 && (
                    <div className="flex justify-between">
                      <span>Accomplishments:</span>
                      <span className="font-medium">{mergeResults.new_accomplishments}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = '/candidate/view-profile'}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                View Updated Profile
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setMergeResults(null);
                  setExtractedSummary(null);
                  setFileInfo(null);
                  setError(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors text-center"
              >
                Upload Another CV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
