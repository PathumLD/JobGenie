// Simple test script to verify Google OAuth setup
// Run with: node test-google-oauth.js

const https = require('https');

const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzfwbxenukkxjjgxvjza.supabase.co',
  clientId: '616693433178-m7jvrtj72c5pdh2lrf98kjgrc2ujtcgt.apps.googleusercontent.com',
  callbackUrl: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com/api/auth/google/callback'
    : 'http://localhost:3000/api/auth/google/callback'
};

console.log('🔍 Google OAuth Configuration Test');
console.log('=====================================');
console.log(`Supabase URL: ${config.supabaseUrl}`);
console.log(`Google Client ID: ${config.clientId}`);
console.log(`Callback URL: ${config.callbackUrl}`);
console.log('');

// Test 1: Verify Supabase URL is accessible
console.log('1. Testing Supabase URL accessibility...');
const supabaseTestUrl = `${config.supabaseUrl}/rest/v1/`;
https.get(supabaseTestUrl, (res) => {
  if (res.statusCode === 401 || res.statusCode === 200) {
    console.log('✅ Supabase URL is accessible');
  } else {
    console.log(`❌ Supabase URL returned status: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.log(`❌ Error accessing Supabase URL: ${err.message}`);
});

// Test 2: Verify Google Client ID format
console.log('2. Testing Google Client ID format...');
const clientIdPattern = /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
if (clientIdPattern.test(config.clientId)) {
  console.log('✅ Google Client ID format is valid');
} else {
  console.log('❌ Google Client ID format is invalid');
}

// Test 3: Check environment variables
console.log('3. Checking required environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} is set`);
  } else {
    console.log(`❌ ${envVar} is missing`);
  }
});

console.log('');
console.log('📋 Next Steps:');
console.log('1. Ensure all environment variables are set in .env.local');
console.log('2. Configure Google OAuth credentials in Supabase Dashboard');
console.log('3. Update redirect URIs in Google Cloud Console:');
console.log('   - REMOVE: http://localhost:3000/api/auth/google/callback');
console.log('   - KEEP ONLY: https://nzfwbxenukkxjjgxvjza.supabase.co/auth/v1/callback');
console.log('4. Update Supabase redirect URLs:');
console.log('   - Site URL: http://localhost:3000');
console.log('   - Additional: http://localhost:3000/candidate/auth-callback');
console.log('5. Test the authentication flow in your application');
console.log('');
console.log('🚨 IMPORTANT: The redirect URI in Google Cloud Console should ONLY be the Supabase callback URL!');
console.log('🚀 Ready to test Google OAuth authentication!');
