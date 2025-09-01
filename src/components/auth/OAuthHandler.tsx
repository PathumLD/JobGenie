'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeAuthFromUrl } from '@/lib/auth-storage';

export function OAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    // Try to initialize authentication from URL parameters
    const initialized = initializeAuthFromUrl();
    
    if (initialized) {
      console.log('OAuth authentication successful - redirecting to dashboard');
      // Redirect to the main candidate page after successful OAuth
      router.push('/candidate/jobs');
    }
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