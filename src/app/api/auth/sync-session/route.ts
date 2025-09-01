import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateAccessToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { generateMembershipNumberFromUserId } from '@/lib/membership';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabase_user_id, email, provider, user_metadata } = body;

    if (!supabase_user_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists in our user table
    const { data: existingUser } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    let user;

    if (existingUser) {
      // Update existing user with provider info if not already set
      const updateData: any = {};
      if (!existingUser.provider_id) {
        updateData.provider = provider;
        updateData.provider_id = supabase_user_id;
      }

      if (Object.keys(updateData).length > 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('user')
          .update(updateData)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          );
        }
        user = updatedUser;
      } else {
        user = existingUser;
      }

      // Check if candidate record exists for this user
      const existingCandidate = await prisma.candidate.findUnique({
        where: { user_id: user.id }
      });

      if (!existingCandidate) {
        // Create candidate record if it doesn't exist
        try {
          const membershipNo = generateMembershipNumberFromUserId(user.id);
          
          await prisma.candidate.create({
            data: {
              user_id: user.id,
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              membership_no: membershipNo,
              profile_completion_percentage: 25,
              completedProfile: false
            }
          });
        } catch (candidateError) {
          console.error('Error creating candidate record:', candidateError);
          // Don't fail the entire sync if candidate creation fails
        }
      }
    } else {
      // Create new user and candidate using Prisma transaction (same as email/password registration)
      try {
        const firstName = user_metadata?.full_name?.split(' ')[0] || user_metadata?.name?.split(' ')[0] || '';
        const lastName = user_metadata?.full_name?.split(' ').slice(1).join(' ') || user_metadata?.name?.split(' ').slice(1).join(' ') || '';

        const result = await prisma.$transaction(async (tx) => {
          // Create user record first
          const newUser = await tx.user.create({
            data: {
              email,
              provider: provider,
              provider_id: supabase_user_id,
              role: 'candidate',
              first_name: firstName,
              last_name: lastName,
              email_verified: true, // Google OAuth users are pre-verified
              status: 'active',
              is_created: true
            }
          });

          // Generate membership number based on user ID + 1000
          const membershipNo = generateMembershipNumberFromUserId(newUser.id);

          // Create candidate record
          const candidate = await tx.candidate.create({
            data: {
              user_id: newUser.id,
              first_name: firstName,
              last_name: lastName,
              membership_no: membershipNo,
              profile_completion_percentage: 25, // Basic info completed
              completedProfile: false
            }
          });

          return { user: newUser, candidate };
        });

        user = result.user;
      } catch (prismaError) {
        console.error('Error creating user and candidate:', prismaError);
        return NextResponse.json(
          { error: 'Failed to create user and candidate' },
          { status: 500 }
        );
      }
    }

    // Generate JWT tokens (same as email/password login)
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.role as 'candidate' | 'employer' | 'mis' | 'recruitment_agency',
      role: user.role as 'candidate' | 'employer' | 'mis' | 'recruitment_agency',
      first_name: user.first_name,
      last_name: user.last_name
    };

    const accessToken = generateAccessToken(jwtPayload);

    // Create response (same format as email/password login)
    const response = NextResponse.json({
      message: 'OAuth authentication successful',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      user_type: user.role,
      access_token: accessToken,
    });

    // Return response with tokens in body (no cookies)
    console.log('OAuth sync successful - tokens returned in response body');
    return response;
  } catch (error) {
    console.error('Session sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
