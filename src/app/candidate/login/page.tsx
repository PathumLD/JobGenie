import { CandidateLoginForm } from '@/components/candidate/CandidateLoginForm';
import { AdvertisementSection } from '@/components/candidate/AdvertisementSection';

export default function CandidateLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
