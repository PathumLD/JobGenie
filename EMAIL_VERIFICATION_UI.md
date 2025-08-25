# Email Verification UI Documentation

## Overview

This document describes the implementation of the email verification UI for candidates after registration. The system sends a 6-digit OTP to the candidate's email and provides a user-friendly interface for verification.

## File Structure

```
src/
├── app/
│   ├── candidate/
│   │   └── verify-email/
│   │       └── page.tsx                 # Main verification page
│   └── test-verification/
│       └── page.tsx                     # Test page for components
├── components/
│   └── candidate/
│       ├── index.ts                     # Component exports
│       ├── EmailVerificationForm.tsx    # OTP verification form
│       └── VerificationSuccess.tsx      # Success page after verification
└── EMAIL_VERIFICATION_UI.md             # This documentation
```

## Components

### 1. Email Verification Page (`/candidate/verify-email`)

**Features:**
- Clean, focused verification interface
- Email address displayed (read-only) from registration or query parameter
- Responsive design with Metronic-inspired styling
- Automatic redirect after successful verification

**Layout Structure:**
- Header: Logo and navigation
- Main content: Centered verification form
- Success state: Shows verification success component

**URL Parameters:**
- `email`: Displays the email address (read-only)

### 2. Email Verification Form

**Features:**
- 6-digit OTP input with validation
- Resend code functionality with 60-second cooldown
- Real-time form validation
- Loading states and error handling
- Integration with existing API endpoints

**Form Fields:**
- **Verification Code**: 6-digit numeric input
- **Resend Button**: With countdown timer and loading states

**Validation Rules:**
- OTP must be exactly 6 digits
- OTP must contain only numbers
- Required field validation

**API Integration:**
- **Verify Email**: `/api/auth/verify-email` (POST)
- **Resend Code**: `/api/auth/send-verification` (POST)

### 3. Verification Success Component

**Features:**
- Celebration message with success icon
- Clear next steps guidance
- Action buttons for navigation
- Consistent design with other pages

**Content Sections:**
- Success confirmation
- Next steps checklist
- Action buttons (Dashboard, Sign In)
- Support information

## User Flow

### 1. Registration Success
1. User completes registration form
2. Form submits to `/api/auth/register`
3. Success message displayed
4. Automatic redirect to `/candidate/verify-email?email=user@example.com`

### 2. Email Verification
1. User lands on verification page
2. Email address displayed (read-only)
3. User enters 6-digit OTP from email
4. Form validates and submits to verification API
5. Success state triggers success component

### 3. Post-Verification
1. Success component displays
2. User can navigate to dashboard or sign in
3. Account status updated to 'active' in database

## API Integration

### Verification Endpoint
- **URL:** `/api/auth/verify-email`
- **Method:** POST
- **Payload:** `{ token: string }` (6-digit OTP)

### Resend Code Endpoint
- **URL:** `/api/auth/send-verification`
- **Method:** POST
- **Payload:** `{ email: string }`

### Response Handling
- **Success**: Redirect to success component
- **Error**: Display field-specific error messages
- **Network Error**: User-friendly error messages

## Design Principles

### Metronic Theme Integration
- Clean, professional appearance
- Consistent spacing and typography
- Modern card-based layouts
- Subtle shadows and borders
- Smooth transitions and hover effects

### Emerald Theme Consistency
- Primary color: Emerald (#10B981)
- Secondary color: Blue (#3B82F6)
- Success states: Emerald variants
- Error states: Red variants
- Consistent with registration page styling

### Responsive Design
- Mobile-first approach
- Centered layout for focus
- Touch-friendly input sizes
- Consistent spacing across devices

## Security Features

### OTP Validation
- 6-digit numeric code requirement
- Server-side validation
- Token expiration handling (24 hours)
- Rate limiting on resend functionality

### User Experience
- Clear error messages
- Loading states during API calls
- Disabled states during processing
- Automatic redirect after success

## Error Handling

### Validation Errors
- Field-specific error display
- Real-time error clearing
- User-friendly error messages
- Consistent error styling

### API Errors
- Network error handling
- Server error display
- Graceful degradation
- Retry mechanisms

### User Guidance
- Help text for each field
- Spam folder reminders
- Support contact information
- Clear next steps

## Accessibility Features

### Form Accessibility
- Proper label associations
- ARIA attributes for screen readers
- Keyboard navigation support
- Error message associations
- Loading state announcements

### Visual Accessibility
- High contrast colors
- Clear visual hierarchy
- Consistent button styling
- Readable typography

## Performance Considerations

### State Management
- Efficient form state updates
- Minimal re-renders
- Optimized validation
- Debounced input handling

### API Optimization
- Single API call per verification
- Efficient error handling
- Loading state management
- Success state caching

## Testing

### Test Page
- **URL:** `/test-verification`
- **Purpose:** Component testing and development
- **Features:** Isolated component testing
- **Navigation:** Links to actual verification page

### Component Testing
- Form validation testing
- API integration testing
- Error state testing
- Success flow testing

## Future Enhancements

### Advanced Features
- SMS verification option
- Voice call verification
- Biometric verification
- Two-factor authentication

### User Experience
- Progress indicators
- Multi-step verification
- Customizable verification methods
- Integration with mobile apps

### Security Enhancements
- Advanced rate limiting
- Device fingerprinting
- Behavioral analysis
- Fraud detection

## Usage Examples

### Basic Verification Form
```tsx
import { EmailVerificationForm } from '@/components/candidate';

function MyPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <EmailVerificationForm 
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      userEmail="user@example.com"
      onVerificationSuccess={() => console.log('Verified!')}
    />
  );
}
```

### Success Component
```tsx
import { VerificationSuccess } from '@/components/candidate';

function SuccessPage() {
  return <VerificationSuccess />;
}
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach
- Graceful degradation for older browsers

## Dependencies

### Required Components
- `FormInput`: Enhanced input component
- `Button`: Action buttons
- `LoadingSpinner`: Loading states
- `Card`: Layout containers

### External Dependencies
- React hooks for state management
- Next.js for routing and API calls
- Tailwind CSS for styling
- TypeScript for type safety

## Troubleshooting

### Common Issues
1. **OTP not received**: Check spam folder, verify email address
2. **Invalid code**: Ensure 6-digit numeric input
3. **Network errors**: Check internet connection
4. **Rate limiting**: Wait for cooldown period

### Support Resources
- In-app help text
- Support contact information
- FAQ documentation
- User community forums
