@echo off
echo 🚀 Starting Job Genie build process...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Generate Prisma client
echo 🗄️  Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated successfully

REM Run linting
echo 🔍 Running linting...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting found issues. Please fix them before building.
    echo You can continue with the build, but it's recommended to fix linting issues first.
    set /p continue="Continue with build? (y/N): "
    if /i not "%continue%"=="y" (
        echo Build cancelled.
        pause
        exit /b 1
    )
)

REM Build the application
echo 🏗️  Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  Warning: .env.local file not found!
    echo Please create .env.local with your environment variables before deploying.
    echo You can copy from env-example.txt as a template.
)

echo.
echo 🎉 Build is ready for deployment!
echo.
echo Next steps:
echo 1. Set up your environment variables in .env.local
echo 2. Deploy to Vercel using: vercel --prod
echo 3. Or push to GitHub and connect to Vercel for automatic deployment
echo.
echo For detailed deployment instructions, see DEPLOYMENT.md
pause
