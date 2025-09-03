'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { EmailVerificationForm } from '@/components/candidate';
import { Header } from '@/components/public/header';
import CandidateLoginPage from '../login/page';

function VerifyEmailContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if email is passed as query parameter (from registration success)
    const email = searchParams.get('email');
    if (email) {
      setUserEmail(email);
    }
  }, [searchParams]);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  if (isVerified) {
    return <CandidateLoginPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showSkipLink={true} />

      {/* Add top padding to account for fixed header */}
      <div className="pt-20">

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-xl border border-gray-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Enter Verification Code
            </CardTitle>
            <p className="text-gray-600 text-sm">
              We&apos;ve sent a 6-digit verification code to <strong>{userEmail}</strong>
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {userEmail ? (
              <EmailVerificationForm 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                userEmail={userEmail}
                onVerificationSuccess={handleVerificationSuccess}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-gray-600 mb-4">
                  No email address provided. Please return to the registration page.
                </p>
                <a 
                  href="/candidate/register" 
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Go to Registration
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

export default function CandidateVerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification page...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
