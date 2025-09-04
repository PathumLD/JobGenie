import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JobDesignation {
  id: number;
  name: string;
  isco_08_unit: number;
  isco_08_major: number;
  isco_08_major_label: string;
}

interface JobDesignationsResponse {
  success: boolean;
  data: JobDesignation[];
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

export async function GET(): Promise<NextResponse<JobDesignationsResponse | ApiErrorResponse>> {
  try {
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

    const transformedDesignations: JobDesignation[] = designations.map(designation => ({
      id: designation.id,
      name: designation.name,
      isco_08_unit: designation.isco_08_unit,
      isco_08_major: designation.isco_08.major,
      isco_08_major_label: designation.isco_08.major_label
    }));

    return NextResponse.json({
      success: true,
      data: transformedDesignations,
      message: 'Job designations retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching job designations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job designations'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
