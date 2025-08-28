import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const designations = await prisma.jobDesignation.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      message: 'Designations retrieved successfully',
      designations
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designations' },
      { status: 500 }
    );
  }
}
