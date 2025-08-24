# Job Genie API Documentation

## Candidate Registration API

### Endpoint
`POST /api/auth/register`

### Description
Registers a new candidate user in the system. The registration data is split between two tables:
- **User table**: Basic user information (email, password, role, status)
- **Candidate table**: Candidate-specific information (NIC/passport, gender, date of birth, etc.)

### Request Body

```json
{
  "first_name": "string (required, max 100 chars)",
  "last_name": "string (required, max 100 chars)",
  "nic": "string (required, max 50 chars)",
  "passport": "string (optional, max 50 chars)",
  "gender": "male | female | other | prefer_not_to_say (optional)",
  "date_of_birth": "string (required, ISO date format)",
  "address": "string (required)",
  "phone": "string (required, max 20 chars)",
  "email": "string (required, valid email format, max 255 chars)",
  "password": "string (required, min 8 chars)",
  "confirm_password": "string (required, must match password)"
}
```

### Response

#### Success Response (201 Created)
```json
{
  "message": "Candidate registered successfully",
  "user": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "address": "string",
    "phone1": "string",
    "email": "string",
    "role": "candidate",
    "status": "pending_verification",
    "email_verified": false,
    "is_created": true,
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "candidate": {
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "gender": "string",
    "date_of_birth": "date",
    "address": "string",
    "phone1": "string",
    "nic": "string",
    "passport": "string",
    "membership_no": "number",
    "profile_completion_percentage": 25,
    "completedProfile": false,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "First name is required",
      "path": ["first_name"]
    }
  ]
}
```

**409 Conflict - User Already Exists**
```json
{
  "error": "User with this email already exists"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

### Features

1. **Data Validation**: Comprehensive validation using Zod schema
2. **Password Security**: Passwords are hashed using bcrypt with salt rounds of 12
3. **Transaction Safety**: User and Candidate records are created in a single database transaction
4. **Duplicate Prevention**: Checks for existing users by email and NIC
5. **Automatic Membership Number Generation**: Generates unique membership numbers based on User ID + 1000
6. **Guaranteed Uniqueness**: No race conditions, instant generation, direct user ID correlation
7. **Profile Completion Tracking**: Sets initial profile completion percentage to 25%
8. **Status Management**: Sets user status to 'pending_verification' by default

### Database Tables Used

- **user**: Stores basic user information and authentication details
- **candidate**: Stores candidate-specific information linked to the user

### Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- Proper error handling without exposing sensitive information
- NIC uniqueness validation to prevent duplicate registrations
- Guaranteed unique membership numbers based on user ID

### Usage Example

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    nic: '123456789V',
    gender: 'male',
    date_of_birth: '1990-01-01',
    address: '123 Main St, City',
    phone: '+1234567890',
    email: 'john.doe@example.com',
    password: 'securepassword123',
    confirm_password: 'securepassword123'
  })
});

const data = await response.json();
```

### Notes

- The API automatically handles the relationship between User and Candidate tables
- Email verification is set to false by default and status is set to 'pending_verification'
- A verification email is automatically sent after successful registration
- The candidate will need to complete additional profile information to reach 100% completion
- All timestamps are automatically managed by Prisma

### Membership Number Generation

The system automatically generates unique membership numbers for candidates:

- **Format**: Based on User ID + 1000 (e.g., User ID `a1b2c3d4` becomes membership number `2712848084`)
- **Uniqueness**: Guaranteed unique as each user ID is unique
- **Performance**: No database queries needed, instant generation
- **Relationship**: Direct correlation between user ID and membership number
- **Fallback**: Uses timestamp + random numbers if generation fails

