import { CandidateLoginForm } from '@/components/candidate/CandidateLoginForm';
import { AdvertisementSection } from '@/components/candidate/AdvertisementSection';
import { OAuthSessionHandler } from '@/components/candidate';
import { Header } from '@/components/public/header';

export default function CandidateLoginPage() {
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
