'use client';

import { useState, useEffect } from 'react';
import { tokenStorage, initializeAuthFromUrl } from '@/lib/auth-storage';

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  user_type: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      // First, try to initialize from URL parameters (OAuth callback)
      const initializedFromUrl = initializeAuthFromUrl();
      
      if (initializedFromUrl) {
        console.log('Authentication initialized from URL parameters');
      }

      // Check if user is authenticated
      const authenticated = tokenStorage.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // TODO: Optionally fetch user profile from API
        // For now, we'll set a basic user object
        setUser({
          id: 'current-user',
          first_name: 'User',
          last_name: '',
          email: 'user@example.com',
          role: 'candidate',
          user_type: 'candidate'
        });
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (accessToken: string, userData?: User) => {
    tokenStorage.setAccessToken(accessToken);
    setIsAuthenticated(true);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    tokenStorage.clearAccessToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  };
};