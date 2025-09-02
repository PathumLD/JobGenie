import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { PendingCandidatesResponse } from '@/types/candidate-approval';

const prisma = new PrismaClient();

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '10')),
  search: z.string().optional(),
  gender: z.string().optional(),
  profileCompletion: z.string().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export async function GET(request: NextRequest): Promise<NextResponse<PendingCandidatesResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const validation = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          candidates: [],
          total: 0,
          message: 'Invalid query parameters'
        },
        { status: 400 }
      );
    }

    const { page, limit, search, gender, profileCompletion, approvalStatus, sortBy, sortOrder } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {
      approval_status: approvalStatus, // Filter by approval status (default: pending)
      user: {
        role: 'candidate' // Ensure it's a candidate user
      }
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { nic: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add gender filter
    if (gender && gender !== 'all') {
      whereClause.gender = gender;
    }

    // Add profile completion filter
    if (profileCompletion && profileCompletion !== 'all') {
      if (profileCompletion === 'complete') {
        whereClause.completedProfile = true;
      } else if (profileCompletion === 'incomplete') {
        whereClause.completedProfile = false;
      }
    }

    // Build order by clause
    const orderBy: Record<string, unknown> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.created_at = 'desc'; // Default sort by creation date
    }

    // Fetch candidates with pagination
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where: whereClause,
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          nic: true,
          phone1: true,
          phone2: true,
          address: true,
          gender: true,
          date_of_birth: true,
          created_at: true,
          updated_at: true,
          approval_status: true,
          profile_completion_percentage: true,
          completedProfile: true,
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.candidate.count({ where: whereClause })
    ]);

    // Transform the data to match our interface
    const transformedCandidates = candidates.map(candidate => ({
      user_id: candidate.user_id,
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.user.email,
      nic: candidate.nic,
      phone1: candidate.phone1,
      phone2: candidate.phone2,
      address: candidate.address,
      gender: candidate.gender,
      date_of_birth: candidate.date_of_birth,
      created_at: candidate.created_at,
      updated_at: candidate.updated_at,
      approval_status: candidate.approval_status,
      profile_completion_percentage: candidate.profile_completion_percentage,
      completedProfile: candidate.completedProfile
    }));

    return NextResponse.json({
      success: true,
      candidates: transformedCandidates,
      total,
      message: `Found ${total} candidates waiting for approval`
    });

  } catch (error) {
    console.error('Error fetching pending candidates:', error);

    return NextResponse.json(
      {
        success: false,
        candidates: [],
        total: 0,
        message: 'Failed to fetch pending candidates'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
