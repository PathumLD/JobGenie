# Employer Registration System

## Overview
The employer registration system provides a comprehensive 2-step registration process for companies to join the Job Genie platform. The system includes company information collection, employer profile creation, and email verification.

## Features

### 1. Two-Step Registration Process
- **Step 1: Company Information**
  - Company name
  - Business registration number
  - Business registration certificate upload
  - Business registered address
  - Industry selection

- **Step 2: Employer Information**
  - First and last name
  - Email address
  - Password creation
  - Password confirmation

### 2. Email Verification
- 6-digit OTP sent to employer's email
- Verification required before account activation
- Resend verification code functionality
- Secure token-based verification

### 3. File Upload
- Support for business registration certificates
- Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
- Drag and drop functionality
- File validation and error handling

## File Structure

```
src/
├── app/
│   └── employer/
│       ├── page.tsx                    # Main registration page
│       ├── login/
│       │   └── page.tsx               # Employer login page
│       ├── dashboard/
│       │   └── page.tsx               # Employer dashboard
│       └── layout.tsx                  # Employer layout
├── components/
│   └── employer/
│       ├── index.ts                    # Component exports
│       ├── EmployerRegistrationForm.tsx # Main registration form
│       ├── CompanyDataForm.tsx         # Company information form
│       ├── EmployerDataForm.tsx        # Employer information form
│       └── EmailVerificationForm.tsx   # Email verification form
└── types/
    └── api.ts                          # API type definitions
```

## API Endpoints

### Registration
- `POST /api/auth/register-employer` - Employer registration
- `POST /api/auth/send-verification` - Send verification email
- `POST /api/auth/verify-email` - Verify email with OTP

### Authentication
- `POST /api/auth/login` - User login (supports employers)
- `POST /api/auth/profile` - Get user profile (includes company info)
- `POST /api/auth/logout` - User logout

## Database Schema

The system uses the following Prisma models:
- `User` - Base user information
- `Company` - Company details and verification status
- `Employer` - Employer profile linked to company

## User Flow

1. **Company Information Entry**
   - User fills company details
   - Uploads business registration certificate
   - Cannot proceed without completing all fields

2. **Employer Information Entry**
   - User provides personal details
   - Creates account password
   - System creates user, company, and employer records

3. **Email Verification**
   - Verification code sent to email
   - User enters 6-digit code
   - Account activated upon successful verification

4. **Dashboard Access**
   - Redirected to employer dashboard
   - Can view company information and verification status

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Email verification required for account activation
- File upload validation and sanitization
- Role-based access control

## Styling

- Consistent with existing Job Genie design system
- Responsive design for mobile and desktop
- Tailwind CSS for styling
- Interactive form validation
- Progress indicators and step navigation

## Error Handling

- Form validation with real-time feedback
- API error handling and user-friendly messages
- File upload error handling
- Network error recovery

## Future Enhancements

- Company profile completion wizard
- Job posting functionality
- Application management system
- Company branding and customization
- Multi-user company accounts
- Advanced company verification workflows

## Testing

The system has been tested with:
- TypeScript compilation
- Next.js build process
- Component rendering
- API endpoint functionality

## Dependencies

- Next.js 15.5.0
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- bcryptjs for password hashing
- JWT for authentication
