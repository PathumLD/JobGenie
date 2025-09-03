import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import { ResumeStorage } from '@/lib/resume-storage';
import {
  // JWTPayload,
  CVExtractionResponse,
  CVExtractedData,
  FileUploadResult,
  ErrorResponse,
  ResumeUploadData
} from '@/types/resume-management';
import { JWTPayload } from '@/types';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// CV file validation configuration
const CV_FILE_CONFIG = {
  maxSize: 15 * 1024 * 1024, // 15MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
};

// Helper function to validate CV file
function validateCVFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > CV_FILE_CONFIG.maxSize) {
    return {
      isValid: false,
      error: 'CV file size must be less than 15MB'
    };
  }

  // Check file type
  if (!CV_FILE_CONFIG.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF, DOC, DOCX, and image files (JPEG, PNG) are allowed for CV extraction'
    };
  }

  return { isValid: true };
}

// Helper function to upload CV file to Supabase storage
async function uploadCVFile(file: File, candidateId: string): Promise<FileUploadResult> {
  return ResumeStorage.uploadCVFile(file, candidateId);
}

// Helper function to extract text from CV file (placeholder for AI integration)
async function extractTextFromCV(file: File): Promise<string> {
  // This is a placeholder function
  // In a real implementation, you would integrate with:
  // - OpenAI GPT-4 Vision API for image-based CVs
  // - PDF parsing libraries for PDF files
  // - Document parsing services for DOC/DOCX files
  
  // For now, return a placeholder text based on file type
  const fileType = file.type;
  const fileName = file.name;
  
  if (fileType.includes('pdf')) {
    return `Extracted text from PDF CV: ${fileName}
    
    John Doe
    Software Engineer
    Email: john.doe@email.com
    Phone: +1234567890
    
    EXPERIENCE:
    Senior Software Engineer at Tech Corp (2020-2023)
    - Developed web applications using React and Node.js
    - Led a team of 5 developers
    - Implemented CI/CD pipelines
    
    Software Engineer at StartupXYZ (2018-2020)
    - Built REST APIs using Python and Django
    - Worked with PostgreSQL databases
    - Collaborated with cross-functional teams
    
    EDUCATION:
    Bachelor of Science in Computer Science
    University of Technology (2014-2018)
    
    SKILLS:
    JavaScript, React, Node.js, Python, Django, PostgreSQL, Git, Docker, AWS
    
    CERTIFICATIONS:
    AWS Certified Developer Associate (2022)
    `;
  } else if (fileType.includes('image')) {
    return `Extracted text from image CV: ${fileName}
    
    Jane Smith
    Full Stack Developer
    Email: jane.smith@email.com
    Phone: +9876543210
    
    PROFESSIONAL SUMMARY:
    Experienced full-stack developer with 4+ years of experience in web development
    
    TECHNICAL SKILLS:
    Frontend: React, Vue.js, HTML5, CSS3, JavaScript
    Backend: Node.js, Express, Python, Flask
    Database: MongoDB, MySQL
    Tools: Git, Docker, Jenkins
    
    WORK EXPERIENCE:
    Full Stack Developer - WebDev Inc (2021-Present)
    Junior Developer - CodeCraft (2019-2021)
    
    EDUCATION:
    Bachelor's in Information Technology
    Tech University (2015-2019)
    `;
  } else {
    return `Extracted text from document CV: ${fileName}
    
    Alex Johnson
    DevOps Engineer
    Email: alex.johnson@email.com
    Phone: +5555555555
    
    SUMMARY:
    DevOps engineer with expertise in cloud infrastructure and automation
    
    EXPERIENCE:
    DevOps Engineer at CloudTech (2019-Present)
    - Managed AWS infrastructure
    - Implemented Kubernetes clusters
    - Automated deployment pipelines
    
    SKILLS:
    AWS, Kubernetes, Docker, Terraform, Jenkins, Python, Bash
    
    EDUCATION:
    Master's in Computer Engineering
    Engineering College (2017-2019)
    `;
  }
}

