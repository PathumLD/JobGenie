import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface CertificateUpdateData {
  name?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface CertificateResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    name: string | null;
    issuing_authority: string | null;
    issue_date: Date | null;
    expiry_date: Date | null;
    credential_id: string | null;
    credential_url: string | null;
    description: string | null;
    skill_ids: string[];
    media_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface CertificateErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CertificateResponse | CertificateErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as CertificateErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as CertificateErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const certificate = await prisma.certificate.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Certificate not found'
        } as CertificateErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate retrieved successfully',
      data: certificate
    });

  } catch (error) {
    console.error('Error fetching certificate:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch certificate'
      } as CertificateErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update certificate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CertificateResponse | CertificateErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as CertificateErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as CertificateErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: CertificateUpdateData = await request.json();

    // Check if certificate exists and belongs to user
    const existingCertificate = await prisma.certificate.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingCertificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Certificate not found'
        } as CertificateErrorResponse,
        { status: 404 }
      );
    }

    // Validate dates if provided
    let issueDate: Date | undefined;
    if (body.issue_date) {
      issueDate = new Date(body.issue_date);
      if (isNaN(issueDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid issue date format'
          } as CertificateErrorResponse,
          { status: 400 }
        );
      }
    }

    let expiryDate: Date | null | undefined;
    if (body.expiry_date !== undefined) {
      if (body.expiry_date === null) {
        expiryDate = null;
      } else {
        expiryDate = new Date(body.expiry_date);
        if (isNaN(expiryDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: 'VALIDATION_ERROR',
              message: 'Invalid expiry date format'
            } as CertificateErrorResponse,
            { status: 400 }
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.issuing_authority !== undefined) updateData.issuing_authority = body.issuing_authority;
    if (issueDate !== undefined) updateData.issue_date = issueDate;
    if (expiryDate !== undefined) updateData.expiry_date = expiryDate;
    if (body.credential_id !== undefined) updateData.credential_id = body.credential_id;
    if (body.credential_url !== undefined) updateData.credential_url = body.credential_url;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.skill_ids !== undefined) updateData.skill_ids = body.skill_ids;
    if (body.media_url !== undefined) updateData.media_url = body.media_url;

    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate updated successfully',
      data: updatedCertificate
    });

  } catch (error) {
    console.error('Error updating certificate:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update certificate'
      } as CertificateErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | CertificateErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as CertificateErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as CertificateErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Check if certificate exists and belongs to user
    const existingCertificate = await prisma.certificate.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingCertificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Certificate not found'
        } as CertificateErrorResponse,
        { status: 404 }
      );
    }

    await prisma.certificate.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting certificate:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete certificate'
      } as CertificateErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
