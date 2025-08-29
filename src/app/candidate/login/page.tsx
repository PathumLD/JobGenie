import { CandidateLoginForm } from '@/components/candidate/CandidateLoginForm';
import { AdvertisementSection } from '@/components/candidate/AdvertisementSection';
import { OAuthSessionHandler } from '@/components/candidate';

export default function CandidateLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <OAuthSessionHandler />
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Advertisement Section - 2 columns */}
          <div className="lg:col-span-2">
            <AdvertisementSection />
          </div>
          
          {/* Login Form - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CandidateLoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
