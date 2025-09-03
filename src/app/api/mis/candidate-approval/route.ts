import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { 
  ApproveCandidateRequest, 
  CandidateApprovalResponse, 
  ApiErrorResponse 
} from '@/types/profile-approval';
import { sendProfileApprovalEmail, sendProfileRejectionEmail } from '@/lib/candidate-notifications';

const prisma = new PrismaClient();

// Validation schema for single candidate approval
const approveCandidateSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID format')
});

// Validation schema for bulk candidate approval
const bulkApproveCandidatesSchema = z.object({
  candidateIds: z.array(z.string().uuid('Invalid candidate ID format')).min(1, 'At least one candidate ID is required')
});

// Validation schema for query parameters
const querySchema = z.object({
  action: z.enum(['approve', 'reject', 'bulk-approve']).optional(),
  candidateId: z.string().uuid('Invalid candidate ID format').optional()
});

export async function POST(request: NextRequest): Promise<NextResponse<CandidateApprovalResponse | ApiErrorResponse>> {
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

    // Handle bulk approval
    if (action === 'bulk-approve') {
      const bulkValidation = bulkApproveCandidatesSchema.safeParse(body);
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

                  const { candidateIds } = bulkValidation.data;

            // Update all candidates in a transaction
            const updatedCandidates = await prisma.$transaction(async (tx) => {
              const results = [];
              
              for (const candidateId of candidateIds) {
                const candidate = await tx.candidate.update({
                  where: { user_id: candidateId },
                  data: { 
                    approval_status: 'approved',
                    updated_at: new Date()
                  },
                  include: {
                    user: {
                      select: {
                        first_name: true,
                        last_name: true,
                        email: true
                      }
                    }
                  }
                });

                                 // Also update user status to active if candidate is approved
                 await tx.user.update({
                   where: { id: candidateId },
                   data: { 
                     status: 'active',
                     updated_at: new Date()
                   }
                 });

                 // Send approval email notification
                 try {
                   await sendProfileApprovalEmail(
                     candidate.user.email,
                     candidate.first_name || undefined
                   );
                 } catch (emailError) {
                   console.error('Failed to send approval email:', emailError);
                   // Don't fail the transaction if email fails
                 }

                 results.push(candidate);
               }
               
               return results;
             });

            return NextResponse.json({
              message: `Successfully approved ${updatedCandidates.length} candidates`,
              candidate: {
                user_id: updatedCandidates[0].user_id,
                first_name: updatedCandidates[0].first_name,
                last_name: updatedCandidates[0].last_name,
                approval_status: updatedCandidates[0].approval_status,
                updated_at: updatedCandidates[0].updated_at
              }
            });
    }

    // Handle single candidate approval/rejection
    const validation = approveCandidateSchema.safeParse(body);
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

    const { candidateId } = validation.data;
    const isApproving = action === 'approve' || !action; // Default to approve if no action specified

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: candidateId },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            status: true,
            role: true
          }
        }
      }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verify the user is actually a candidate
    if (existingCandidate.user.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Invalid user type. Only candidates can be approved.' },
        { status: 400 }
      );
    }

                // Update candidate approval status
            const updatedCandidate = await prisma.candidate.update({
              where: { user_id: candidateId },
              data: { 
                approval_status: isApproving ? 'approved' : 'rejected',
                updated_at: new Date()
              },
              include: {
                user: {
                  select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                    status: true
                  }
                }
              }
            });

    // Update user status based on approval
    const newUserStatus = isApproving ? 'active' : 'pending_verification';
    await prisma.user.update({
      where: { id: candidateId },
      data: { 
        status: newUserStatus,
        updated_at: new Date()
      }
    });

    // Send email notification based on action
    try {
      if (isApproving) {
        await sendProfileApprovalEmail(
          updatedCandidate.user.email,
          updatedCandidate.first_name || undefined
        );
      } else {
        await sendProfileRejectionEmail(
          updatedCandidate.user.email,
          updatedCandidate.first_name || undefined
        );
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    const actionText = isApproving ? 'approved' : 'rejected';
    
                return NextResponse.json({
              message: `Candidate ${actionText} successfully`,
              candidate: {
                user_id: updatedCandidate.user_id,
                first_name: updatedCandidate.first_name,
                last_name: updatedCandidate.last_name,
                approval_status: updatedCandidate.approval_status,
                updated_at: updatedCandidate.updated_at
              }
            });

  } catch (error) {
    console.error('Candidate approval error:', error);

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

// GET endpoint to retrieve candidate approval status
export async function GET(request: NextRequest): Promise<NextResponse<CandidateApprovalResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Validate candidate ID format
    const validation = z.string().uuid('Invalid candidate ID format').safeParse(candidateId);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid candidate ID format' },
        { status: 400 }
      );
    }

    // Find candidate
    const candidate = await prisma.candidate.findUnique({
      where: { user_id: candidateId },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            status: true
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

                return NextResponse.json({
              message: 'Candidate status retrieved successfully',
              candidate: {
                user_id: candidate.user_id,
                first_name: candidate.first_name,
                last_name: candidate.last_name,
                approval_status: candidate.approval_status,
                updated_at: candidate.updated_at
              }
            });

  } catch (error) {
    console.error('Get candidate status error:', error);

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
