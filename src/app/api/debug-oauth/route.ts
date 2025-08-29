import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  return NextResponse.json({
    message: 'OAuth Debug Info',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hostname: url.hostname,
      origin: url.origin,
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    expectedFlow: {
      step1: 'User clicks Google Sign-In',
      step2: 'App calls supabaseClient.auth.signInWithOAuth()',
      step3: 'Supabase redirects to Google OAuth',
      step4: 'Google redirects back to: https://nzfwbxenukkxjjgxvjza.supabase.co/auth/v1/callback',
      step5: 'Supabase processes auth and redirects to: your-app/candidate/auth-callback',
      step6: 'Your app syncs session and redirects to: /candidate/jobs'
    },
    currentIssue: 'If you are getting localhost redirect, check Supabase Site URL setting'
  });
}
