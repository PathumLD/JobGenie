# MIS API Documentation

## MIS User Registration

### Endpoint
`POST /api/mis/register`

### Description
Registers a new MIS (Management Information System) user in the system. This endpoint creates both a user account and an MIS user profile. MIS users are activated immediately without email verification.

### Request Body

```json
{
  "first_name": "string (required, max 100 chars)",
  "last_name": "string (required, max 100 chars)",
  "email": "string (required, valid email, max 255 chars)",
  "password": "string (required, min 8 chars)",
  "confirm_password": "string (required, must match password)"
}
```

### Response

#### Success (201 Created)
```json
{
  "message": "MIS user registered successfully and is now active.",
  "user": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "mis",
    "status": "active",
    "email_verified": true,
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "mis_user": {
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

## MIS User Login

### Endpoint
`POST /api/mis/login`

### Description
Authenticates an MIS user and provides access to the system. This endpoint validates credentials and returns a JWT access token for subsequent API calls.

### Request Body

```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

### Response

#### Success (200 OK)
```json
{
  "message": "MIS user login successful",
  "user": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "address": "string",
    "phone1": "string",
    "phone2": "string",
    "email": "string",
    "role": "mis",
    "status": "active",
    "email_verified": true,
    "last_login_at": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_created": true
  },
  "mis_user": {
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "user_type": "mis",
  "access_token": "jwt_token_string"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
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

**401 Unauthorized - Invalid Credentials**
```json
{
  "error": "Invalid email or password"
}
```

**401 Unauthorized - Social Login Account**
```json
{
  "error": "Invalid authentication method. This account uses social login"
}
```

**403 Forbidden - Wrong User Type**
```json
{
  "error": "This endpoint is only for MIS users"
}
```

**403 Forbidden - Inactive Account**
```json
{
  "error": "Account is not active. Please contact support"
}
```

**404 Not Found - Profile Missing**
```json
{
  "error": "MIS user profile not found. Please contact support"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "string"
}
```

### Business Rules

1. **Immediate Activation**: MIS users are activated immediately upon registration
2. **No Email Verification**: Email verification is not required for MIS users
3. **Password Security**: Passwords are hashed using bcrypt with salt rounds of 12
4. **Unique Email**: Both user and MIS user tables enforce email uniqueness
5. **Basic Profile**: MIS users are created with basic profile information (first name, last name, email)
6. **JWT Authentication**: Successful login returns a JWT access token for API access
7. **Role Validation**: Only users with role 'mis' can use this endpoint
8. **Last Login Tracking**: System updates last_login_at timestamp on successful login

### Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- Transaction-based database operations
- Immediate account activation
- JWT token-based authentication
- Role-based access control
- Secure password comparison

### Example Usage

#### Registration
```bash
curl -X POST http://localhost:3000/api/mis/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "password": "securePassword123",
    "confirm_password": "securePassword123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/mis/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "securePassword123"
  }'
```

### Notes

- MIS users are created with `status: 'active'` and `email_verified: true`
- No verification tokens or email sending is required
- The system maintains audit trails with created_at and updated_at timestamps
- All database operations are wrapped in transactions for data consistency
- The simplified schema focuses on essential user information without complex access controls
- JWT tokens expire after 24 hours and should be refreshed as needed
- Use the returned access_token in the Authorization header for protected endpoints: `Authorization: Bearer <access_token>`
