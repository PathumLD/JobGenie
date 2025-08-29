import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/api/candidate/dashboard': ['candidate'],
  '/api/candidate/list': ['mis', 'recruitment_agency'],
  '/api/employer': ['employer'],
  '/api/admin': ['mis', 'recruitment_agency'],
  '/api/auth/profile': ['candidate', 'employer', 'mis', 'recruitment_agency'],
  '/api/auth/logout': ['candidate', 'employer', 'mis', 'recruitment_agency']
};

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/send-verification',
  '/api/auth/verify-email',
  '/api/auth/refresh-token',
  '/auth/callback',
  '/auth/auth-code-error'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (!protectedRoute) {
    // If not a protected route, allow access
    return NextResponse.next();
  }

  // Get the access token from cookies
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    );
  }

  // Verify the JWT token
  const decoded = verifyToken(accessToken);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Invalid or expired access token' },
      { status: 401 }
    );
  }

  // Check if user has the required role for this route
  const allowedRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions for this resource' },
      { status: 403 }
    );
  }

  // Add user information to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decoded.userId);
  requestHeaders.set('x-user-email', decoded.email);
  requestHeaders.set('x-user-first-name', decoded.first_name || '');
  requestHeaders.set('x-user-last-name', decoded.last_name || '');
  requestHeaders.set('x-user-membership-no', decoded.membership_no?.toString() || '');
  requestHeaders.set('x-user-role', decoded.role);
  requestHeaders.set('x-user-type', decoded.userType);

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
