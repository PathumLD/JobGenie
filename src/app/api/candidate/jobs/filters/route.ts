import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Response types
interface JobFiltersResponse {
  message: string;
  filters: {
    // Experience levels
    experience_levels: Array<{
      value: string;
      label: string;
      count: number;
    }>;
    
    // Job types
    job_types: Array<{
      value: string;
      label: string;
      count: number;
    }>;
    
    // Remote types
    remote_types: Array<{
      value: string;
      label: string;
      count: number;
    }>;
    
    // Industries
    industries: Array<{
      value: string;
      label: string;
      count: number;
    }>;
    
    // Company sizes
    company_sizes: Array<{
      value: string;
      label: string;
      count: number;
    }>;
    
    // Salary ranges
    salary_ranges: Array<{
      min: number;
      max: number;
      currency: string;
      count: number;
    }>;
    
    // Popular skills
    popular_skills: Array<{
      id: string;
      name: string;
      category: string | null;
      count: number;
    }>;
    
    // Popular locations
    popular_locations: Array<{
      value: string;
      count: number;
    }>;
    
    // Job designations
    job_designations: Array<{
      id: number;
      name: string;
      count: number;
    }>;
  };
  
  // Search suggestions
  search_suggestions: {
    popular_searches: string[];
    trending_keywords: string[];
    skill_suggestions: string[];
    company_suggestions: string[];
  };
}

