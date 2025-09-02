import { PrismaClient } from '@prisma/client';
import { ResumeStorage } from '@/lib/resume-storage';
import {
  Resume,
  ResumeUploadData,
  ResumeUpdateData,
  ResumeDeleteData,
  FileUploadResult,
  CVExtractedData,
  ResumeAnalysisResult,
  JWTPayload
} from '@/types/resume-management';

const prisma = new PrismaClient();

export class ResumeService {
  // Upload resume file and create database record
  static async uploadResume(
    file: File,
    candidateId: string,
    uploadData: ResumeUploadData = {}
  ): Promise<{
    resume: Resume;
    uploadResult: FileUploadResult;
  }> {
    try {
      // Upload file to storage
      const uploadResult = await ResumeStorage.uploadResume(file, candidateId);

      // Set other resumes as non-primary if this one is primary
      if (uploadData.is_primary) {
        await this.setOtherResumesNonPrimary(candidateId);
      }

      // Create resume record
      const resume = await prisma.resume.create({
        data: {
          candidate_id: candidateId,
          is_allow_fetch: uploadData.is_allow_fetch ?? true,
          resume_url: uploadResult.publicUrl,
          original_filename: uploadData.original_filename || file.name,
          file_size: uploadData.file_size || file.size,
          file_type: uploadData.file_type || file.type,
          is_primary: uploadData.is_primary ?? false,
          uploaded_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // Update candidate resume URL if primary
      if (uploadData.is_primary) {
        await this.updateCandidateResumeUrl(candidateId, uploadResult.publicUrl);
      }

      return { resume, uploadResult };
    } catch (error) {
      console.error('Resume upload service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to upload resume: ${error.message}` 
          : 'Failed to upload resume'
      );
    }
  }

  // Get all resumes for a candidate
  static async getCandidateResumes(candidateId: string): Promise<{
    resumes: Resume[];
    totalCount: number;
    primaryResume: Resume | null;
  }> {
    try {
      const resumes = await prisma.resume.findMany({
        where: { candidate_id: candidateId },
        orderBy: [
          { is_primary: 'desc' },
          { uploaded_at: 'desc' }
        ]
      });

      return {
        resumes,
        totalCount: resumes.length,
        primaryResume: resumes.find(r => r.is_primary) || null
      };
    } catch (error) {
      console.error('Get candidate resumes service error:', error);
      throw new Error('Failed to retrieve candidate resumes');
    }
  }

  // Update resume metadata
  static async updateResume(
    resumeId: string,
    candidateId: string,
    updateData: Omit<ResumeUpdateData, 'resume_id'>
  ): Promise<Resume> {
    try {
      // Check if resume exists and belongs to candidate
      const existingResume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          candidate_id: candidateId
        }
      });

      if (!existingResume) {
        throw new Error('Resume not found or access denied');
      }

      // Set other resumes as non-primary if this one is being set as primary
      if (updateData.is_primary) {
        await this.setOtherResumesNonPrimary(candidateId, resumeId);
      }

      // Update resume
      const updatedResume = await prisma.resume.update({
        where: { id: resumeId },
        data: {
          is_primary: updateData.is_primary !== undefined ? updateData.is_primary : existingResume.is_primary,
          is_allow_fetch: updateData.is_allow_fetch !== undefined ? updateData.is_allow_fetch : existingResume.is_allow_fetch,
          updated_at: new Date(),
        }
      });

      // Update candidate resume URL if primary
      if (updateData.is_primary) {
        await this.updateCandidateResumeUrl(candidateId, updatedResume.resume_url);
      }

      return updatedResume;
    } catch (error) {
      console.error('Update resume service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to update resume: ${error.message}` 
          : 'Failed to update resume'
      );
    }
  }