**Example Membership Numbers:**
- User ID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890` → Membership: `2712848084`
- User ID: `f9e8d7c6-b5a4-3210-fedc-ba9876543210` → Membership: `4187627910`
- etc.

**How it works:**
1. Takes first 8 characters of the user's UUID (removing hyphens)
2. Converts from hexadecimal to decimal
3. Adds 1000 to ensure all numbers are 4+ digits
4. Results in a unique, predictable membership number

## Email Verification APIs

### Send Verification Email

#### Endpoint
`POST /api/auth/send-verification`

#### Description
Sends a verification email to a candidate's email address. This endpoint can be used to resend verification emails if needed.

#### Request Body

```json
{
  "email": "string (required, valid email format)"
}
```

#### Response

#### Success Response (200 OK)
```json
{
  "message": "Verification email sent successfully",
  "email": "john.doe@example.com",
  "verification_sent": true
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

**400 Bad Request - Already Verified**
```json
{
  "error": "Email is already verified"
}
```

**403 Forbidden - Access Denied**
```json
{
  "error": "Access denied. This account is not registered as a candidate"
}
```

**404 Not Found - User Not Found**
```json
{
  "error": "User not found with this email address"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to send verification email. Please try again later.",
  "message": "Email service temporarily unavailable"
}
```

### Verify Email Token

#### Endpoint
`POST /api/auth/verify-email`

#### Description
Verifies an email verification token and activates the candidate's account.

#### Request Body

```json
{
  "token": "string (required, 6-digit verification code from email)"
}

#### Response

#### Success Response (200 OK)
```json
{
  "message": "Email verified successfully",
  "email_verified": true,
  "user_id": "uuid"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "Verification token is required",
      "path": ["token"]
    }
  ]
}
```

**400 Bad Request - Invalid Code**
```json
{
  "error": "Invalid or expired verification code"
}

**400 Bad Request - Already Verified**
```json
{
  "error": "Email is already verified"
}
```

**403 Forbidden - Access Denied**
```json
{
  "error": "Access denied. This account is not registered as a candidate"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

### Features

1. **Automatic Verification Email**: Sent immediately after successful registration
2. **6-Digit Verification Code**: Simple, easy-to-enter verification codes
3. **Token Expiration**: Verification codes expire after 24 hours
4. **Resend Capability**: Can resend verification emails if needed
5. **Beautiful Email Templates**: Professional HTML and text email templates
6. **Status Management**: Automatically updates user status to 'active' after verification
7. **Success Confirmation**: Sends confirmation email after successful verification

### Email Templates

The system includes two email templates:

1. **Verification Email**: Sent during registration with 6-digit verification code
2. **Success Email**: Sent after successful verification with login instructions

### Security Features

- 6-digit verification code generation
- 24-hour code expiration
- Role-based access control
- Input validation and sanitization
- Secure email delivery

### Usage Example

```typescript
// Send verification email
const sendVerificationResponse = await fetch('/api/auth/send-verification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com'
  })
});

// Verify email code
const verifyEmailResponse = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: '123456' // 6-digit verification code from email
  })
});
```

### Notes

- Verification emails are automatically sent after successful registration
- 6-digit verification codes are easy to enter and remember
- Codes expire after 24 hours for security
- Users must verify their email before they can log in
- The system automatically updates user status from 'pending_verification' to 'active'
- Beautiful, responsive email templates are included for both verification and success emails

## User Authentication APIs

### User Login API

### Endpoint
`POST /api/auth/login`

### Description
Authenticates users (candidates, employers, MIS users, recruitment agencies) and provides JWT tokens for access control. Uses custom JWT system with HTTP-only cookies for secure token storage.

### Request Body

```json
{
  "email": "string (required, valid email format)",
  "password": "string (required)"
}
```

### Response

#### Success Response (200 OK)
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "address": "string",
    "phone1": "string",
    "email": "string",
    "role": "candidate",
    "status": "active",
    "email_verified": "boolean",
    "last_login_at": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_created": true
  },
  "candidate": {
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "gender": "string",
    "date_of_birth": "date",
    "address": "string",
    "phone1": "string",
    "nic": "string",
    "passport": "string",
    "membership_no": "number",
    "profile_completion_percentage": "number",
    "completedProfile": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "error": "Invalid email or password"
}
```

**403 Forbidden - Access Denied**
```json
{
  "error": "Access denied. This account is not registered as a candidate"
}
```

**403 Forbidden - Account Not Active**
```json
{
  "error": "Account is not active. Please verify your email or contact support"
}
```

