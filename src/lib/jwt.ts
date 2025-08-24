import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '1d'; // 1 day
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Generate access token
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

// Generate refresh token
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
};

// Set JWT cookies in response
export const setJWTCookies = <T>(
  response: NextResponse<T>,
  accessToken: string,
  refreshToken: string
): NextResponse<T> => {
  // Set access token cookie (short-lived, httpOnly, secure in production)
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24*60*60, // 1 day in seconds
    path: '/'
  });

  // Set refresh token cookie (long-lived, httpOnly, secure in production)
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/'
  });

  return response;
};

// Clear JWT cookies
export const clearJWTCookies = (response: NextResponse): NextResponse => {
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
};

// Get JWT token from request cookies
export const getTokenFromCookies = (request: NextRequest): string | null => {
  return request.cookies.get('access_token')?.value || null;
};

// Get refresh token from request cookies
export const getRefreshTokenFromCookies = (request: NextRequest): string | null => {
  return request.cookies.get('refresh_token')?.value || null;
};

// Check if user has required role
export const hasRequiredRole = (
  userRole: string,
  requiredRoles: string[]
): boolean => {
  return requiredRoles.includes(userRole);
};

// Role-based access control middleware helper
export const validateRole = (
  userRole: string,
  allowedRoles: string[]
): boolean => {
  return allowedRoles.includes(userRole);
};

// Extract user data from request headers (set by middleware)
export const extractUserDataFromHeaders = (headers: Headers) => {
  return {
    userId: headers.get('x-user-id'),
    email: headers.get('x-user-email'),
    firstName: headers.get('x-user-first-name'),
    lastName: headers.get('x-user-last-name'),
    membershipNo: headers.get('x-user-membership-no'),
    role: headers.get('x-user-role'),
    userType: headers.get('x-user-type')
  };
};

// Get user data from JWT token (for direct token verification)
export const getUserDataFromToken = (token: string) => {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  return {
    userId: decoded.userId,
    email: decoded.email,
    firstName: decoded.first_name,
    lastName: decoded.last_name,
    membershipNo: decoded.membership_no,
    role: decoded.role,
    userType: decoded.userType
  };
};