export async function GET(): Promise<NextResponse<JobFiltersResponse | ApiErrorResponse>> {
  try {
    // Get all published jobs for counting
    const baseWhereClause: Prisma.JobWhereInput = { status: 'published' as const };

    // Fetch all filter data in parallel for better performance
    const [
      experienceLevels,
      jobTypes,
      remoteTypes,
      industries,
      companySizes,
      salaryRanges,
      popularSkills,
      popularLocations,
      jobDesignations
    ] = await Promise.all([
      // Experience levels with counts
      prisma.job.groupBy({
        by: ['experience_level'],
        where: baseWhereClause,
        _count: { experience_level: true },
        orderBy: { _count: { experience_level: 'desc' } }
      }),
      
      // Job types with counts
      prisma.job.groupBy({
        by: ['job_type'],
        where: baseWhereClause,
        _count: { job_type: true },
        orderBy: { _count: { job_type: 'desc' } }
      }),
      
      // Remote types with counts
      prisma.job.groupBy({
        by: ['remote_type'],
        where: baseWhereClause,
        _count: { remote_type: true },
        orderBy: { _count: { remote_type: 'desc' } }
      }),
      
      // Industries (from company table)
      prisma.company.findMany({
        where: { 
          industry: { not: undefined },
          jobs: { some: { status: 'published' } }
        },
        select: { industry: true },
        distinct: ['industry']
      }),
      
      // Company sizes
      prisma.company.findMany({
        where: { 
          company_size: { not: undefined },
          jobs: { some: { status: 'published' } }
        },
        select: { company_size: true },
        distinct: ['company_size']
      }),
      
      // Salary ranges
      prisma.job.findMany({
        where: {
          ...baseWhereClause,
          OR: [
            { salary_min: { not: null } },
            { salary_max: { not: null } }
          ]
        },
        select: {
          salary_min: true,
          salary_max: true,
          currency: true
        }
      }),
      
      // Popular skills
      prisma.jobSkill.groupBy({
        by: ['skill_id'],
        where: {
          job: baseWhereClause
        },
        _count: { skill_id: true },
        orderBy: { _count: { skill_id: 'desc' } },
        take: 20
      }),
      
      // Popular locations
      prisma.job.groupBy({
        by: ['location'],
        where: {
          ...baseWhereClause,
          location: { not: null }
        },
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 15
      }),
      
      // Job designations
      prisma.job.groupBy({
        by: ['jobDesignationId'],
        where: baseWhereClause,
        _count: { jobDesignationId: true },
        orderBy: { _count: { jobDesignationId: 'desc' } },
        take: 25
      })
    ]);

    // Get skill details for popular skills
    const skillIds = popularSkills.map(s => s.skill_id);
    const skillDetails = await prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true, category: true }
    });

    // Get job designation details
    const designationIds = jobDesignations.map(d => d.jobDesignationId);
    const designationDetails = await prisma.jobDesignation.findMany({
      where: { id: { in: designationIds } },
      select: { id: true, name: true }
    });

    // Transform experience levels
    const transformedExperienceLevels = experienceLevels.map(level => ({
      value: level.experience_level,
      label: level.experience_level.charAt(0).toUpperCase() + level.experience_level.slice(1),
      count: level._count?.experience_level || 0
    }));

    // Transform job types
    const transformedJobTypes = jobTypes.map(type => ({
      value: type.job_type,
      label: type.job_type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      count: type._count?.job_type || 0
    }));

    // Transform remote types
    const transformedRemoteTypes = remoteTypes.map(type => ({
      value: type.remote_type,
      label: type.remote_type.charAt(0).toUpperCase() + type.remote_type.slice(1),
      count: type._count?.remote_type || 0
    }));

    // Transform industries
    const industryCounts = industries.reduce((acc, job) => {
      const industry = job.industry;
      if (industry) {
        acc[industry] = (acc[industry] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const transformedIndustries = Object.entries(industryCounts)
      .map(([value, count]) => ({
        value,
        label: value,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Transform company sizes
    const companySizeCounts = companySizes.reduce((acc, job) => {
      const size = job.company_size;
      if (size) {
        acc[size] = (acc[size] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const transformedCompanySizes = Object.entries(companySizeCounts)
      .map(([value, count]) => ({
        value,
        label: value.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        count
      }))
      .sort((a, b) => b.count - a.count);

    // Transform salary ranges
    const salaryCounts = salaryRanges.reduce((acc, job) => {
      const key = `${job.currency || 'LKR'}_${job.salary_min || 0}_${job.salary_max || 0}`;
      if (!acc[key]) {
        acc[key] = {
          min: job.salary_min || 0,
          max: job.salary_max || 0,
          currency: job.currency || 'LKR',
          count: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { min: number; max: number; currency: string; count: number }>);

    const transformedSalaryRanges = Object.values(salaryCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Transform popular skills
    const transformedPopularSkills = popularSkills.map(skill => {
      const skillDetail = skillDetails.find(s => s.id === skill.skill_id);
      return {
        id: skill.skill_id,
        name: skillDetail?.name || 'Unknown Skill',
        category: skillDetail?.category || null,
        count: skill._count?.skill_id || 0
      };
    });

    // Transform popular locations
    const transformedPopularLocations = popularLocations
      .filter(location => location.location !== null)
      .map(location => ({
        value: location.location!,
        count: location._count?.location || 0
      }));

    // Transform job designations
    const transformedJobDesignations = jobDesignations.map(designation => {
      const designationDetail = designationDetails.find(d => d.id === designation.jobDesignationId);
      return {
        id: designation.jobDesignationId,
        name: designationDetail?.name || 'Unknown Designation',
        count: designation._count?.jobDesignationId || 0
      };
    });

    // Generate search suggestions
    const searchSuggestions = await generateSearchSuggestions();

    const response: JobFiltersResponse = {
      message: 'Job filters retrieved successfully',
      filters: {
        experience_levels: transformedExperienceLevels,
        job_types: transformedJobTypes,
        remote_types: transformedRemoteTypes,
        industries: transformedIndustries,
        company_sizes: transformedCompanySizes,
        salary_ranges: transformedSalaryRanges,
        popular_skills: transformedPopularSkills,
        popular_locations: transformedPopularLocations,
        job_designations: transformedJobDesignations
      },
      search_suggestions: searchSuggestions
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Job filters error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate search suggestions
async function generateSearchSuggestions() {
  try {
    // Get popular searches from recent job views
    const popularSearches = [
      'Software Engineer',
      'Data Scientist',
      'Product Manager',
      'UX Designer',
      'DevOps Engineer',
      'Full Stack Developer',
      'Machine Learning Engineer',
      'Project Manager',
      'Business Analyst',
      'Marketing Manager'
    ];

    // Get trending keywords from recent job postings
    const trendingKeywords = [
      'AI',
      'Remote Work',
      'Blockchain',
      'Cloud Computing',
      'Cybersecurity',
      'Data Analytics',
      'Mobile Development',
      'React',
      'Python',
      'JavaScript'
    ];

    // Get skill suggestions from popular skills
    const skillSuggestions = await prisma.skill.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
      take: 30,
      select: { name: true }
    });

    // Get company suggestions
    const companySuggestions = await prisma.company.findMany({
      where: { verification_status: 'verified' },
      orderBy: { name: 'asc' },
      take: 20,
      select: { name: true }
    });

    return {
      popular_searches: popularSearches,
      trending_keywords: trendingKeywords,
      skill_suggestions: skillSuggestions.map(s => s.name),
      company_suggestions: companySuggestions.map(c => c.name)
    };
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return {
      popular_searches: [],
      trending_keywords: [],
      skill_suggestions: [],
      company_suggestions: []
    };
  }
}
