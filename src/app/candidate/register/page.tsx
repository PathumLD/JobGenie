'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CandidateRegistrationForm, AdvertisementSection } from '@/components/candidate';

export default function CandidateRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Advertisement Section - 2/3 width */}
          <div className="lg:col-span-2">
            <AdvertisementSection />
          </div>

          {/* Registration Form Section - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Join Job Genie
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Create your candidate profile and start your career journey
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <CandidateRegistrationForm 
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
