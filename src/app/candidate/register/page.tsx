'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CandidateRegistrationForm, AdvertisementSection } from '@/components/candidate';
import { Header } from '@/components/public/header';

export default function CandidateRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header showSkipLink={true} />

      {/* Add top padding to account for fixed header */}
      <div className="pt-20">
        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
}
