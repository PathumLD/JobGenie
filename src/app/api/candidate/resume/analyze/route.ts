import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import {
  JWTPayload,
  ResumeAnalysisResult,
  ResumeAnalysisResponse,
  ErrorResponse
} from '@/types/resume-management';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Helper function to analyze resume content (placeholder for AI integration)
async function analyzeResumeContent(resumeUrl: string, fileName?: string): Promise<ResumeAnalysisResult> {
  // This is a placeholder function
  // In a real implementation, you would integrate with:
  // - OpenAI GPT-4 API to analyze resume content
  // - Custom ML models for skill extraction
  // - NLP services for experience analysis
  
  // For demonstration, return different analysis based on URL patterns
  const urlLower = resumeUrl.toLowerCase();
  const fileNameLower = fileName?.toLowerCase() || '';
  
  if (urlLower.includes('senior') || fileNameLower.includes('senior')) {
    return {
      skills_found: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 
        'Git', 'Docker', 'AWS', 'Kubernetes', 'Leadership', 'Architecture'
      ],
      experience_summary: '8+ years of senior-level software development experience with expertise in full-stack development, team leadership, and system architecture.',
      education_summary: 'Master\'s degree in Computer Science with advanced certifications in cloud technologies and software architecture.',
      overall_score: 92,
      recommendations: [
        'Excellent technical leadership skills and comprehensive technology stack',
        'Strong experience in modern development practices and cloud technologies',
        'Consider adding more recent AI/ML skills to stay ahead of industry trends',
        'Document specific business impact and metrics from leadership roles'
      ]
    };
  } else if (urlLower.includes('junior') || fileNameLower.includes('junior')) {
    return {
      skills_found: [
        'JavaScript', 'HTML', 'CSS', 'React', 'Git', 'SQL', 'Python', 'REST APIs'
      ],
      experience_summary: '2-3 years of junior-level development experience with focus on frontend technologies and basic backend development.',
      education_summary: 'Bachelor\'s degree in Computer Science or related field with relevant internship experience.',
      overall_score: 72,
      recommendations: [
        'Strong foundation in core web technologies',
        'Consider gaining experience with cloud platforms like AWS or Azure',
        'Add more backend technologies like Node.js or Python frameworks',
        'Include specific projects and achievements to demonstrate impact',
        'Consider obtaining industry certifications to validate skills'
      ]
    };
  } else {
    return {
      skills_found: [
        'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 
        'Git', 'Docker', 'AWS', 'TypeScript', 'MongoDB'
      ],
      experience_summary: '5+ years of full-stack development experience with focus on modern web technologies and cloud platforms.',
      education_summary: 'Bachelor\'s degree in Computer Science with relevant certifications in cloud technologies.',
      overall_score: 85,
      recommendations: [
        'Well-rounded technical skills across frontend and backend technologies',
        'Consider adding more DevOps skills like Kubernetes and CI/CD',
        'Include specific metrics and achievements in work experience',
        'Add more recent certifications to stay current with industry trends',
        'Consider adding soft skills like leadership and communication'
      ]
    };
  }
}

// Helper function to extract skills from resume text
async function extractSkillsFromText(text: string): Promise<string[]> {
  // This is a placeholder function
  // In a real implementation, you would use:
  // - Named Entity Recognition (NER) models
  // - Skill extraction APIs
  // - Custom skill dictionaries
  
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
    'Git', 'SVN', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban'
  ];
  
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

export async function POST(request: NextRequest): Promise<NextResponse<ResumeAnalysisResponse | ErrorResponse>> {
  try {
    console.log('🔄 Resume Analysis API called');

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
        { error: 'Access denied. Only candidates can analyze resumes.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { resume_id } = body;

    if (!resume_id || typeof resume_id !== 'string') {
      return NextResponse.json(
        { error: 'Resume ID is required and must be a string' },
        { status: 400 }
      );
    }

    // 3. Check if resume exists and belongs to the candidate
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: resume_id,
        candidate_id: payload.userId
      }
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found or access denied' },
        { status: 404 }
      );
    }

    if (!existingResume.resume_url) {
      return NextResponse.json(
        { error: 'Resume file not found' },
        { status: 404 }
      );
    }

    // 4. Analyze resume content
    let analysisResult: ResumeAnalysisResult;
    try {
      console.log('🔍 Analyzing resume content...');
      analysisResult = await analyzeResumeContent(
        existingResume.resume_url, 
        existingResume.original_filename || undefined
      );
      console.log('✅ Resume analysis completed');
    } catch (analysisError) {
      console.error('❌ Resume analysis failed:', analysisError);
      return NextResponse.json(
        { 
          error: 'Failed to analyze resume',
          details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 5. Return analysis results
    const response: ResumeAnalysisResponse = {
      success: true,
      message: 'Resume analysis completed successfully',
      data: {
        resume_id: resume_id,
        candidate_id: payload.userId,
        analysis: analysisResult,
        analyzed_at: new Date()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Resume analysis error:', error);
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
    console.log('🔄 Get Resume Analysis History API called');

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
        { error: 'Access denied. Only candidates can view resume analysis history.' },
        { status: 403 }
      );
    }

    // 2. For now, return a placeholder response since we don't have a resume analysis history table
    // In a real implementation, you would query a resume analysis history table
    return NextResponse.json({
      success: true,
      message: 'Resume analysis history retrieved successfully',
      data: {
        candidate_id: payload.userId,
        analyses: [],
        total_count: 0
      }
    });

  } catch (error) {
    console.error('❌ Resume analysis history retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