// Helper function to extract structured data from CV text (placeholder for AI integration)
async function extractStructuredData(cvText: string): Promise<CVExtractedData> {
  // This is a placeholder function
  // In a real implementation, you would use:
  // - OpenAI GPT-4 API to parse and structure the CV text
  // - Named Entity Recognition (NER) models
  // - Custom ML models trained on CV data
  
  // Extract basic info based on common patterns
  const emailMatch = cvText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = cvText.match(/[\+]?[\d\s\-\(\)]{10,}/);
  
  // For demonstration, return structured data based on the extracted text
  if (cvText.includes('John Doe')) {
    return {
      personal_info: {
        name: 'John Doe',
        email: emailMatch?.[0] || 'john.doe@email.com',
        phone: phoneMatch?.[0] || '+1234567890',
        location: 'City, Country'
      },
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          duration: '2020-2023',
          description: 'Developed web applications using React and Node.js, Led a team of 5 developers',
          skills: ['React', 'Node.js', 'Leadership', 'CI/CD']
        },
        {
          title: 'Software Engineer',
          company: 'StartupXYZ',
          duration: '2018-2020',
          description: 'Built REST APIs using Python and Django, Worked with PostgreSQL databases',
          skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science',
          institution: 'University of Technology',
          year: '2018',
          field: 'Computer Science'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Django', 'PostgreSQL', 'Git', 'Docker', 'AWS'],
      certifications: [
        {
          name: 'AWS Certified Developer Associate',
          issuer: 'Amazon Web Services',
          year: '2022'
        }
      ],
      languages: ['English'],
      projects: []
    };
  } else if (cvText.includes('Jane Smith')) {
    return {
      personal_info: {
        name: 'Jane Smith',
        email: emailMatch?.[0] || 'jane.smith@email.com',
        phone: phoneMatch?.[0] || '+9876543210',
        location: 'City, State'
      },
      experience: [
        {
          title: 'Full Stack Developer',
          company: 'WebDev Inc',
          duration: '2021-Present',
          description: 'Developed full-stack web applications',
          skills: ['React', 'Vue.js', 'Node.js', 'Express']
        },
        {
          title: 'Junior Developer',
          company: 'CodeCraft',
          duration: '2019-2021',
          description: 'Worked on frontend and backend development',
          skills: ['HTML5', 'CSS3', 'JavaScript', 'Python']
        }
      ],
      education: [
        {
          degree: 'Bachelor\'s in Information Technology',
          institution: 'Tech University',
          year: '2019',
          field: 'Information Technology'
        }
      ],
      skills: ['React', 'Vue.js', 'HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express', 'Python', 'Flask', 'MongoDB', 'MySQL'],
      certifications: [],
      languages: ['English'],
      projects: []
    };
  } else {
    return {
      personal_info: {
        name: 'Alex Johnson',
        email: emailMatch?.[0] || 'alex.johnson@email.com',
        phone: phoneMatch?.[0] || '+5555555555',
        location: 'Tech City'
      },
      experience: [
        {
          title: 'DevOps Engineer',
          company: 'CloudTech',
          duration: '2019-Present',
          description: 'Managed AWS infrastructure, Implemented Kubernetes clusters, Automated deployment pipelines',
          skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins']
        }
      ],
      education: [
        {
          degree: 'Master\'s in Computer Engineering',
          institution: 'Engineering College',
          year: '2019',
          field: 'Computer Engineering'
        }
      ],
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Python', 'Bash'],
      certifications: [],
      languages: ['English'],
      projects: []
    };
  }
}

