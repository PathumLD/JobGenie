import { MisLoginForm } from '@/components/mis/MisLoginForm';
import { Header } from '@/components/public/header';

export default function MisLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header showSkipLink={true} />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <MisLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
