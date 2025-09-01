'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { tokenStorage } from '@/lib/auth-storage';

export function OAuthSessionHandler() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have OAuth success parameters in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const oauthSuccess = urlParams.get('oauth_success');
        const tempToken = urlParams.get('temp_token');

        if (oauthSuccess === 'true' && tempToken) {
          console.log('🔍 OAuth success detected, processing token...');
          setIsProcessing(true);

          try {
            // Store the access token in localStorage
            tokenStorage.setAccessToken(tempToken);
            console.log('✅ OAuth access token stored in localStorage');
            
            // Clean up the URL by removing the OAuth parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            // Check profile completion before redirecting
            try {
              const profileCheckResponse = await fetch('/api/candidate/profile/profile-completion-check', {
                headers: {
                  'Authorization': `Bearer ${tempToken}`,
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
                  console.log('⚠️ Profile incomplete. Missing fields:', profileData.missingFields);
                  router.push('/candidate/complete-profile');
                }
              } else {
                // If profile check fails, redirect to complete profile page as fallback
                console.warn('⚠️ Profile check failed, redirecting to complete profile page...');
                router.push('/candidate/complete-profile');
              }
            } catch (profileError) {
              console.error('Profile completion check error:', profileError);
              // If profile check fails, redirect to complete profile page as fallback
              router.push('/candidate/complete-profile');
            }
          } catch (tokenError) {
            console.error('Token storage error:', tokenError);
            setError('Failed to store authentication token');
          }
        } else {
          // Check if we have a session in Supabase (from localStorage)
          const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

          if (session?.user) {
            console.log('✅ Valid session found, syncing with backend...');
            setIsProcessing(true);
            
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
              const data = await response.json();
              console.log('✅ Session sync successful, storing token in localStorage...');
              
              // Store the JWT token in localStorage
              if (data.access_token) {
                tokenStorage.setAccessToken(data.access_token);
                console.log('✅ OAuth access token stored in localStorage');
              } else {
                console.warn('⚠️ No access token received from sync-session API');
              }
              
              // Clean up the URL by removing the hash
              window.history.replaceState({}, document.title, window.location.pathname);
              
              // Check profile completion before redirecting
              try {
                const profileCheckResponse = await fetch('/api/candidate/profile/profile-completion-check', {
                  headers: {
                    'Authorization': `Bearer ${data.access_token}`,
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
                    console.log('⚠️ Profile incomplete. Missing fields:', profileData.missingFields);
                    router.push('/candidate/complete-profile');
                  }
                } else {
                  // If profile check fails, redirect to complete profile page as fallback
                  console.warn('⚠️ Profile check failed, redirecting to complete profile page...');
                  router.push('/candidate/complete-profile');
                }
              } catch (profileError) {
                console.error('Profile completion check error:', profileError);
                // If profile check fails, redirect to complete profile page as fallback
                router.push('/candidate/complete-profile');
              }
            } else {
              const errorData = await response.json();
              console.error('Session sync failed:', errorData);
              setError(`Failed to complete authentication: ${errorData.error || 'Unknown error'}`);
            }
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    // Run if we have OAuth success parameters in URL OR if we just completed OAuth
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthSuccess = urlParams.get('oauth_success');
      const tempToken = urlParams.get('temp_token');
      
      const hasOAuthSuccess = oauthSuccess === 'true' && tempToken;
      const justCompletedOAuth = window.location.href.includes('google') || 
                                document.referrer.includes('google') ||
                                sessionStorage.getItem('oauth-in-progress') === 'true';
      
      if (hasOAuthSuccess || justCompletedOAuth) {
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
            <div className="space-y-3">
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => {
                  setError(null);
                  // Go back to previous page if possible
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    // If no previous page, go to login
                    window.location.href = '/candidate/login';
                  }
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return null when not processing (normal page load)
  return null;
}
