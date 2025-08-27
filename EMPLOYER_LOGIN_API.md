# Employer Login API Documentation

## Overview
The Employer Login API provides secure authentication for employer users in the Job Genie system. This endpoint is specifically designed for employers and includes role-based access control to ensure only employer accounts can authenticate through this route.

## Endpoint
```
POST /api/employer/login
```

## Request Headers
```
Content-Type: application/json
```

## Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

### Field Descriptions
- **email** (required): The employer's email address. Must be a valid email format.
- **password** (required): The employer's password. Must not be empty.

## Response Format

### Success Response (200 OK)
```json
{
  "message": "Employer login successful",
  "user": {
    "id": "uuid",
    "first_name": "string | null",
    "last_name": "string | null",
    "address": "string | null",
    "phone1": "string | null",
    "phone2": "string | null",
    "email": "string",
    "role": "employer",
    "status": "active",
    "email_verified": "boolean | null",
    "last_login_at": "datetime | null",
    "created_at": "datetime | null",
    "updated_at": "datetime | null",
    "is_created": "boolean"
  },
  "profile": {
    "user_id": "uuid",
    "company_id": "uuid",
    "first_name": "string | null",
    "last_name": "string | null",
    "address": "string | null",
    "phone": "string | null",
    "job_title": "string | null",
    "department": "string | null",
    "role": "recruiter | hiring_manager | hr_admin | company_admin",
    "permissions": "object | null",
    "is_verified": "boolean",
    "is_primary_contact": "boolean",
    "phone_extension": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "user_type": "employer",
  "access_token": "string",
  "refresh_token": "string"
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "string",
      "message": "string",
      "path": ["string"]
    }
  ]
}
```

#### 401 Unauthorized - Authentication Failed
```json
{
  "error": "Invalid email or password"
}
```

#### 401 Unauthorized - Social Login Account
```json
{
  "error": "Invalid authentication method. This account uses social login"
}
```

#### 403 Forbidden - Account Not Active
```json
{
  "error": "Account is not active. Please verify your email or contact support"
}
```

#### 404 Not Found - Profile Not Found
```json
{
  "error": "Employer profile not found. Please contact support"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "string"
}
```

## Authentication

### JWT Tokens
Upon successful login, the API returns:
- **Access Token**: Short-lived token (1 day) for API requests
- **Refresh Token**: Long-lived token (7 days) for token renewal

### Cookies
The API automatically sets secure HTTP-only cookies:
- `access_token`: Contains the access token
- `refresh_token`: Contains the refresh token

## Security Features

### Role-Based Access Control
- Only users with `role: 'employer'` can authenticate through this endpoint
- Non-employer users (candidates, MIS users, recruitment agencies) will receive a 401 error

### Password Security
- Passwords are verified using bcrypt comparison
- Plain text passwords are never stored or logged

### Account Status Validation
- Only active accounts can authenticate
- Pending verification, suspended, or inactive accounts are blocked

### Input Validation
- Email format validation using Zod schema
- Password presence validation
- Comprehensive error details for validation failures

## Database Schema Integration

The API integrates with the following Prisma models:
- **User**: Core user authentication and profile data
- **Employer**: Employer-specific profile information
- **Company**: Company details associated with the employer

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:3000/api/employer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "password123"
  }'
```

### JavaScript/TypeScript Example
```typescript
const response = await fetch('/api/employer/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'employer@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

## Error Handling

### Common Error Scenarios
1. **Invalid Credentials**: Wrong email/password combination
2. **Account Not Active**: Email not verified or account suspended
3. **Wrong User Type**: Candidate or other user types trying to use employer endpoint
4. **Missing Profile**: User exists but employer profile is missing
5. **Social Login Account**: Account created through OAuth without password

### Best Practices
- Always check the response status before processing
- Handle validation errors gracefully
- Implement proper error logging on the client side
- Use refresh tokens to maintain session continuity

## Rate Limiting
Consider implementing rate limiting to prevent brute force attacks:
- Limit login attempts per IP address
- Implement exponential backoff for failed attempts
- Monitor for suspicious login patterns

## Testing
Use the provided `test-employer-login-api.http` file to test various scenarios:
- Successful login
- Validation errors
- Authentication failures
- Role-based access control
- Error handling

## Dependencies
- **Prisma**: Database ORM for data access
- **bcryptjs**: Password hashing and verification
- **Zod**: Request validation and schema definition
- **jsonwebtoken**: JWT token generation and management
- **Next.js**: API route framework
