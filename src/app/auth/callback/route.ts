import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Helper function to handle user creation/update
async function syncUserSession(sessionData: any, origin: string) {
  const { supabase: serverSupabase } = await import('@/lib/supabase');
  const { generateAccessToken, generateRefreshToken } = await import('@/lib/jwt');
  const { PrismaClient } = await import('@prisma/client');
  const { generateMembershipNumberFromUserId } = await import('@/lib/membership');

  const prisma = new PrismaClient();
  
  try {
    const { user: supabaseUser } = sessionData;
    const email = supabaseUser.email;
    const supabase_user_id = supabaseUser.id;
    const user_metadata = supabaseUser.user_metadata;

    if (!supabase_user_id || !email) {
      throw new Error('Missing user data');
    }

    // Check if user already exists
    const { data: existingUser } = await serverSupabase
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    let user;

    if (existingUser) {
      user = await updateExistingUser(serverSupabase, existingUser, supabase_user_id);
    } else {
      user = await createNewUser(prisma, email, supabase_user_id, user_metadata);
    }

    // Generate JWT tokens
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.role as 'candidate' | 'employer' | 'mis' | 'recruitment_agency',
      role: user.role as 'candidate' | 'employer' | 'mis' | 'recruitment_agency',
      first_name: user.first_name,
      last_name: user.last_name
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    await prisma.$disconnect();
    return { user, accessToken, refreshToken };
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

// Helper function to update existing user
async function updateExistingUser(serverSupabase: any, existingUser: any, supabase_user_id: string) {
  const updateData: any = {};
  if (!existingUser.provider_id) {
    updateData.provider = 'google';
    updateData.provider_id = supabase_user_id;
  }

  if (Object.keys(updateData).length > 0) {
    const { data: updatedUser } = await serverSupabase
      .from('user')
      .update(updateData)
      .eq('id', existingUser.id)
      .select()
      .single();
    return updatedUser;
  }
  return existingUser;
}

// Helper function to create new user
async function createNewUser(prisma: any, email: string, supabase_user_id: string, user_metadata: any) {
  const { generateMembershipNumberFromUserId } = await import('@/lib/membership');
  
  const firstName = user_metadata?.full_name?.split(' ')[0] || user_metadata?.name?.split(' ')[0] || '';
  const lastName = user_metadata?.full_name?.split(' ').slice(1).join(' ') || user_metadata?.name?.split(' ').slice(1).join(' ') || '';

  const result = await prisma.$transaction(async (tx: any) => {
    const newUser = await tx.user.create({
      data: {
        email,
        provider: 'google',
        provider_id: supabase_user_id,
        role: 'candidate',
        first_name: firstName,
        last_name: lastName,
        email_verified: true,
        status: 'active',
        is_created: true
      }
    });

    const membershipNo = generateMembershipNumberFromUserId(newUser.id);

    await tx.candidate.create({
      data: {
        user_id: newUser.id,
        first_name: firstName,
        last_name: lastName,
        membership_no: membershipNo,
        profile_completion_percentage: 25,
        completedProfile: false
      }
    });

    return { user: newUser };
  });

  return result.user;
}

// Helper function to create redirect response
function createRedirectResponse(origin: string, next: string, request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  } else {
    return NextResponse.redirect(`${origin}${next}`);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/candidate/jobs';
  
  if (!next.startsWith('/')) {
    next = '/candidate/jobs';
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data.session) {
      console.error('❌ PKCE flow: Code exchange failed:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    console.log('✅ PKCE flow: Successfully exchanged code for session');
    
    const { accessToken, refreshToken } = await syncUserSession(data.session, origin);
    
    console.log('✅ PKCE flow: Session sync successful, redirecting...');
    
    const response = createRedirectResponse(origin, next, request);
    
    // Set JWT cookies
    const { setJWTCookies } = await import('@/lib/jwt');
    return setJWTCookies(response, accessToken, refreshToken);

  } catch (syncError) {
    console.error('❌ PKCE flow: Session sync error:', syncError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
