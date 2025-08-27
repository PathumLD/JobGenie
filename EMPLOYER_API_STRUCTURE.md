# Employer API Structure

## Directory Organization

The employer API follows a clean, organized structure that separates concerns and makes the codebase maintainable:

```
src/app/api/
├── auth/                    # General authentication endpoints
│   ├── login/              # Generic login (handles all user types)
│   ├── register/            # Generic registration
│   ├── logout/              # Logout endpoint
│   └── ...
├── candidate/               # Candidate-specific endpoints
│   ├── dashboard/           # Candidate dashboard
│   ├── profile/             # Profile management
│   ├── resume/              # Resume operations
│   └── ...
├── employer/                # Employer-specific endpoints
│   ├── login/               # Employer login (role-restricted)
│   ├── dashboard/           # Employer dashboard (future)
│   ├── jobs/                # Job management (future)
│   ├── applications/        # Application management (future)
│   └── ...
└── mis/                     # MIS user endpoints (future)
    ├── dashboard/           # MIS dashboard
    ├── users/               # User management
    └── ...
```

## Why Separate Employer Login?

### 1. **Role-Based Security**
- The employer login endpoint (`/api/employer/login`) only accepts users with `role: 'employer'`
- Prevents candidates, MIS users, or recruitment agencies from using this endpoint
- Provides an additional layer of security and access control

### 2. **Clear Separation of Concerns**
- Each user type has its own API namespace
- Makes the codebase easier to maintain and understand
- Allows for user type-specific logic and validation

### 3. **Future Scalability**
- Easy to add employer-specific endpoints (dashboard, job management, etc.)
- Can implement different authentication flows for different user types
- Supports role-based middleware and access control

### 4. **API Documentation and Testing**
- Clear endpoint organization makes API documentation easier
- Separate test files for different user types
- Better error handling and validation specific to each user type

## Current Implementation

### Employer Login API (`/api/employer/login`)
- **Purpose**: Authenticate employer users only
- **Security**: Role-based access control
- **Response**: Employer profile + company information
- **Authentication**: JWT tokens + secure cookies

### Generic Login API (`/api/auth/login`)
- **Purpose**: Authenticate any user type
- **Security**: General authentication
- **Response**: Generic user profile
- **Authentication**: JWT tokens + secure cookies

## Benefits of This Structure

### 1. **Security**
- Role-specific endpoints prevent unauthorized access
- Clear separation reduces attack surface
- Easier to implement role-based middleware

### 2. **Maintainability**
- Each user type's logic is isolated
- Easier to debug and test
- Clear code organization

### 3. **Scalability**
- Easy to add new endpoints for each user type
- Can implement different business logic per user type
- Supports future feature development

### 4. **API Design**
- RESTful endpoint structure
- Clear naming conventions
- Consistent response formats

## Future Endpoints

### Employer API (`/api/employer/`)
- `POST /login` - ✅ **Implemented**
- `GET /dashboard` - Employer dashboard
- `GET /jobs` - List employer's jobs
- `POST /jobs` - Create new job
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `GET /applications` - View job applications
- `PUT /applications/:id` - Update application status
- `GET /profile` - Get employer profile
- `PUT /profile` - Update employer profile

### Candidate API (`/api/candidate/`)
- `GET /jobs` - ✅ **Implemented** - Job search and filtering
- `GET /jobs/:id` - ✅ **Implemented** - Job details with related jobs
- `GET /jobs/filters` - ✅ **Implemented** - Available filters and search suggestions
- `GET /dashboard` - Candidate dashboard (future)
- `GET /profile` - Get candidate profile (future)
- `PUT /profile` - Update candidate profile (future)
- `GET /resume` - Get candidate resume (future)
- `POST /resume` - Upload resume (future)

### MIS API (`/api/mis/`)
- `GET /dashboard` - MIS dashboard
- `GET /users` - List all users
- `GET /companies` - List all companies
- `POST /companies` - Create company
- `PUT /companies/:id` - Update company
- `GET /jobs` - List all jobs
- `PUT /jobs/:id` - Moderate job

## Best Practices Implemented

### 1. **Type Safety**
- No `any` types used anywhere
- Proper TypeScript interfaces
- Zod validation schemas

### 2. **Error Handling**
- Comprehensive error responses
- Proper HTTP status codes
- Detailed error messages

### 3. **Security**
- Password hashing with bcrypt
- JWT token management
- Role-based access control
- Secure cookie handling

### 4. **Database Integration**
- Prisma ORM for type-safe database access
- Proper relationship handling
- Efficient queries with includes

### 5. **Code Organization**
- Separate files for different concerns
- Consistent naming conventions
- Clear import/export structure

## Testing Strategy

### Test Files
- `test-employer-login-api.http` - Employer login API tests
- `test-registration.http` - Registration API tests
- `test-candidate-profile-api.http` - Candidate profile tests

### Test Scenarios
- Successful authentication
- Validation errors
- Authentication failures
- Role-based access control
- Error handling
- Edge cases

## Conclusion

The employer API structure provides a solid foundation for building a scalable, secure, and maintainable job platform. By separating concerns and implementing role-based access control, the system can easily accommodate different user types while maintaining security and code quality.
