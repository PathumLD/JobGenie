# Job Genie - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Vercel CLI installed (`npm i -g vercel`)
- Access to your Supabase project
- Google Gemini API key
- SMTP credentials for email verification

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp env-example.txt .env.local
   ```

2. **Fill in your environment variables in `.env.local`:**
   - `JWT_SECRET`: Generate a strong random string
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `DATABASE_URL`: Your database connection string
   - `DIRECT_URL`: Your direct database connection string
   - `NEXT_PUBLIC_SITE_URL`: Your production domain
   - SMTP credentials for email verification

## Local Build & Test

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Test the build locally:**
   ```bash
   npm start
   ```

## Vercel Deployment

### Option 1: Vercel CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - Redeploy if needed

### Option 2: GitHub Integration

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set environment variables in Vercel dashboard**
4. **Deploy automatically on push**

## Database Setup

1. **Ensure your database is accessible from Vercel**
2. **Run Prisma migrations if needed:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed initial data if required:**
   ```bash
   npm run seed:isco
   ```

## Post-Deployment

1. **Verify all API endpoints are working**
2. **Test email verification flow**
3. **Check database connections**
4. **Monitor application logs in Vercel dashboard**

## Troubleshooting

### Common Issues:

1. **Build failures:**
   - Check TypeScript errors: `npm run lint`
   - Ensure all dependencies are installed
   - Verify environment variables are set

2. **Runtime errors:**
   - Check Vercel function logs
   - Verify database connectivity
   - Check API key validity

3. **Environment variable issues:**
   - Ensure all required variables are set in Vercel
   - Check variable names match exactly
   - Redeploy after setting variables

## Security Notes

- Never commit `.env.local` to version control
- Use strong JWT secrets in production
- Regularly rotate API keys
- Monitor application logs for suspicious activity

## Performance Optimization

- The app is configured with `output: 'standalone'` for better performance
- API functions have 30-second timeout limits
- Static assets are optimized automatically by Next.js