  // Delete resume
  static async deleteResume(
    resumeId: string,
    candidateId: string
  ): Promise<{ deletedResumeId: string; candidateId: string }> {
    try {
      // Check if resume exists and belongs to candidate
      const existingResume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          candidate_id: candidateId
        }
      });

      if (!existingResume) {
        throw new Error('Resume not found or access denied');
      }

      // Delete from storage
      try {
        const fileName = existingResume.resume_url?.split('/').pop();
        if (fileName) {
          const filePath = `${candidateId}/${fileName}`;
          await ResumeStorage.deleteResume(filePath);
        }
      } catch (storageError) {
        console.warn('Storage deletion warning:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      await prisma.resume.delete({
        where: { id: resumeId }
      });

      // Handle primary resume logic
      if (existingResume.is_primary) {
        await this.handlePrimaryResumeAfterDeletion(candidateId, resumeId);
      }

      return {
        deletedResumeId: resumeId,
        candidateId
      };
    } catch (error) {
      console.error('Delete resume service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to delete resume: ${error.message}` 
          : 'Failed to delete resume'
      );
    }
  }

  // Get resume by ID
  static async getResumeById(
    resumeId: string,
    candidateId: string
  ): Promise<Resume | null> {
    try {
      return await prisma.resume.findFirst({
        where: {
          id: resumeId,
          candidate_id: candidateId
        }
      });
    } catch (error) {
      console.error('Get resume by ID service error:', error);
      throw new Error('Failed to retrieve resume');
    }
  }

  // Set other resumes as non-primary
  private static async setOtherResumesNonPrimary(
    candidateId: string,
    excludeResumeId?: string
  ): Promise<void> {
    await prisma.resume.updateMany({
      where: {
        candidate_id: candidateId,
        id: excludeResumeId ? { not: excludeResumeId } : undefined
      },
      data: {
        is_primary: false,
        updated_at: new Date()
      }
    });
  }

  // Update candidate resume URL
  private static async updateCandidateResumeUrl(
    candidateId: string,
    resumeUrl: string | null
  ): Promise<void> {
    await prisma.candidate.update({
      where: { user_id: candidateId },
      data: {
        resume_url: resumeUrl,
        updated_at: new Date(),
      }
    });
  }

  // Handle primary resume logic after deletion
  private static async handlePrimaryResumeAfterDeletion(
    candidateId: string,
    deletedResumeId: string
  ): Promise<void> {
    // Find another resume to set as primary
    const nextPrimaryResume = await prisma.resume.findFirst({
      where: {
        candidate_id: candidateId,
        id: { not: deletedResumeId }
      },
      orderBy: { uploaded_at: 'desc' }
    });

    if (nextPrimaryResume) {
      // Set the next resume as primary
      await prisma.resume.update({
        where: { id: nextPrimaryResume.id },
        data: {
          is_primary: true,
          updated_at: new Date()
        }
      });

      // Update candidate table
      await this.updateCandidateResumeUrl(candidateId, nextPrimaryResume.resume_url);
    } else {
      // No more resumes, clear candidate resume_url
      await this.updateCandidateResumeUrl(candidateId, null);
    }
  }

  // Check if candidate exists
  static async candidateExists(candidateId: string): Promise<boolean> {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { user_id: candidateId }
      });
      return !!candidate;
    } catch (error) {
      console.error('Candidate exists check error:', error);
      return false;
    }
  }

  // Get candidate with resumes
  static async getCandidateWithResumes(candidateId: string) {
    try {
      return await prisma.candidate.findUnique({
        where: { user_id: candidateId },
        include: {
          resumes: {
            orderBy: [
              { is_primary: 'desc' },
              { uploaded_at: 'desc' }
            ]
          }
        }
      });
    } catch (error) {
      console.error('Get candidate with resumes error:', error);
      throw new Error('Failed to retrieve candidate with resumes');
    }
  }

  // Cleanup - disconnect Prisma
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

// CV Extraction Service
export class CVExtractionService {
  // Process CV extraction and optionally save as resume
  static async extractAndProcess(
    file: File,
    candidateId: string,
    options: {
      extractionMethod?: 'ai' | 'manual' | 'parsing';
      saveAsResume?: boolean;
      setAsPrimary?: boolean;
    } = {}
  ): Promise<{
    extractionId: string;
    extractedData: CVExtractedData;
    confidenceScore: number;
    resumeId?: string;
    resumeUrl?: string;
  }> {
    try {
      // Upload CV file
      const uploadResult = await ResumeStorage.uploadCVFile(file, candidateId);

      // Extract text (placeholder implementation)
      const extractedText = await this.extractTextFromFile(file);

      // Extract structured data (placeholder implementation)
      const extractedData = await this.extractStructuredData(extractedText, file.name);

      const extractionId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const confidenceScore = 0.85; // Placeholder

      let resumeId: string | undefined;
      let resumeUrl: string | undefined;

      // Save as resume if requested
      if (options.saveAsResume) {
        const resumeResult = await ResumeService.uploadResume(
          file,
          candidateId,
          {
            is_primary: options.setAsPrimary,
            is_allow_fetch: true
          }
        );
        resumeId = resumeResult.resume.id;
        resumeUrl = resumeResult.uploadResult.publicUrl;
      }

      return {
        extractionId,
        extractedData,
        confidenceScore,
        resumeId,
        resumeUrl
      };
    } catch (error) {
      console.error('CV extraction service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to extract CV: ${error.message}` 
          : 'Failed to extract CV'
      );
    }
  }

  // Extract text from file (placeholder)
  private static async extractTextFromFile(file: File): Promise<string> {
    // Placeholder implementation
    return `Extracted text from ${file.name}`;
  }

  // Extract structured data (placeholder)
  private static async extractStructuredData(
    text: string,
    fileName: string
  ): Promise<CVExtractedData> {
    // Placeholder implementation
    return {
      personal_info: {
        name: 'Extracted Name',
        email: 'extracted@email.com'
      },
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [],
      education: []
    };
  }
}

// Resume Analysis Service
export class ResumeAnalysisService {
  // Analyze resume content
  static async analyzeResume(
    resumeId: string,
    candidateId: string
  ): Promise<{
    resumeId: string;
    candidateId: string;
    analysis: ResumeAnalysisResult;
    analyzedAt: Date;
  }> {
    try {
      // Get resume
      const resume = await ResumeService.getResumeById(resumeId, candidateId);
      
      if (!resume) {
        throw new Error('Resume not found or access denied');
      }

      if (!resume.resume_url) {
        throw new Error('Resume file not found');
      }

      // Analyze content (placeholder implementation)
      const analysis = await this.analyzeResumeContent(
        resume.resume_url,
        resume.original_filename || undefined
      );

      return {
        resumeId,
        candidateId,
        analysis,
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('Resume analysis service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to analyze resume: ${error.message}` 
          : 'Failed to analyze resume'
      );
    }
  }

  // Analyze resume content (placeholder)
  private static async analyzeResumeContent(
    resumeUrl: string,
    fileName?: string
  ): Promise<ResumeAnalysisResult> {
    // Placeholder implementation
    return {
      skills_found: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      experience_summary: '5+ years of software development experience',
      education_summary: 'Bachelor\'s degree in Computer Science',
      overall_score: 85,
      recommendations: [
        'Consider adding more recent technologies',
        'Include specific achievements and metrics'
      ]
    };
  }
}
