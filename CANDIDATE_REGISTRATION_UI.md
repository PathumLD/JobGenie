# Candidate Registration UI Documentation

## Overview

This document describes the implementation of the candidate registration UI using Metronic-inspired design principles with a 2:1 ratio layout (2/3 for advertisements, 1/3 for registration form).

## File Structure

```
src/
├── app/
│   └── candidate/
│       └── register/
│           └── page.tsx                 # Main registration page
├── components/
│   ├── candidate/
│   │   ├── index.ts                     # Component exports
│   │   ├── AdvertisementSection.tsx     # 2/3 width advertisement area
│   │   └── CandidateRegistrationForm.tsx # Registration form component
│   └── ui/
│       ├── index.ts                     # UI component exports
│       ├── form-input.tsx               # Enhanced input component
│       ├── form-select.tsx              # Enhanced select component
│       └── loading-spinner.tsx          # Loading spinner component
```

## Components

### 1. Candidate Registration Page (`/candidate/register`)

**Features:**
- Responsive 2:1 ratio layout (2/3 advertisements, 1/3 form)
- Metronic-inspired design with emerald theme
- Mobile-first responsive design
- Clean header with navigation

**Layout Structure:**
- Header: Logo, title, and sign-in link
- Main content: Grid layout with advertisements and form
- Responsive breakpoints for mobile, tablet, and desktop

### 2. Advertisement Section

**Features:**
- Hero section with gradient background
- Statistics grid (10K+ jobs, 95% success rate, AI matching)
- Feature highlights with icons
- Testimonial section
- Responsive grid layouts

**Design Elements:**
- Gradient backgrounds (emerald to blue to purple)
- Card-based layout with shadows
- Icon integration
- Hover effects and transitions

### 3. Candidate Registration Form

**Features:**
- Complete form validation
- Real-time error handling
- API integration with existing `/api/auth/register` endpoint
- Responsive form layout
- Loading states and success/error messages

**Form Fields:**
- Personal Information: First Name, Last Name, NIC/Passport, Gender, Date of Birth
- Contact Information: Address, Phone, Email
- Security: Password, Confirm Password
- All fields follow schema.prisma validation rules

**Validation Rules:**
- Required field validation
- Email format validation
- Password strength (minimum 8 characters)
- Password confirmation matching
- Age validation (16-100 years)
- Field length limits based on database schema

### 4. Enhanced UI Components

#### FormInput Component
- Multiple variants (default, filled, outlined)
- Icon support (left/right)
- Error state handling
- Helper text support
- Consistent styling with Metronic theme

#### FormSelect Component
- Custom dropdown arrow
- Icon support
- Error state handling
- Placeholder support
- Consistent with FormInput styling

#### LoadingSpinner Component
- Multiple sizes (sm, md, lg, xl)
- Color variants (default, white, emerald, blue, gray)
- Accessible with ARIA labels
- Smooth animation

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
- Accent colors: Purple, Orange
- Neutral grays for text and borders
- Gradient combinations for visual appeal

### Responsive Design
- Mobile-first approach
- Grid-based layouts
- Flexible form arrangements
- Touch-friendly input sizes
- Consistent spacing across devices

## API Integration

### Registration Endpoint
- **URL:** `/api/auth/register`
- **Method:** POST
- **Content-Type:** application/json

### Request Payload
```typescript
interface CandidateRegistrationRequest {
  first_name: string;
  last_name: string;
  nic: string;
  passport?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth: string; // ISO date string
  address: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
}
```

### Response Handling
- Success: Form reset and success message display
- Error: Field-specific error display
- Network errors: User-friendly error messages
- Loading states: Disabled form during submission

## Usage Examples

### Basic Form Implementation
```tsx
import { CandidateRegistrationForm } from '@/components/candidate';

function MyPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <CandidateRegistrationForm 
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    />
  );
}
```

### Custom Form Input
```tsx
import { FormInput } from '@/components/ui';

<FormInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<MailIcon className="w-4 h-4" />}
/>
```

### Custom Form Select
```tsx
import { FormSelect } from '@/components/ui';

<FormSelect
  label="Gender"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ]}
  placeholder="Select your gender"
/>
```

## Styling and CSS

### Tailwind CSS Classes
- Custom color palette integration
- Responsive utility classes
- Component-specific styling
- Consistent spacing scale

### Custom CSS Variables
- CSS custom properties for theming
- Dark mode support (if implemented)
- Consistent border radius and shadows

## Accessibility Features

- Proper form labels and associations
- ARIA attributes for screen readers
- Keyboard navigation support
- Error message associations
- Loading state announcements

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach
- Graceful degradation for older browsers

## Performance Considerations

- Lazy loading of components
- Optimized form validation
- Minimal re-renders
- Efficient state management
- Responsive image handling

## Future Enhancements

- Multi-step form wizard
- File upload integration
- Social media login options
- Advanced form validation
- Analytics integration
- A/B testing support
