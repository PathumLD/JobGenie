'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/lib/auth-storage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CandidateAuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function CandidateAuthGuard({ 
  children, 
  redirectTo = '/candidate/login' 
}: CandidateAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a valid access token
        const hasToken = tokenStorage.isAuthenticated() && tokenStorage.isTokenValid();
        
        if (!hasToken) {
          console.log('❌ No valid access token found, redirecting to login');
          setIsAuthenticated(false);
          router.push(redirectTo);
          return;
        }

        // Verify the token is valid by making a test API call
        try {
          const response = await fetch('/api/auth/verify-session', {
            headers: {
              'Authorization': `Bearer ${tokenStorage.getAccessToken()}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // Check if the user is a candidate
            if (data.user && data.user.role === 'candidate') {
              console.log('✅ Candidate authenticated successfully');
              setIsAuthenticated(true);
            } else {
              console.log('❌ User is not a candidate, redirecting to login');
              setIsAuthenticated(false);
              tokenStorage.clearAccessToken();
              router.push(redirectTo);
            }
          } else if (response.status === 401) {
            console.log('❌ Token expired or invalid, redirecting to login');
            setIsAuthenticated(false);
            tokenStorage.clearAccessToken();
            router.push(redirectTo);
          } else {
            console.log('❌ Authentication check failed, redirecting to login');
            setIsAuthenticated(false);
            router.push(redirectTo);
          }
        } catch (error) {
          console.error('❌ Error checking authentication:', error);
          setIsAuthenticated(false);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('❌ Authentication check error:', error);
        setIsAuthenticated(false);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}
