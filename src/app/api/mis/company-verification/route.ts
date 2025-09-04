import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { 
  CompanyApprovalResponse, 
  ApiErrorResponse 
} from '@/types/company-verification';

const prisma = new PrismaClient();

// Validation schema for single company verification
const verifyCompanySchema = z.object({
  companyId: z.string().uuid('Invalid company ID format')
});

// Validation schema for bulk company verification
const bulkVerifyCompaniesSchema = z.object({
  companyIds: z.array(z.string().uuid('Invalid company ID format')).min(1, 'At least one company ID is required')
});

// Validation schema for query parameters
const querySchema = z.object({
  action: z.enum(['approve', 'reject', 'bulk-approve']).optional(),
  companyId: z.string().uuid('Invalid company ID format').optional()
});

export async function POST(request: NextRequest): Promise<NextResponse<CompanyApprovalResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryValidation = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryValidation.error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path
          }))
        },
        { status: 400 }
      );
    }

    const { action } = queryValidation.data;

    // Handle bulk verification
    if (action === 'bulk-approve') {
      const bulkValidation = bulkVerifyCompaniesSchema.safeParse(body);
      if (!bulkValidation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: bulkValidation.error.issues.map(issue => ({
              code: issue.code,
              message: issue.message,
              path: issue.path
            }))
          },
          { status: 400 }
        );
      }

      const { companyIds } = bulkValidation.data;

      // Update all companies in a transaction
      const updatedCompanies = await prisma.$transaction(async (tx) => {
        const results = [];
        
        for (const companyId of companyIds) {
          const company = await tx.company.update({
            where: { id: companyId },
            data: { 
              approval_status: 'approved',
              verified_at: new Date(),
              updated_at: new Date()
            }
          });

          results.push(company);
        }
        
        return results;
      });

      return NextResponse.json({
        message: `Successfully approved ${updatedCompanies.length} companies`,
        company: {
          id: updatedCompanies[0].id,
          name: updatedCompanies[0].name,
          approval_status: updatedCompanies[0].approval_status,
          updated_at: updatedCompanies[0].updated_at
        }
      });
    }

    // Handle single company verification/rejection
    const validation = verifyCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path
          }))
        },
        { status: 400 }
      );
    }

    const { companyId } = validation.data;
    const isApproving = action === 'approve' || !action; // Default to approve if no action specified

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Update company approval status
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { 
        approval_status: isApproving ? 'approved' : 'rejected',
        verified_at: isApproving ? new Date() : null,
        updated_at: new Date()
      }
    });

    const actionText = isApproving ? 'approved' : 'rejected';
    
    return NextResponse.json({
      message: `Company ${actionText} successfully`,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        approval_status: updatedCompany.approval_status,
        updated_at: updatedCompany.updated_at
      }
    });

  } catch (error) {
    console.error('Company verification error:', error);

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

// GET endpoint to retrieve company verification status
export async function GET(request: NextRequest): Promise<NextResponse<CompanyApprovalResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Validate company ID format
    const validation = z.string().uuid('Invalid company ID format').safeParse(companyId);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid company ID format' },
        { status: 400 }
      );
    }

    // Find company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Company status retrieved successfully',
      company: {
        id: company.id,
        name: company.name,
        approval_status: company.approval_status,
        updated_at: company.updated_at
      }
    });

  } catch (error) {
    console.error('Get company status error:', error);

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
