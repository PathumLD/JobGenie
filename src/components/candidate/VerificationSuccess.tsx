'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export function VerificationSuccess() {
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center">
          <CardHeader className="pb-4">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Email Verified Successfully!
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Your account has been activated and you&apos;re ready to start your career journey
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-700 text-sm">
                  🎉 Welcome to Job Genie! Your email has been verified and your account is now active.
                </p>
              </div>

              {/* Next Steps */}
              <div className="text-left bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>Complete your profile to get better job matches</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>Upload your resume for AI-powered analysis</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>Browse and apply to relevant job opportunities</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>Get personalized career recommendations</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium py-3 rounded-lg transition-all duration-200"
                >
                  Sign In to Your Account
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  You&apos;ll receive an email confirmation shortly
                </p>
                <p className="text-xs text-gray-500">
                  Need help?{' '}
                  <a href="/support" className="text-emerald-600 hover:text-emerald-700 underline">
                    Contact our support team
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
