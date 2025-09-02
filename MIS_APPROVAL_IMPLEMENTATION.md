# MIS Approval Implementation for Job Applications

## Overview

This document outlines the changes made to implement the requirement that candidates cannot apply for jobs until MIS approval, but can update their profile without approval.

## Changes Made

### 1. Database Schema
- The existing `isApproved` field in the `Candidate` model is used to track MIS approval status
- No changes to the database schema were required

### 2. New Job Application API Endpoint
**File:** `src/app/api/candidate/jobs/apply/route.ts`

- **Purpose:** Handles job application submissions with MIS approval check
- **Key Features:**
  - Authenticates candidate user
  - Checks if candidate is approved by MIS (`isApproved` field)
  - Blocks applications from unapproved candidates with clear error message
  - Creates application record and updates job application count
  - Creates application snapshot for tracking

- **Approval Check:**
```typescript
// Check if candidate is approved by MIS
const candidate = await prisma.candidate.findUnique({
  where: { user_id: payload.userId },
  select: { isApproved: true }
});

if (!candidate.isApproved) {
  return NextResponse.json(
    { 
      error: 'Application blocked', 
      message: 'Your profile must be approved by MIS before you can apply for jobs. Please wait for approval or contact support if you have questions.' 
    },
    { status: 403 }
  );
}
```

### 3. Updated Profile Update API
**File:** `src/app/api/candidate/profile/update-profile/route.ts`

- **Change:** Added comment clarifying that profile updates are allowed regardless of MIS approval status
- **Key Point:** Candidates can update their profile information, skills, experience, etc. without waiting for MIS approval

### 4. Updated Frontend Components

#### Jobs Listing Page
**File:** `src/app/candidate/jobs/page.tsx`

- **Changes:**
  - Added `isApproved` state tracking
  - Updated profile check to use `profile-approval-check` endpoint
  - Added approval status warning banner for unapproved candidates
  - Modified "Apply Now" button to show "Approval Required" for unapproved candidates
  - Button is disabled and shows appropriate message for unapproved candidates

#### Candidate Dashboard
**File:** `src/components/candidate/CandidateDashboard.tsx`

- **Changes:**
  - Added `isApproved` state tracking
  - Added approval status warning banner
  - Modified job display logic to only show jobs for approved candidates
  - Updated call-to-action section to show different content based on approval status
  - Changed job detail buttons to show "View & Apply" vs "View Details" based on approval

#### Job Detail Page
**File:** `src/app/candidate/jobs/[id]/page.tsx`

- **New Component:** Complete job detail page with application functionality
- **Key Features:**
  - Shows approval status warning for unapproved candidates
  - Displays job information regardless of approval status
  - Application form only visible to approved candidates
  - Apply button disabled for unapproved candidates
  - Clear messaging about approval requirements

### 5. Profile Approval Check API
**File:** `src/app/api/candidate/profile/profile-approval-check/route.ts`

- **Existing API:** Used to check both profile completion and MIS approval status
- **No Changes Required:** Already provides the necessary information

## User Experience Flow

### For Unapproved Candidates:
1. **Profile Updates:** ✅ Allowed - can update any profile information
2. **Job Viewing:** ✅ Allowed - can browse and view job details
3. **Job Applications:** ❌ Blocked - clear message about approval requirement
4. **Dashboard Access:** ✅ Allowed - with warning about approval status

### For Approved Candidates:
1. **Profile Updates:** ✅ Allowed
2. **Job Viewing:** ✅ Allowed
3. **Job Applications:** ✅ Allowed - full application functionality
4. **Dashboard Access:** ✅ Allowed - full functionality

## Security Features

1. **API-Level Protection:** Job application endpoint checks approval status before processing
2. **Frontend Validation:** UI elements disabled and show appropriate messages
3. **Clear Messaging:** Users understand why they can't apply and what they need to do
4. **Consistent Checks:** All relevant components check approval status

## Error Messages

### Application Blocked:
```
"Your profile must be approved by MIS before you can apply for jobs. 
Please wait for approval or contact support if you have questions."
```

### Profile Pending Approval:
```
"Your profile is complete but pending MIS approval. You can view jobs and update your profile, 
but you cannot apply for jobs until your profile is approved. Please wait for approval or contact support if you have questions."
```

## Testing Scenarios

1. **Unapproved Candidate:**
   - Should see approval warning banners
   - Should be able to update profile
   - Should see disabled application buttons
   - Should receive clear error messages when trying to apply

2. **Approved Candidate:**
   - Should see no approval warnings
   - Should have full access to job applications
   - Should see enabled application buttons
   - Should be able to submit applications successfully

## Future Enhancements

1. **Real-time Approval Updates:** WebSocket notifications when approval status changes
2. **Approval Request System:** Allow candidates to request approval review
3. **Approval Timeline:** Show estimated approval time
4. **Bulk Operations:** Allow MIS users to approve multiple candidates at once

## Files Modified

- `src/app/api/candidate/jobs/apply/route.ts` (NEW)
- `src/app/api/candidate/profile/update-profile/route.ts`
- `src/app/candidate/jobs/page.tsx`
- `src/components/candidate/CandidateDashboard.tsx`
- `src/app/candidate/jobs/[id]/page.tsx` (NEW)

## Files Referenced (No Changes)

- `src/app/api/candidate/profile/profile-approval-check/route.ts`
- `prisma/schema.prisma`
- `src/types/profile-approval.ts`

## Conclusion

The implementation successfully enforces the MIS approval requirement while maintaining a good user experience. Candidates can continue to use the platform for profile management and job browsing, but are clearly informed about the approval requirement for job applications. The system provides appropriate feedback and maintains security at both the API and frontend levels.