**404 Not Found - Profile Missing**
```json
{
  "error": "Candidate profile not found. Please contact support"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

### Features

1. **Email/Password Authentication**: Validates credentials against hashed passwords
2. **Multi-Role Support**: Supports candidates, employers, MIS users, and recruitment agencies
3. **Status Validation**: Checks if the account is active and verified
4. **JWT Authentication**: Custom JWT system with HTTP-only cookies for secure token storage
5. **User Data Storage**: JWT tokens include user ID, email, first name, last name, membership number, role, and user type
6. **Role-Based Access Control**: Middleware automatically validates user roles for protected endpoints
7. **Login Tracking**: Updates last login timestamp on successful authentication

### Security Features

- Password verification using bcrypt
- Role-based access control
- Account status validation
- Custom JWT authentication with HTTP-only cookies
- Secure token generation and validation
- Input validation and sanitization
- Automatic role validation through middleware

### Usage Example

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();
const { access_token, refresh_token } = data;

// Store tokens for future API calls
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);
```

### JWT Token Usage

The API uses HTTP-only cookies for secure token storage:

1. **Access Token**: Short-lived token (1 day) stored in `access_token` cookie
2. **Refresh Token**: Long-lived token (7 days) stored in `refresh_token` cookie

**JWT Payload Structure:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "membership_no": 12345,
  "role": "candidate",
  "userType": "candidate"
}
```

### Notes

- JWT tokens are automatically stored in HTTP-only cookies for security
- User data (ID, email, name, membership number, role) is embedded in JWT tokens
- Middleware automatically validates tokens and extracts user data for protected routes
- All passwords are verified against bcrypt-hashed values stored in the database
- The API updates the user's last login timestamp on successful authentication
- Role-based access control is enforced at the middleware level

## JWT Authentication APIs

### Refresh Token API

#### Endpoint
`POST /api/auth/refresh-token`

#### Description
Refreshes expired access tokens using a valid refresh token.

#### Request Body
```json
{
  "refresh_token": "string (required, refresh token from cookies)"
}
```

#### Response
**Success Response (200 OK)**
```json
{
  "message": "Token refreshed successfully",
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

### Logout API

#### Endpoint
`POST /api/auth/logout`

#### Description
Logs out the user and clears all JWT cookies.

#### Response
**Success Response (200 OK)**
```json
{
  "message": "Logged out successfully",
  "logged_out": true
}
```

### Profile API

#### Endpoint
`GET /api/auth/profile`

#### Description
Retrieves the current user's profile information using JWT authentication.

#### Headers
- Requires valid JWT token (automatically handled by cookies)

#### Response
**Success Response (200 OK)**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "candidate",
    "status": "active",
    "email_verified": true
  },
  "profile": {
    // Candidate or employer profile data
  },
  "user_type": "candidate"
}
```

### Candidate Dashboard API

#### Endpoint
`GET /api/candidate/dashboard`

#### Description
Example protected endpoint that demonstrates JWT user data extraction.

#### Headers
- Requires valid JWT token (automatically handled by cookies)
- User must have 'candidate' role

#### Response
**Success Response (200 OK)**
```json
{
  "message": "Dashboard data retrieved successfully",
  "userData": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "membershipNo": "12345",
    "role": "candidate",
    "userType": "candidate"
  },
  "dashboardData": {
    "totalApplications": 5,
    "savedJobs": 12,
    "profileCompletion": 75
  }
}
```

## Using JWT User Data in Protected Endpoints

### Method 1: Extract from Headers (Recommended)
```typescript
import { extractUserDataFromHeaders } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const userData = extractUserDataFromHeaders(request.headers);
  
  // Access user data
  const { userId, email, firstName, lastName, membershipNo, role, userType } = userData;
  
  // Your API logic here
}
```

### Method 2: Direct Token Verification
```typescript
import { getUserDataFromToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userData = getUserDataFromToken(token);
  if (!userData) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  // Access user data
  const { userId, email, firstName, lastName, membershipNo, role, userType } = userData;
  
  // Your API logic here
}
```
