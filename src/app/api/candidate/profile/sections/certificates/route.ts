import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface CertificateData {
  id?: string;
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
  data?: Array<{
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
  }>;
}

interface CertificateErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all certificates for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<CertificateResponse | CertificateErrorResponse>> {
  try {
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

    const certificates = await prisma.certificate.findMany({
      where: { candidate_id: userId },
      orderBy: { issue_date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: certificates
    });

  } catch (error) {
    console.error('Error fetching certificates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch certificates'
      } as CertificateErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new certificate
export async function POST(
  request: NextRequest
): Promise<NextResponse<CertificateResponse | CertificateErrorResponse>> {
  try {
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
    const body: CertificateData = await request.json();

    // Validate required fields
    if (!body.name || !body.issuing_authority || !body.issue_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Certificate name, issuing authority, and issue date are required'
        } as CertificateErrorResponse,
        { status: 400 }
      );
    }

    // Validate dates
    const issueDate = new Date(body.issue_date);
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

    let expiryDate: Date | null = null;
    if (body.expiry_date) {
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

    const certificate = await prisma.certificate.create({
      data: {
        candidate_id: userId,
        name: body.name,
        issuing_authority: body.issuing_authority,
        issue_date: issueDate,
        expiry_date: expiryDate,
        credential_id: body.credential_id,
        credential_url: body.credential_url,
        description: body.description,
        skill_ids: body.skill_ids || [],
        media_url: body.media_url
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate created successfully',
      data: [certificate]
    });

  } catch (error) {
    console.error('Error creating certificate:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create certificate'
      } as CertificateErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
