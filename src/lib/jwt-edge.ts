// JWT verification for Edge runtime (middleware) using Web Crypto API
// This is a simplified JWT verification that works in Edge runtime

// JWT payload interface for Edge runtime
export interface EdgeJWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  exp?: number;
  iat?: number;
}

// Extract token from Authorization header (Edge runtime compatible)
export const getTokenFromHeadersEdge = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

// Basic JWT validation for Edge runtime (without cryptographic verification)
export const validateTokenEdge = (token: string): EdgeJWTPayload | null => {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));

    // Check if token is expired
    if (decodedPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > decodedPayload.exp) {
        return null; // Token expired
      }
    }

    // Return the decoded payload
    return decodedPayload as EdgeJWTPayload;
  } catch (error) {
    return null;
  }
};

// Verify token for Edge runtime (basic validation only)
export const verifyTokenEdge = (token: string): EdgeJWTPayload | null => {
  if (!token || token.length < 50) {
    return null;
  }

  return validateTokenEdge(token);
};

// Get user data from token (Edge runtime compatible)
export const getUserDataFromTokenEdge = (token: string): EdgeJWTPayload | null => {
  const decoded = verifyTokenEdge(token);
  if (!decoded) return null;
  
  // Return clean payload without exp and iat
  const { exp, iat, ...userData } = decoded;
  return userData;
};
