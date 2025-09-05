'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CandidateLoginForm } from '@/components/candidate/CandidateLoginForm';
import { AdvertisementSection } from '@/components/candidate/AdvertisementSection';
import { OAuthSessionHandler } from '@/components/candidate';
import { Header } from '@/components/public/header';

function CandidateLoginContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a notification parameter in the URL
    const notificationId = searchParams.get('notification');
    console.log('Login page - notification parameter from URL:', notificationId);
    if (notificationId) {
      // Store the notification ID in localStorage for use after login
      localStorage.setItem('pendingInterviewNotification', notificationId);
      console.log('Stored notification ID in localStorage:', notificationId);
    }
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <OAuthSessionHandler />
      <Header showSkipLink={true} />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Advertisement Section - 2 columns */}
            <div className="lg:col-span-2">
              <AdvertisementSection />
            </div>
            
            {/* Login Form - 1 column */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <CandidateLoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading login page...</p>
        </div>
      </div>
    }>
      <CandidateLoginContent />
    </Suspense>
  );
}
