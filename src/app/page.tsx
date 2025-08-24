'use client';

import { Header } from '@/components/public/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserType } from '@/types/user';

export default function Home() {
  const handleUserTypeSelection = (userType: UserType) => {
    // This will be implemented later when we add routing
    console.log(`Selected user type: ${userType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          {/* Main Heading */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-900 mb-4 sm:mb-6 leading-tight">
              Your AI-Powered
              <span className="block text-emerald-600 mt-2">Career Partner</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-emerald-700 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
              Whether you&apos;re seeking your next career move or looking for the perfect candidate, 
              Job Genie uses advanced AI to match talent with opportunity.
            </p>
          </div>

          {/* User Type Selection */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-4">
              {/* Candidate Section */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-emerald-200 hover:border-emerald-400 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-4 px-4 sm:px-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-900 leading-tight">
                    Are you on the hunt for your next big career move?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-emerald-700 mb-4 sm:mb-6 leading-relaxed">
                    Let our AI-powered platform help you discover opportunities that match your skills, 
                    experience, and career goals. Get personalized job recommendations and insights.
                  </p>
                  <Button 
                    onClick={() => handleUserTypeSelection('candidate')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Let&apos;s Get Started
                  </Button>
                </CardContent>
              </Card>

              {/* Divider - Hidden on mobile, visible on larger screens */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="w-0.5 h-32 bg-emerald-300"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-full text-sm">
                    OR
                  </div>
                </div>
              </div>

              {/* Mobile Divider */}
              <div className="lg:hidden flex items-center justify-center py-4">
                <div className="relative">
                  <div className="w-32 h-0.5 bg-emerald-300"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-xs">
                    OR
                  </div>
                </div>
              </div>

              {/* Employer Section */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-emerald-200 hover:border-emerald-400 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-4 px-4 sm:px-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-900 leading-tight">
                    Are you looking for the perfect fit for your open role?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-emerald-700 mb-4 sm:mb-6 leading-relaxed">
                    Find exceptional candidates with our intelligent matching system. 
                    Post jobs, screen applicants, and build your dream team with AI assistance.
                  </p>
                  <Button 
                    onClick={() => handleUserTypeSelection('employer')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Let&apos;s Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 sm:mt-20 lg:mt-24 text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-8 sm:mb-12">Why Choose Job Genie?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 mb-2">AI-Powered Matching</h3>
                <p className="text-sm sm:text-base text-emerald-700">Advanced algorithms that understand skills, experience, and cultural fit.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 mb-2">Lightning Fast</h3>
                <p className="text-sm sm:text-base text-emerald-700">Get matches in seconds, not days. Streamlined application process.</p>
              </div>
              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 mb-2">Secure & Private</h3>
                <p className="text-sm sm:text-base text-emerald-700">Your data is protected with enterprise-grade security measures.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold">Job Genie</span>
          </div>
          <p className="text-sm sm:text-base text-emerald-200 mb-4 sm:mb-6 max-w-md mx-auto">
            Connecting talent with opportunity through intelligent AI matching
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-emerald-300 text-sm sm:text-base">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-emerald-800">
            <p className="text-xs sm:text-sm text-emerald-400">
              © 2024 Job Genie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}