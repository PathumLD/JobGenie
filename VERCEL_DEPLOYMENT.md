# Vercel Deployment Guide

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### Database
```
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_direct_postgresql_connection_string
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### JWT
```
JWT_SECRET=your_jwt_secret_key
```

### Email (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Optional
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
```

## Deployment Steps

1. **Connect your GitHub repository to Vercel**
2. **Add all environment variables** in Vercel project settings
3. **Set build command**: `npm run build`
4. **Set output directory**: `.next`
5. **Deploy**

## Common Issues & Solutions

### Issue: "Failed to collect page data for /api/auth/login"
**Solution**: 
- Ensure all environment variables are set
- Check that DATABASE_URL is accessible from Vercel
- Verify Prisma client generation works

### Issue: Build fails with Prisma errors
**Solution**:
- Added `postinstall` script to generate Prisma client
- Set `serverComponentsExternalPackages` in next.config.ts

### Issue: Environment variables not loading
**Solution**:
- Restart deployment after adding environment variables
- Check variable names match exactly (case-sensitive)

## Database Setup

1. **Ensure your database is accessible** from Vercel's servers
2. **Run migrations** if needed: `npx prisma migrate deploy`
3. **Generate Prisma client**: `npx prisma generate`

## Testing Deployment

After deployment, test these endpoints:
- `POST /api/auth/register` - Candidate registration
- `POST /api/auth/register-employer` - Employer registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - User profile (requires auth)

## Support

If deployment still fails:
1. Check Vercel build logs for specific errors
2. Verify all environment variables are set
3. Ensure database is accessible from Vercel
4. Check Prisma schema compatibility