// Helper function to set other resumes as non-primary
async function setOtherResumesNonPrimary(candidateId: string, excludeResumeId?: string): Promise<void> {
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

// Helper function to update candidate resume URL
async function updateCandidateResumeUrl(candidateId: string, resumeUrl: string | null): Promise<void> {
  await prisma.candidate.update({
    where: { user_id: candidateId },
    data: {
      resume_url: resumeUrl,
      updated_at: new Date(),
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<CVExtractionResponse | ErrorResponse>> {
  try {
    console.log('🔄 CV Extraction API called');

    // 1. Authenticate user
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = verifyToken(token) as JWTPayload;
      if (!payload) {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can extract CV data.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const cvFile = formData.get('cvFile') as File | null;
    const extractionMethod = (formData.get('extractionMethod') as string) || 'ai';
    const saveAsResume = formData.get('saveAsResume') === 'true';
    const setAsPrimary = formData.get('setAsPrimary') === 'true';

    if (!cvFile) {
      return NextResponse.json(
        { error: 'CV file is required' },
        { status: 400 }
      );
    }

    // 3. Validate CV file
    const validation = validateCVFile(cvFile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file' },
        { status: 400 }
      );
    }

    // 4. Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found. Create profile first.' },
        { status: 404 }
      );
    }

    // 5. Upload CV file to Supabase storage
    let uploadResult: FileUploadResult;
    try {
      console.log('📄 Uploading CV file:', cvFile.name, 'Size:', cvFile.size);
      uploadResult = await uploadCVFile(cvFile, payload.userId);
      console.log('✅ CV file uploaded successfully:', uploadResult.publicUrl);
    } catch (uploadError) {
      console.error('❌ CV file upload failed:', uploadError);
      return NextResponse.json(
        { 
          error: 'Failed to upload CV file',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 6. Extract text from CV file
    let extractedText: string;
    try {
      console.log('🔍 Extracting text from CV file...');
      extractedText = await extractTextFromCV(cvFile);
      console.log('✅ Text extraction completed');
    } catch (extractionError) {
      console.error('❌ Text extraction failed:', extractionError);
      return NextResponse.json(
        { 
          error: 'Failed to extract text from CV file',
          details: extractionError instanceof Error ? extractionError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 7. Extract structured data from CV text
    let extractedData: CVExtractedData;
    try {
      console.log('🔍 Extracting structured data from CV text...');
      extractedData = await extractStructuredData(extractedText);
      console.log('✅ Structured data extraction completed');
    } catch (structuredExtractionError) {
      console.error('❌ Structured data extraction failed:', structuredExtractionError);
      return NextResponse.json(
        { 
          error: 'Failed to extract structured data from CV',
          details: structuredExtractionError instanceof Error ? structuredExtractionError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 8. Save as resume if requested
    let resumeId: string | null = null;
    if (saveAsResume) {
      try {
        // Set other resumes as non-primary if this one should be primary
        if (setAsPrimary) {
          await setOtherResumesNonPrimary(payload.userId);
          console.log('✅ Other resumes set as non-primary');
        }

        // Create resume record in database
        const resumeRecord = await prisma.resume.create({
          data: {
            candidate_id: payload.userId,
            is_allow_fetch: true,
            resume_url: uploadResult.publicUrl,
            original_filename: cvFile.name,
            file_size: cvFile.size,
            file_type: cvFile.type,
            is_primary: setAsPrimary,
            uploaded_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          }
        });

        resumeId = resumeRecord.id;
        console.log('✅ Resume record created:', resumeRecord.id);

        // Update candidate table with resume URL if this is primary
        if (setAsPrimary) {
          await updateCandidateResumeUrl(payload.userId, uploadResult.publicUrl);
          console.log('✅ Candidate resume_url updated');
        }
      } catch (resumeError) {
        console.error('❌ Failed to save as resume:', resumeError);
        // Continue with extraction response even if resume save fails
      }
    }

    // 9. Generate extraction ID
    const extractionId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 10. Return success response with extracted data
    const response: CVExtractionResponse = {
      success: true,
      message: 'CV extraction completed successfully',
      data: {
        extraction_id: extractionId,
        candidate_id: payload.userId,
        extracted_data: extractedData,
        confidence_score: 0.85, // Placeholder confidence score
        extraction_method: extractionMethod as 'ai' | 'manual' | 'parsing',
        created_at: new Date()
      }
    };

    // Add resume info if saved
    if (resumeId) {
      (response.data as any).resume_id = resumeId;
      (response.data as any).resume_url = uploadResult.publicUrl;
    }

    console.log('✅ CV extraction completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ CV extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<any | ErrorResponse>> {
  try {
    console.log('🔄 Get CV Extraction History API called');

    // 1. Authenticate user
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = verifyToken(token) as JWTPayload;
      if (!payload) {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can view CV extraction history.' },
        { status: 403 }
      );
    }

    // 2. For now, return a placeholder response since we don't have a CV extraction history table
    // In a real implementation, you would query a CV extraction history table
    return NextResponse.json({
      success: true,
      message: 'CV extraction history retrieved successfully',
      data: {
        candidate_id: payload.userId,
        extractions: [],
        total_count: 0
      }
    });

  } catch (error) {
    console.error('❌ CV extraction history retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
