import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(): Promise<NextResponse> {
  try {
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    // Check essential environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'warning', 
          message: 'Missing environment variables', 
          missing: missingEnvVars 
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        status: 'healthy', 
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        message: 'System check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
