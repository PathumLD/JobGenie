import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { RefreshTokenRequest, RefreshTokenResponse, ApiErrorResponse } from '@/types/api';
import { verifyToken, generateAccessToken, generateRefreshToken, setJWTCookies } from '@/lib/jwt';

// Validation schema for refresh token request
const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
});

export async function POST(request: NextRequest): Promise<NextResponse<RefreshTokenResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = refreshTokenSchema.safeParse(body);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map(issue => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.map(p => typeof p === 'string' ? p : String(p))
      }));
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    const { refresh_token } = validationResult.data;

    // Verify the refresh token
    const decoded = verifyToken(refresh_token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Generate new access and refresh tokens
    const newAccessToken = generateAccessToken(decoded);
    const newRefreshToken = generateRefreshToken(decoded);

    // Create response
    const response = NextResponse.json(
      {
        message: 'Token refreshed successfully',
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      },
      { status: 200 }
    );

    // Set new JWT cookies
    const responseWithCookies = setJWTCookies(response, newAccessToken, newRefreshToken);
    return responseWithCookies;

  } catch (error) {
    console.error('Refresh token error:', error);
    
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
  }
}
