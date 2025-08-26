'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdvertisementSection() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Your Career Journey Starts Here
          </h2>
                      <p className="text-emerald-100 text-lg mb-6 max-w-2xl">
              Join thousands of professionals who have found their dream jobs through Job Genie&apos;s AI-powered matching system.
            </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
              <span>AI-Powered Job Matching</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span>Instant Profile Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <span>Career Growth Tools</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-600">10K+</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Active Jobs</h3>
            <p className="text-sm text-gray-600">From top companies worldwide</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">95%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Success Rate</h3>
            <p className="text-sm text-gray-600">Candidates find jobs within 3 months</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">AI</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
            <p className="text-sm text-gray-600">Advanced algorithms for perfect fit</p>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-sm">🚀</span>
              </div>
              <span>Quick Setup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm">
              Create your profile in minutes with our streamlined registration process. 
              Upload your resume and let AI do the heavy lifting.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🎯</span>
              </div>
              <span>Smart Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm">
              Get personalized job recommendations based on your skills, experience, 
              and career goals. No more scrolling through irrelevant positions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">📊</span>
              </div>
              <span>Career Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm">
              Access detailed analytics about your profile performance, 
              application success rates, and market demand for your skills.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">🔒</span>
              </div>
              <span>Privacy First</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm">
              Your data is protected with enterprise-grade security. 
              Control who sees your profile and when.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Testimonial Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-emerald-50 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
                                    <blockquote className="text-lg text-gray-700 mb-4 italic">
                          &ldquo;Job Genie helped me find my dream role in just 2 weeks. The AI matching was incredibly accurate!&rdquo;
                        </blockquote>
            <div className="text-sm text-gray-600">
              <strong>Sarah Chen</strong> • Software Engineer at TechCorp
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
