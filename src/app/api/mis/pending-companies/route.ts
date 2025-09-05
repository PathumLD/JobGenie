import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { PendingCompaniesResponse } from '@/types/company-verification';

const prisma = new PrismaClient();

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '10')),
  search: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  companyType: z.string().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export async function GET(request: NextRequest): Promise<NextResponse<PendingCompaniesResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const validation = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          companies: [],
          total: 0,
          message: 'Invalid query parameters'
        },
        { status: 400 }
      );
    }

    const { page, limit, search, industry, companySize, companyType, approvalStatus, sortBy, sortOrder } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {
      approval_status: approvalStatus // Filter by approval status (default: pending)
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { business_registration_no: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add industry filter
    if (industry && industry !== 'all') {
      whereClause.industry = industry;
    }

    // Add company size filter
    if (companySize && companySize !== 'all') {
      whereClause.company_size = companySize;
    }

    // Add company type filter
    if (companyType && companyType !== 'all') {
      whereClause.company_type = companyType;
    }

    // Build order by clause
    const orderBy: Record<string, unknown> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.created_at = 'desc'; // Default sort by creation date
    }

    // Fetch companies with pagination
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          industry: true,
          company_size: true,
          company_type: true,
          headquarters_location: true,
          founded_year: true,
          website: true,
          business_registration_no: true,
          business_registration_url: true,
          registered_address: true,
          description: true,
          created_at: true,
          updated_at: true,
          approval_status: true,
          verified_at: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.company.count({ where: whereClause })
    ]);

    // Transform the data to match our interface
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      contact: company.contact,
      industry: company.industry,
      company_size: company.company_size,
      company_type: company.company_type,
      headquarters_location: company.headquarters_location,
      founded_year: company.founded_year,
      website: company.website,
      business_registration_no: company.business_registration_no,
      business_registration_url: company.business_registration_url,
      registered_address: company.registered_address,
      description: company.description,
      created_at: company.created_at,
      updated_at: company.updated_at,
      approval_status: company.approval_status,
      verified_at: company.verified_at
    }));

    return NextResponse.json({
      success: true,
      companies: transformedCompanies,
      total,
      message: `Found ${total} companies waiting for verification`
    });

  } catch (error) {
    console.error('Error fetching pending companies:', error);

    return NextResponse.json(
      {
        success: false,
        companies: [],
        total: 0,
        message: 'Failed to fetch pending companies'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
