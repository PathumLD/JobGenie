import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { sendEmail, createCompanyApprovalEmail, createCompanyRejectionEmail } from '@/lib/email';
import type { 
  CompanyApprovalResponse, 
  ApiErrorResponse 
} from '@/types/company-verification';

const prisma = new PrismaClient();

// Helper function to send email notification to employer
const sendCompanyNotificationEmail = async (companyId: string, action: 'approve' | 'reject', reason?: string) => {
  let localPrisma: PrismaClient | null = null;
  
  try {
    // Create a new Prisma client instance for this operation
    localPrisma = new PrismaClient();
    
    // Get company and employer details
    const company = await localPrisma.company.findUnique({
      where: { id: companyId },
      include: {
        employers: {
          include: {
            user: true
          }
        }
      }
    });

    if (!company?.employers?.length) {
      console.error('❌ Company or employer not found for email notification');
      return false;
    }

    // Get the primary contact employer or the first employer
    const primaryEmployer = company.employers.find(emp => emp.is_primary_contact) || company.employers[0];
    const { user } = primaryEmployer;
    const companyName = company.name;
    const employerEmail = user.email;
    const employerFirstName = user.first_name;

    // Create appropriate email based on action
    let emailData;
    if (action === 'approve') {
      emailData = createCompanyApprovalEmail(employerEmail, companyName, employerFirstName || undefined);
    } else {
      emailData = createCompanyRejectionEmail(employerEmail, companyName, reason, employerFirstName || undefined);
    }

    // Send email
    const emailSent = await sendEmail(emailData);
    
    if (emailSent) {
      console.log(`✅ ${action === 'approve' ? 'Approval' : 'Rejection'} email sent to ${employerEmail} for company ${companyName}`);
    } else {
      console.error(`❌ Failed to send ${action} email to ${employerEmail} for company ${companyName}`);
    }

    return emailSent;
  } catch (error) {
    console.error('❌ Error sending company notification email:', error);
    return false;
  } finally {
    // Always disconnect the local Prisma client
    if (localPrisma) {
      await localPrisma.$disconnect();
    }
  }
};

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
  action: z.enum(['approve', 'reject', 'bulk-approve', 'bulk-reject']).optional(),
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
            code: String(issue.code),
            message: issue.message,
            path: issue.path.map(String)
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
              code: String(issue.code),
              message: issue.message,
              path: issue.path.map(String)
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
              approval_notification_dismissed: false, // Reset notification for new approvals
              updated_at: new Date()
            }
          });

          results.push(company);
        }
        
        return results;
      });

      // Send email notifications for all approved companies (don't wait for completion)
      companyIds.forEach(companyId => {
        sendCompanyNotificationEmail(companyId, 'approve')
          .catch(error => {
            console.error(`❌ Failed to send approval email for company ${companyId}:`, error);
          });
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

    // Handle bulk rejection
    if (action === 'bulk-reject') {
      const bulkValidation = bulkVerifyCompaniesSchema.safeParse(body);
      if (!bulkValidation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: bulkValidation.error.issues.map(issue => ({
              code: String(issue.code),
              message: issue.message,
              path: issue.path.map(String)
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
              approval_status: 'rejected',
              verified_at: null,
              approval_notification_dismissed: true, // Dismiss notification for rejections
              updated_at: new Date()
            }
          });

          results.push(company);
        }
        
        return results;
      });

      // Send email notifications for all rejected companies (don't wait for completion)
      companyIds.forEach(companyId => {
        sendCompanyNotificationEmail(companyId, 'reject')
          .catch(error => {
            console.error(`❌ Failed to send rejection email for company ${companyId}:`, error);
          });
      });

      return NextResponse.json({
        message: `Successfully rejected ${updatedCompanies.length} companies`,
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
            code: String(issue.code),
            message: issue.message,
            path: issue.path.map(String)
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
        approval_notification_dismissed: isApproving ? false : true, // Reset notification for new approvals
        updated_at: new Date()
      }
    });

    const actionText = isApproving ? 'approved' : 'rejected';
    
    // Send email notification to employer (don't wait for it to complete)
    sendCompanyNotificationEmail(companyId, isApproving ? 'approve' : 'reject')
      .catch(error => {
        console.error('❌ Failed to send email notification:', error);
        // Don't fail the main operation if email fails
      });
    
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
