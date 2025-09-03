import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        },
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        status: true,
        email_verified: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_INACTIVE',
          message: 'User account is not active'
        },
        { status: 403 }
      );
    }

    // Return user information
    return NextResponse.json({
      success: true,
      message: 'Session verified successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify session'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
