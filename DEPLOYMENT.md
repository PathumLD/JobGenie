# Job Genie - Deployment Guide

This guide provides step-by-step instructions for deploying Job Genie to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git repository set up
- Database (PostgreSQL) configured
- Environment variables configured

### 1. Build the Application
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build the application
npm run build
```

### 2. Environment Setup
Copy the environment template and configure your variables:
```bash
cp env-production-template.txt .env.production
# Edit .env.production with your actual values
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Automatic Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

#### Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

#### Using Netlify Dashboard
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables

### Option 3: Docker

#### Build and Run
```bash
# Build Docker image
docker build -t job-genie .

# Run container
docker run -p 3000:3000 --env-file .env.production job-genie
```

#### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 4: Traditional Hosting

#### Server Requirements
- Node.js 18+
- PostgreSQL 15+
- Nginx (recommended)

#### Deployment Steps
1. Upload build files to server
2. Install dependencies: `npm ci --only=production`
3. Set up environment variables
4. Run database migrations: `npx prisma migrate deploy`
5. Start the application: `npm start`

## 🔧 Environment Variables

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### Optional Variables
- `NEXT_PUBLIC_GEMINI_API_KEY`: Google Gemini AI API key
- `SMTP_*`: Email configuration
- `NEXT_PUBLIC_SITE_URL`: Your domain URL

## 🗄️ Database Setup

### PostgreSQL Setup
1. Create a PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`
3. Seed initial data (if needed): `npm run seed:isco`

### Database Connection
Ensure your `DATABASE_URL` follows this format:
```
postgresql://username:password@host:port/database_name
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.production` to version control
- Use secure, randomly generated secrets
- Rotate secrets regularly

### HTTPS
- Always use HTTPS in production
- Configure SSL certificates
- Set up proper security headers

### Database Security
- Use strong passwords
- Restrict database access
- Enable SSL connections
- Regular backups

## 📊 Monitoring and Logging

### Health Checks
- Monitor application health at `/api/health`
- Set up uptime monitoring
- Configure error tracking (Sentry, etc.)

### Performance
- Monitor build times
- Optimize bundle sizes
- Use CDN for static assets

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

#### Database Connection Issues
- Verify `DATABASE_URL` format
- Check network connectivity
- Ensure database is running

#### Environment Variable Issues
- Verify all required variables are set
- Check variable names and values
- Restart application after changes

### Support
- Check application logs
- Review error messages
- Test locally before deploying

## 📝 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Health checks passing
- [ ] Error monitoring set up
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

## 🔄 Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
