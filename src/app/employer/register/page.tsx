'use client';

import { EmployerRegistrationForm, EmployerAdvertisementSection } from '@/components/employer';
import { Header } from '@/components/public/header';

export default function EmployerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <Header showSkipLink={true} />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Advertisement Section - 2 columns */}
            <div className="lg:col-span-2">
              <EmployerAdvertisementSection />
            </div>
            
            {/* Registration Form - 1 column */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-emerald-900 mb-2">
                    Employer Registration
                  </h1>
                  <p className="text-emerald-700">
                    Create your company profile and start posting jobs
                  </p>
                </div>
                <EmployerRegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
