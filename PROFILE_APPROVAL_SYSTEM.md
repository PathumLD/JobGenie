# Profile Approval System Documentation

## Overview

The Profile Approval System ensures that candidate profiles are reviewed and approved by MIS (Management Information System) users before candidates can access the full system functionality. This creates a controlled onboarding process where quality is maintained.

## System Flow

### 1. Profile Creation
- Candidate registers and creates a profile
- Profile completion is checked against required fields
- Required fields: First Name, Last Name, Email, NIC, Gender, Date of Birth, Address, Phone

### 2. Profile Completion Check
- System validates all required fields are filled
- If incomplete → Redirect to `/candidate/complete-profile`
- If complete but not approved → Allow access to platform (can browse jobs, update profile, but cannot apply for jobs)
- If complete and approved → Allow access to dashboard

### 3. MIS Approval Process
- MIS users review candidate profiles
- Use the approval API to approve candidates
- Sets `isApproved` field to `true` in the database
- Updates user status to `active`

### 4. Post-Approval Access
- Approved candidates can access all features
- Dashboard, job search, applications, etc.

## Database Schema

### Candidate Model
```prisma
model Candidate {
  // ... other fields
  isApproved Boolean @default(false)  // Key field for approval status
  // ... other fields
}
```

### User Model
```prisma
model User {
  // ... other fields
  status UserStatus @default(pending_verification)
  // ... other fields
}
```

## API Endpoints

### 1. Profile Approval Check
**Endpoint:** `GET /api/candidate/profile/profile-approval-check`

**Purpose:** Check both profile completion and approval status

**Response:**
```typescript
{
  success: boolean;
  isProfileComplete: boolean;
  isApproved: boolean;
  missingFields: string[];
  candidateData?: CandidateProfileData;
  message: string;
}
```

### 2. MIS Candidate Approval
**Endpoint:** `PUT /api/mis/candidate-approval`

**Purpose:** Approve a candidate profile

**Request:**
```typescript
{
  candidateId: string;
}
```

**Response:**
```typescript
{
  message: string;
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    isApproved: boolean;
    updated_at: Date | null;
  };
}
```

### 3. Candidate Status Check
**Endpoint:** `GET /api/mis/candidate-approval?candidateId={id}`

**Purpose:** Get candidate approval status

**Response:**
```typescript
{
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    isApproved: boolean;
    created_at: Date | null;
    updated_at: Date | null;
  };
}
```

## Frontend Components

### 1. CandidateDashboard
- Checks profile approval status on load
- Redirects to appropriate pages based on status
- Only shows dashboard content when approved

### 2. ApprovalPendingPage
- Shows when profile is complete but pending approval
- Auto-refreshes every 30 seconds to check status
- Provides information about the approval process

### 3. AuthGuard
- Enhanced to check profile approval status
- Redirects candidates based on their status
- Prevents unauthorized access to protected routes

## User Experience Flow

### For Candidates:
1. **Register/Login** → Basic authentication
2. **Complete Profile** → Fill required information
3. **Wait for Approval** → View approval pending page
4. **Access System** → Full functionality after approval

### For MIS Users:
1. **Review Profiles** → View candidate submissions
2. **Approve/Reject** → Use approval API
3. **Monitor Status** → Track approval progress

## Security Features

- **Authentication Required:** All approval endpoints require valid tokens
- **Role-Based Access:** Only MIS users can approve candidates
- **Status Validation:** Prevents double-approval
- **Audit Trail:** Tracks approval timestamps

## Error Handling

- **Unauthorized:** Invalid or missing authentication
- **Not Found:** Candidate profile doesn't exist
- **Already Approved:** Prevents duplicate approvals
- **Internal Errors:** Database or server issues

## Testing

Use the provided test script to verify endpoints:
```bash
node test-approval-system.js
```

## Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret

### Database Migrations
Ensure the `isApproved` field exists in the Candidate table:
```sql
ALTER TABLE candidate ADD COLUMN "isApproved" BOOLEAN DEFAULT FALSE;
```

## Monitoring and Logging

The system logs:
- Profile completion checks
- Approval status changes
- Missing field information
- Error conditions

## Future Enhancements

- **Email Notifications:** Notify candidates of approval status
- **Bulk Approval:** Approve multiple candidates at once
- **Approval Reasons:** Track why profiles were approved/rejected
- **Auto-Approval Rules:** Automatic approval for certain criteria
- **Approval Workflow:** Multi-level approval process

## Troubleshooting

### Common Issues:

1. **Profile Not Completing:**
   - Check required fields are filled
   - Verify database schema matches expectations

2. **Approval Not Working:**
   - Ensure MIS user has proper permissions
   - Check database connection and transactions

3. **Redirect Loops:**
   - Verify approval status is being set correctly
   - Check route protection logic

### Debug Steps:

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check database for correct `isApproved` values
4. Review server logs for errors

## Support

For issues or questions about the Profile Approval System:
1. Check this documentation
2. Review the test script
3. Examine the database schema
4. Check server logs
5. Contact the development team
