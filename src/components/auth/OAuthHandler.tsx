'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeAuthFromUrl } from '@/lib/auth-storage';

export function OAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      // Try to initialize authentication from URL parameters
      const initialized = initializeAuthFromUrl();
      
      if (initialized) {
        console.log('OAuth authentication successful - checking profile completion...');
        
        try {
          // Get the access token from storage
          const token = localStorage.getItem('access_token');
          if (token) {
            // Check profile completion before redirecting
            const profileCheckResponse = await fetch('/api/candidate/profile/profile-completion-check', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (profileCheckResponse.ok) {
              const profileData = await profileCheckResponse.json();
              if (profileData.success && profileData.isProfileComplete) {
                // Profile is complete, redirect to jobs page
                console.log('✅ Profile complete, redirecting to jobs page...');
                router.push('/candidate/jobs');
              } else {
                // Profile incomplete, redirect to complete profile page
                console.log('⚠️ Profile incomplete, redirecting to complete profile page...');
                router.push('/candidate/complete-profile');
              }
            } else {
              // If profile check fails, redirect to complete profile page as fallback
              console.warn('⚠️ Profile check failed, redirecting to complete profile page...');
              router.push('/candidate/complete-profile');
            }
          } else {
            // No token found, redirect to complete profile page as fallback
            console.warn('⚠️ No access token found, redirecting to complete profile page...');
            router.push('/candidate/complete-profile');
          }
        } catch (profileError) {
          console.error('Profile completion check error:', profileError);
          // If profile check fails, redirect to complete profile page as fallback
          router.push('/candidate/complete-profile');
        }
      }
    };

    checkAuthAndProfile();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}