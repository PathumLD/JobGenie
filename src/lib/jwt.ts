import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '24h'; // 24 hours

// JWT payload interface (for creating tokens)
export interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
}

// Decoded JWT interface (includes exp and iat from JWT library)
export interface DecodedJWTPayload extends JWTPayload {
  exp?: number;
  iat?: number;
}

// Generate access token
export const generateAccessToken = (payload: DecodedJWTPayload): string => {
  // Create a clean payload without exp and iat properties to avoid conflicts
  const { exp, iat, ...cleanPayload } = payload;
  return jwt.sign(cleanPayload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

// Verify JWT token
export const verifyToken = (token: string): DecodedJWTPayload | null => {
  try {
    console.log('🔍 Verifying token...');
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    console.log('🔑 JWT_SECRET available:', !!JWT_SECRET);
    
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedJWTPayload;
    console.log('✅ Token verified successfully');
    console.log('👤 Decoded payload:', { 
      userId: decoded.userId, 
      email: decoded.email, 
      role: decoded.role,
      exp: decoded.exp,
      iat: decoded.iat
    });
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return null;
  }
};

// Get user data from token
export const getUserDataFromToken = (token: string): JWTPayload | null => {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  // Return clean payload without exp and iat
  const { exp, iat, ...userData } = decoded;
  return userData;
};

// Extract token from Authorization header
export const getTokenFromHeaders = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  console.log('🔍 Extracting token from headers...');
  console.log('📤 Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid Authorization header found');
    return null;
  }
  
  const token = authHeader.substring(7);
  console.log('✅ Token extracted successfully');
  console.log('🔑 Token length:', token.length);
  console.log('🔑 Token preview:', token.substring(0, 20) + '...');
  
  return token;
};
