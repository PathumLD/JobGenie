'use client';

import { Card, CardContent } from '@/components/ui/card';

export function EmployerAdvertisementSection() {
  return (
    <div className="space-y-6">
      {/* Main Hero Section */}
      <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-xl">
        <CardContent className="p-8 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Find Top Talent for Your Company
            </h2>
            <p className="text-xl text-emerald-100 mb-6 max-w-2xl mx-auto">
              Connect with verified, skilled professionals and build your dream team with Job Genie's comprehensive recruitment platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified Candidates
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced Matching
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                24/7 Support
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Smart Candidate Matching
                </h3>
                <p className="text-gray-600 text-sm">
                  Our AI-powered system matches you with the most qualified candidates based on skills, experience, and cultural fit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature 2 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verified Profiles
                </h3>
                <p className="text-gray-600 text-sm">
                  All candidates go through our comprehensive verification process, ensuring you get authentic and qualified professionals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature 3 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Fast Hiring Process
                </h3>
                <p className="text-gray-600 text-sm">
                  Streamline your recruitment with our efficient tools and reduce time-to-hire by up to 50% compared to traditional methods.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature 4 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics & Insights
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your hiring performance with detailed analytics and insights to optimize your recruitment strategy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Section */}
      <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-emerald-900 mb-4">
              Trusted by Leading Companies
            </h3>
            <p className="text-emerald-700">
              Join thousands of companies that have found their perfect hires through Job Genie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-800">TC</span>
              </div>
              <blockquote className="text-gray-700 italic mb-2">
                "Job Genie helped us find 5 amazing developers in just 2 weeks. The quality of candidates is outstanding."
              </blockquote>
              <cite className="text-sm font-semibold text-emerald-800">Sarah Johnson, CTO at TechCorp</cite>
            </div>

            {/* Testimonial 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-800">GE</span>
              </div>
              <blockquote className="text-gray-700 italic mb-2">
                "The matching algorithm is incredible. We've reduced our hiring time by 60% while improving candidate quality."
              </blockquote>
              <cite className="text-sm font-semibold text-emerald-800">Mike Chen, HR Director at GreenEnergy</cite>
            </div>

            {/* Testimonial 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-800">FF</span>
              </div>
              <blockquote className="text-gray-700 italic mb-2">
                "Professional, efficient, and results-driven. Job Genie has become our go-to platform for all hiring needs."
              </blockquote>
              <cite className="text-sm font-semibold text-emerald-800">Lisa Rodriguez, VP at FinanceFirst</cite>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Active Employers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">500K+</div>
              <div className="text-sm text-gray-600">Verified Candidates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
