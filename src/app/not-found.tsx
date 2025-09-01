'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    // Check if there's a previous page in browser history
    if (window.history.length > 1) {
      try {
        // Check if the previous page is not the same as current (to avoid infinite loops)
        const currentPath = window.location.pathname;
        const referrer = document.referrer;
        
        if (referrer && !referrer.includes(currentPath)) {
          router.back();
        } else {
          // If referrer is same page or invalid, go to home
          router.push('/');
        }
      } catch (error) {
        // If router.back() fails, try to go to home
        console.log('Failed to go back, redirecting to home');
        router.push('/');
      }
    } else {
      // If no previous page, go to home
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleGoBack}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          
          
        </div>
      </div>
    </div>
  );
}
