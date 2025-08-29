'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Authentication Error
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-600">
            There was an error processing your Google sign-in. This could be due to:
          </p>
          
          <ul className="text-left text-sm text-gray-500 space-y-2">
            <li>• Network connectivity issues</li>
            <li>• Browser blocking third-party cookies</li>
            <li>• Invalid authentication code</li>
            <li>• Session timeout</li>
          </ul>
          
          <div className="space-y-3 pt-4">
            <Link href="/candidate/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
