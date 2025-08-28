#!/bin/bash

# Job Genie Production Start Script
# This script starts the application in production mode

echo "🚀 Starting Job Genie in Production Mode"
echo "========================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

# Check if .next directory exists
if [ ! -d .next ]; then
    echo "📦 Building application..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Please fix the errors and try again."
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing production dependencies..."
    npm ci --only=production
    
    if [ $? -ne 0 ]; then
        echo "❌ Dependency installation failed!"
        exit 1
    fi
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Start the application
echo "✅ Starting application..."
echo "🌐 Application will be available at: http://localhost:3000"
echo "📊 Press Ctrl+C to stop the application"

npm start
