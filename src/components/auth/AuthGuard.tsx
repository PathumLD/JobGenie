'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/lib/auth-storage';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string[];
}

export function AuthGuard({ 
  children, 
  redirectTo = '/candidate/login',
  requiredRole = []
}: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has access token
        const accessToken = tokenStorage.getAccessToken();
        
        if (!accessToken) {
          console.log('No access token found, redirecting to login');
          router.push(redirectTo);
          return;
        }

        // TODO: Optionally verify token with server and check role
        // For now, we'll assume the token is valid if it exists
        setIsAuthorized(true);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        tokenStorage.clearTokens();
        router.push(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}