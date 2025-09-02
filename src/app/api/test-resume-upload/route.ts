import { NextResponse } from 'next/server';
import { ResumeStorage } from '@/lib/resume-storage';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      HAS_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // Test bucket creation
    let bucketTest = null;
    try {
      await ResumeStorage.ensureBucketsExist();
      bucketTest = { success: true, message: 'Bucket check completed' };
    } catch (error) {
      bucketTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }

    return NextResponse.json({
      environment: envCheck,
      bucketTest,
      message: 'Resume upload test completed'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
