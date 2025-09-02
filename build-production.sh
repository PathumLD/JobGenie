#!/bin/bash

# Job Genie Production Build Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Job Genie Production Build"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm version: $(npm --version)"

# Check Git
if ! command -v git &> /dev/null; then
    print_warning "Git is not installed (optional for deployment)"
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache
print_success "Cleanup completed"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    print_error "Failed to generate Prisma client"
    exit 1
fi
print_success "Prisma client generated"

# Run linting
print_status "Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    print_warning "Linting found issues. Consider fixing them before deployment."
    read -p "Continue with build? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Build cancelled by user"
        exit 1
    fi
fi

# TypeScript check
print_status "Running TypeScript check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    print_error "TypeScript check failed"
    exit 1
fi
print_success "TypeScript check passed"

# Build the application
print_status "Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi
print_success "Application built successfully"

# Check build output
if [ ! -d ".next" ]; then
    print_error "Build output directory .next not found"
    exit 1
fi

# Check environment variables
print_status "Checking environment variables..."
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Production environment file ($ENV_FILE) not found"
    print_status "Creating from template..."
    if [ -f "env-production-template.txt" ]; then
        cp env-production-template.txt "$ENV_FILE"
        print_warning "Please edit $ENV_FILE with your production values"
    else
        print_error "Environment template not found"
    fi
else
    print_success "Production environment file found"
fi

# Check for required environment variables
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "NEXT_PUBLIC_SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    print_warning "Please add these to $ENV_FILE before deployment"
fi

# Create deployment artifacts
print_status "Creating deployment artifacts..."

# Create deployment info file
cat > deployment-info.txt << EOF
Job Genie Deployment Information
===============================

Build Date: $(date)
Node Version: $(node --version)
NPM Version: $(npm --version)
Build Output: .next/
Environment: Production

Required Environment Variables:
$(for var in "${REQUIRED_VARS[@]}"; do echo "- $var"; done)

Deployment Commands:
- Vercel: npm run deploy:vercel
- Netlify: npm run deploy:netlify
- Docker: npm run deploy:docker
- Traditional: npm start

Health Check: curl http://localhost:3000/api/health
EOF

print_success "Deployment info created: deployment-info.txt"

# Final checks
print_status "Running final checks..."

# Check if build is working
if [ -f ".next/server.js" ]; then
    print_success "Standalone build detected (Docker ready)"
fi

# Check bundle size
if command -v du &> /dev/null; then
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    print_status "Build size: $BUILD_SIZE"
fi

echo ""
echo "🎉 Production build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in .env.production"
echo "2. Set up your database and run migrations"
echo "3. Deploy using one of the following methods:"
echo "   - Vercel: npm run deploy:vercel"
echo "   - Netlify: npm run deploy:netlify"
echo "   - Docker: npm run deploy:docker"
echo "   - Traditional: npm start"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "🏥 Health check: curl http://localhost:3000/api/health"
echo ""
