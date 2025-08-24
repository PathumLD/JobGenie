import { NextResponse } from 'next/server';
import type { LogoutResponse } from '@/types/api';
import { clearJWTCookies } from '@/lib/jwt';

export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    // Create response
    const response = NextResponse.json(
      {
        message: 'Logged out successfully',
        logged_out: true
      },
      { status: 200 }
    );

    // Clear JWT cookies
    const responseWithClearedCookies = clearJWTCookies(response);
    return responseWithClearedCookies as NextResponse<LogoutResponse>;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, try to clear cookies
    const errorResponse = NextResponse.json(
      {
        message: 'Logged out successfully',
        logged_out: true
      },
      { status: 200 }
    );

    return clearJWTCookies(errorResponse) as NextResponse<LogoutResponse>;
  }
}
