#!/bin/bash

# Job Genie Deployment Script
# This script helps deploy your application to production

echo "🚀 Job Genie Deployment Script"
echo "================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

# Check if .next directory exists (build output)
if [ ! -d .next ]; then
    echo "📦 Building application..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Please fix the errors and try again."
        exit 1
    fi
fi

echo "✅ Build completed successfully!"

# Check deployment target
echo ""
echo "🌍 Choose your deployment target:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Traditional Hosting"
echo "4) Docker"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🌐 Deploying to Netlify..."
        echo "Please follow these steps:"
        echo "1. Install Netlify CLI: npm install -g netlify-cli"
        echo "2. Run: netlify deploy --prod --dir=.next"
        ;;
    3)
        echo "🖥️  Traditional Hosting Setup..."
        echo "Copy these files to your server:"
        echo "- .next/"
        echo "- public/"
        echo "- package.json"
        echo "- package-lock.json"
        echo "- .env.production"
        echo ""
        echo "Then run: npm ci --only=production && npm start"
        ;;
    4)
        echo "🐳 Docker Deployment..."
        echo "Building Docker image..."
        docker build -t job-genie .
        echo "Docker image built successfully!"
        echo "Run with: docker run -p 3000:3000 job-genie"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "Check the output above for any errors or next steps."
