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
4. **Duplicate Prevention**: Checks for existing users by email
5. **Auto-incrementing Membership**: Automatically assigns the next available membership number
6. **Profile Completion Tracking**: Sets initial profile completion percentage to 25%
7. **Status Management**: Sets user status to 'pending_verification' by default

### Database Tables Used

- **user**: Stores basic user information and authentication details
- **candidate**: Stores candidate-specific information linked to the user

### Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- Proper error handling without exposing sensitive information

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
- The candidate will need to complete additional profile information to reach 100% completion
- All timestamps are automatically managed by Prisma
