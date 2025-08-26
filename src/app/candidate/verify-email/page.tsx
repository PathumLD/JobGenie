'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { VerificationSuccess, EmailVerificationForm } from '@/components/candidate';

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
    return <VerificationSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">JG</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Job Genie</h1>
            </div>
            <div className="text-sm text-gray-600">
              <a href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
            <EmailVerificationForm 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              userEmail={userEmail}
              onVerificationSuccess={handleVerificationSuccess}
            />
          </CardContent>
        </Card>
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
