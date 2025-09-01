'use client';

// Token storage key
const ACCESS_TOKEN_KEY = 'access_token';

// Token storage utilities for localStorage
export const tokenStorage = {
  // Get access token from localStorage
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token from localStorage:', error);
      return null;
    }
  },

  // Set access token in localStorage
  setAccessToken: (accessToken: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      console.log('Access token stored in localStorage successfully');
    } catch (error) {
      console.error('Error storing access token in localStorage:', error);
    }
  },

  // Clear access token from localStorage
  clearAccessToken: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      console.log('Access token cleared from localStorage');
    } catch (error) {
      console.error('Error clearing access token from localStorage:', error);
    }
  },

  // Check if user is authenticated (has valid access token)
  isAuthenticated: (): boolean => {
    const accessToken = tokenStorage.getAccessToken();
    return !!accessToken;
  },

  // Check if token exists and is not expired (basic check)
  isTokenValid: (): boolean => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) return false;
    
    try {
      // Basic JWT structure check (not full verification)
      const parts = accessToken.split('.');
      if (parts.length !== 3) return false;
      
      // Check if token is not too short
      if (accessToken.length < 50) return false;
      
      return true;
    } catch {
      return false;
    }
  }
};

// HTTP client with automatic token injection
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = tokenStorage.getAccessToken();
  
  console.log('🔐 authenticatedFetch called for:', url);
  console.log('🔑 Access token available:', !!accessToken);
  if (accessToken) {
    console.log('🔑 Token length:', accessToken.length);
    console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');
  }
  
  // Check if we have a valid token
  if (!accessToken || !tokenStorage.isTokenValid()) {
    console.log('❌ No valid access token found');
    console.log('🔍 Checking localStorage directly...');
    
    // Try to get token directly from localStorage
    const directToken = localStorage.getItem('access_token');
    if (directToken && directToken.length > 50) {
      console.log('✅ Found valid token directly in localStorage, updating storage...');
      tokenStorage.setAccessToken(directToken);
      // Update our local variable
      const updatedToken = tokenStorage.getAccessToken();
      if (updatedToken && tokenStorage.isTokenValid()) {
        console.log('✅ Token updated and validated successfully');
        accessToken = updatedToken;
      } else {
        console.log('❌ Token found but invalid format');
        localStorage.removeItem('access_token');
        window.location.href = '/candidate/login';
        throw new Error('Invalid token format');
      }
    } else {
      console.log('❌ No valid token found in localStorage, redirecting to login...');
      // Clear any invalid tokens
      localStorage.removeItem('access_token');
      window.location.href = '/candidate/login';
      throw new Error('No valid access token available');
    }
  }
  
  const headers = new Headers(options.headers);
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
    console.log('📤 Authorization header set');
  } else {
    console.log('⚠️ No access token available after all checks');
    window.location.href = '/candidate/login';
    throw new Error('No access token available');
  }

  console.log('📤 Making request with headers:', Object.fromEntries(headers.entries()));
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  console.log('📥 Response status:', response.status);
  console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

  // If token is expired (401), check if we should redirect
  if (response.status === 401) {
    console.log('❌ Access token expired or invalid');
    
    // Get the response body to see the exact error
    const errorText = await response.clone().text();
    console.log('❌ Response body:', errorText);
    
    // Check if we still have a token in localStorage
    const currentToken = localStorage.getItem('access_token');
    if (currentToken) {
      console.log('🔍 Token still exists in localStorage, but API rejected it');
      console.log('🔍 This might be a server-side issue or token format problem');
      
      // Don't redirect immediately, let the calling code handle the error
      console.log('⚠️ Returning 401 response without redirecting - let calling code handle');
    } else {
      console.log('❌ No token in localStorage, redirecting to login...');
      tokenStorage.clearAccessToken();
      window.location.href = '/candidate/login';
    }
    
    return response;
  }

  console.log('✅ Request successful');
  return response;
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error calling logout API:', error);
  } finally {
    // Always clear local token regardless of API call result
    tokenStorage.clearAccessToken();
    // Clear all localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log('Logout complete - all storage cleared');
  }
};

// Extract token from URL parameters (for OAuth callback)
export const extractTokenFromUrl = (): { accessToken: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const oauthSuccess = urlParams.get('oauth_success');
  const tempToken = urlParams.get('temp_token');
  
  if (oauthSuccess === 'true' && tempToken) {
    return { accessToken: tempToken };
  }
  
  return null;
};

// Initialize auth from URL parameters (for OAuth callback)
export const initializeAuthFromUrl = (): boolean => {
  const token = extractTokenFromUrl();
  
  if (token) {
    tokenStorage.setAccessToken(token.accessToken);
    
    // Clean up URL by removing OAuth parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('oauth_success');
    url.searchParams.delete('temp_token');
    window.history.replaceState({}, document.title, url.toString());
    
    console.log('Authentication initialized from URL parameters');
    return true;
  }
  
  return false;
};

// Debug function to check current auth status
export const debugAuthStatus = (): void => {
  console.log('🔍 === AUTH DEBUG STATUS ===');
  console.log('🔑 Token in storage:', !!tokenStorage.getAccessToken());
  console.log('🔑 Token in localStorage:', !!localStorage.getItem('access_token'));
  console.log('✅ Is authenticated:', tokenStorage.isAuthenticated());
  console.log('✅ Is token valid:', tokenStorage.isTokenValid());
  
  const token = tokenStorage.getAccessToken();
  if (token) {
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    console.log('🔑 Token parts:', token.split('.').length);
  }
  
  console.log('🔍 === END AUTH DEBUG ===');
};

// Function to manually refresh token from localStorage
export const refreshTokenFromStorage = (): boolean => {
  console.log('🔄 Attempting to refresh token from localStorage...');
  
  const directToken = localStorage.getItem('access_token');
  if (directToken && directToken.length > 50) {
    console.log('✅ Found valid token in localStorage');
    tokenStorage.setAccessToken(directToken);
    
    if (tokenStorage.isTokenValid()) {
      console.log('✅ Token refreshed successfully');
      return true;
    } else {
      console.log('❌ Token found but invalid format');
      localStorage.removeItem('access_token');
      return false;
    }
  } else {
    console.log('❌ No valid token found in localStorage');
    return false;
  }
};