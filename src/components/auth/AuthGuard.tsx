'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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

        // For candidate routes, check profile approval status
        if (pathname.startsWith('/candidate') && 
            !pathname.includes('/login') && 
            !pathname.includes('/register') && 
            !pathname.includes('/complete-profile')) {
          
          try {
            const response = await fetch('/api/candidate/profile/profile-approval-check', {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                // If profile is incomplete, redirect to complete profile page
                if (!data.isProfileComplete) {
                  router.push('/candidate/complete-profile');
                  return;
                }
                
                // If profile is complete but not approved, allow access to the platform
                // They can browse jobs and update profile, but cannot apply until approved
                if (data.isProfileComplete && data.approval_status === 'pending') {
                  console.log('Profile complete but pending MIS approval - allowing access to platform');
                  // Don't redirect, allow normal access
                }
              }
            }
          } catch (error) {
            console.error('Error checking profile approval status:', error);
            // Continue with normal auth check if profile check fails
          }
        }

        // TODO: Optionally verify token with server and check role
        // For now, we'll assume the token is valid if it exists
        setIsAuthorized(true);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        tokenStorage.clearAccessToken();
        router.push(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, pathname]);

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