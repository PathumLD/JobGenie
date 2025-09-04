import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Industry {
  unit: number;
  description: string;
  major: number;
  major_label: string;
  sub_major: number;
  sub_major_label: string;
}

interface IndustriesResponse {
  success: boolean;
  data: Industry[];
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

export async function GET(): Promise<NextResponse<IndustriesResponse | ApiErrorResponse>> {
  try {
    const industries = await prisma.iSCO08.findMany({
      select: {
        unit: true,
        description: true,
        major: true,
        major_label: true,
        sub_major: true,
        sub_major_label: true
      },
      orderBy: [
        { major: 'asc' },
        { sub_major: 'asc' },
        { unit: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: industries,
      message: 'Industries retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch industries'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
