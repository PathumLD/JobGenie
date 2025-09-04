import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch job fields (ISCO08 major categories)
    const jobFields = await prisma.iSCO08.findMany({
      select: {
        major: true,
        major_label: true,
      },
      distinct: ['major'],
      orderBy: {
        major: 'asc',
      },
    });

    // Fetch job designations
    const jobDesignations = await prisma.jobDesignation.findMany({
      select: {
        id: true,
        name: true,
        isco_08: {
          select: {
            major: true,
            major_label: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Group designations by job field
    const designationsByField = jobFields.map(field => ({
      major: field.major,
      major_label: field.major_label,
      designations: jobDesignations
        .filter(designation => designation.isco_08.major === field.major)
        .map(designation => ({
          id: designation.id,
          name: designation.name,
        })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        jobFields: designationsByField,
      },
    });
  } catch (error) {
    console.error('Error fetching job filters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job filters' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
