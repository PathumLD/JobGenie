import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

interface FilterOptionsResponse {
  success: boolean;
  data: {
    fields: Array<{
      unit: number;
      description: string;
      major: number;
      major_label: string;
      sub_major: number;
      sub_major_label: string;
    }>;
    designations: Array<{
      id: number;
      name: string;
      isco_08_unit: number;
      isco_08_major: number;
      isco_08_major_label: string;
    }>;
    qualifications: Array<{
      value: string;
      label: string;
    }>;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<FilterOptionsResponse | ApiErrorResponse>> {
  try {
    // Verify JWT token
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication token required'
        } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid authentication token'
        } as ApiErrorResponse,
        { status: 401 }
      );
    }

    // Check if user is an employer
    if (decodedToken.role !== 'employer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Only employers can access this endpoint.'
        } as ApiErrorResponse,
        { status: 403 }
      );
    }
    // Fetch ISCO_08 units (individual job classifications)
    const iscoUnits = await prisma.iSCO08.findMany({
      select: {
        unit: true,
        description: true,
        major: true,
        major_label: true,
        sub_major: true,
        sub_major_label: true,
      },
      orderBy: [
        { unit: 'asc' }
      ]
    });

    // Create a simple list of units for the dropdown
    const fields = iscoUnits.map(item => ({
      unit: item.unit,
      description: item.description,
      major: item.major,
      major_label: item.major_label,
      sub_major: item.sub_major,
      sub_major_label: item.sub_major_label
    }));

    // Fetch job designations with ISCO_08 information
    const designations = await prisma.jobDesignation.findMany({
      select: {
        id: true,
        name: true,
        isco_08_unit: true,
        isco_08: {
          select: {
            major: true,
            major_label: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedDesignations = designations.map(designation => ({
      id: designation.id,
      name: designation.name,
      isco_08_unit: designation.isco_08_unit,
      isco_08_major: designation.isco_08.major,
      isco_08_major_label: designation.isco_08.major_label
    }));

    // Standard qualification options
    const standardQualifications = [
      { value: 'high_school', label: 'High School' },
      { value: 'associate_degree', label: 'Associate Degree' },
      { value: 'bachelors_degree', label: 'Bachelor\'s Degree' },
      { value: 'masters_degree', label: 'Master\'s Degree' },
      { value: 'doctorate_phd', label: 'Doctorate (PhD)' },
      { value: 'undergraduate', label: 'Undergraduate' },
      { value: 'post_graduate', label: 'Post Graduate' },
      { value: 'diploma', label: 'Diploma' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'professional_certification', label: 'Professional Certification' },
      { value: 'vocational_training', label: 'Vocational Training' },
      { value: 'some_college', label: 'Some College' },
      { value: 'no_formal_education', label: 'No Formal Education' }
    ];

    // Get unique qualifications from education data
    const qualifications = await prisma.education.findMany({
      select: {
        degree_diploma: true,
        field_of_study: true
      },
      distinct: ['degree_diploma', 'field_of_study'],
      where: {
        OR: [
          { degree_diploma: { not: null } },
          { field_of_study: { not: null } }
        ]
      }
    });

    // Use standard qualifications as the base list
    const qualificationsList = standardQualifications;

    return NextResponse.json({
      success: true,
      data: {
        fields,
        designations: transformedDesignations,
        qualifications: qualificationsList
      }
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch filter options'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
