'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function OAuthSessionHandler() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have OAuth tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Also check if we have a session in Supabase (from localStorage)
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

        if (accessToken || session) {
          console.log('🔍 OAuth session detected, processing...');
          setIsProcessing(true);

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(`Authentication failed: ${sessionError.message}`);
            return;
          }

          if (session?.user) {
            console.log('✅ Valid session found, syncing with backend...');
            
            // Sync the session with our backend
            const response = await fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                supabase_user_id: session.user.id,
                email: session.user.email,
                provider: 'google',
                user_metadata: session.user.user_metadata
              }),
            });

            if (response.ok) {
              console.log('✅ Session sync successful, redirecting to dashboard...');
              // Clean up the URL by removing the hash
              window.history.replaceState({}, document.title, window.location.pathname);
              // Redirect to jobs page
              router.push('/candidate/jobs');
            } else {
              const errorData = await response.json();
              console.error('Session sync failed:', errorData);
              setError(`Failed to complete authentication: ${errorData.error || 'Unknown error'}`);
            }
          } else {
            setError('No user session found after OAuth.');
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    // Run if we have tokens in URL hash OR if we just completed OAuth (check session)
    if (typeof window !== 'undefined') {
      const hasTokensInHash = window.location.hash.includes('access_token');
      const justCompletedOAuth = window.location.href.includes('google') || 
                                document.referrer.includes('google') ||
                                sessionStorage.getItem('oauth-in-progress') === 'true';
      
      if (hasTokensInHash || justCompletedOAuth) {
        // Clear the flag
        sessionStorage.removeItem('oauth-in-progress');
        handleOAuthCallback();
      }
    }
  }, [router]);

  // Show loading state while processing OAuth
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2">Completing Sign In</h2>
            <p className="text-gray-600">Please wait while we set up your account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Return null when not processing (normal page load)
  return null;
}
