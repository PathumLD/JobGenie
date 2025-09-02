# Candidate Approval API Documentation

## Overview
The Candidate Approval API allows MIS users to approve or reject candidates, updating their approval status in the system. This API handles both single candidate approvals and bulk operations.

## Base URL
```
POST /api/mis/candidate-approval
GET /api/mis/candidate-approval
```

## Authentication
- **Required**: MIS user authentication
- **Role**: MIS users only
- **Method**: JWT token in Authorization header

## Endpoints

### 1. Approve/Reject Single Candidate

#### POST `/api/mis/candidate-approval`

**Description**: Approve or reject a single candidate by updating their `isApproved` status.

**Query Parameters**:
- `action` (optional): 
  - `approve` - Approve the candidate (default)
  - `reject` - Reject the candidate

**Request Body**:
```json
{
  "candidateId": "uuid-string"
}
```

**Response**:
```json
{
  "message": "Candidate approved successfully",
  "candidate": {
    "user_id": "uuid-string",
    "first_name": "John",
    "last_name": "Doe",
    "isApproved": true,
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example Usage**:
```bash
# Approve a candidate
curl -X POST "http://localhost:3000/api/mis/candidate-approval?action=approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"candidateId": "123e4567-e89b-12d3-a456-426614174000"}'

# Reject a candidate
curl -X POST "http://localhost:3000/api/mis/candidate-approval?action=reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"candidateId": "123e4567-e89b-12d3-a456-426614174000"}'
```

### 2. Bulk Approve Candidates

#### POST `/api/mis/candidate-approval?action=bulk-approve`

**Description**: Approve multiple candidates in a single operation using database transactions for data consistency.

**Query Parameters**:
- `action`: Must be `bulk-approve`

**Request Body**:
```json
{
  "candidateIds": [
    "uuid-string-1",
    "uuid-string-2",
    "uuid-string-3"
  ]
}
```

**Response**:
```json
{
  "message": "Successfully approved 3 candidates",
  "candidate": {
    "user_id": "uuid-string-1",
    "first_name": "John",
    "last_name": "Doe",
    "isApproved": true,
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example Usage**:
```bash
curl -X POST "http://localhost:3000/api/mis/candidate-approval?action=bulk-approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "candidateIds": [
      "123e4567-e89b-12d3-a456-426614174000",
      "987fcdeb-51a2-43d1-b789-123456789abc",
      "456defab-78c9-12d3-e456-789abcdef012"
    ]
  }'
```

### 3. Get Candidate Approval Status

#### GET `/api/mis/candidate-approval?candidateId=uuid`

**Description**: Retrieve the current approval status of a specific candidate.

**Query Parameters**:
- `candidateId` (required): UUID of the candidate

**Response**:
```json
{
  "message": "Candidate status retrieved successfully",
  "candidate": {
    "user_id": "uuid-string",
    "first_name": "John",
    "last_name": "Doe",
    "isApproved": true,
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example Usage**:
```bash
curl -X GET "http://localhost:3000/api/mis/candidate-approval?candidateId=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Business Logic

### Approval Process
1. **Candidate Approval**: Sets `isApproved = true` in the `candidate` table
2. **User Status Update**: Changes user status to `active` in the `user` table
3. **Timestamp Update**: Updates `updated_at` field in both tables

### Rejection Process
1. **Candidate Rejection**: Sets `isApproved = false` in the `candidate` table
2. **User Status Update**: Changes user status to `pending_verification` in the `user` table
3. **Timestamp Update**: Updates `updated_at` field in both tables

### Bulk Operations
- Uses database transactions to ensure all-or-nothing updates
- Maintains data consistency across multiple candidate updates
- Provides summary response with count of approved candidates

## Data Validation

### Input Validation
- **Candidate ID**: Must be valid UUID format
- **Bulk Operations**: Minimum 1 candidate ID required
- **Action Types**: Limited to `approve`, `reject`, `bulk-approve`

### Business Rules
- Candidate must exist in the system before approval/rejection
- User status is automatically synchronized with candidate approval status
- All operations update timestamps for audit trails

## Error Handling

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **404**: Candidate not found
- **500**: Internal server error

### Error Response Format
```json
{
  "error": "Error message",
  "details": [
    {
      "code": "validation_error_code",
      "message": "Detailed error message",
      "path": ["field", "path"]
    }
  ]
}
```

### Common Error Scenarios
1. **Invalid UUID**: Candidate ID format is incorrect
2. **Candidate Not Found**: Specified candidate doesn't exist
3. **Missing Parameters**: Required fields are not provided
4. **Validation Errors**: Request data doesn't meet schema requirements

## Database Schema Impact

### Tables Modified
1. **`candidate`**:
   - `isApproved`: Boolean field updated
   - `updated_at`: Timestamp updated

2. **`user`**:
   - `status`: User status synchronized with approval
   - `updated_at`: Timestamp updated

### Relationships
- **One-to-One**: `User` ↔ `Candidate` (via `user_id`)
- **Cascade Updates**: User status automatically updated when candidate approval changes

## Security Considerations

### Authentication
- JWT token required for all operations
- MIS role verification enforced

### Authorization
- Only MIS users can access this API
- No candidate can approve themselves

### Data Integrity
- Database transactions ensure consistency
- Input validation prevents malicious data
- UUID validation prevents injection attacks

## Performance Considerations

### Bulk Operations
- Uses database transactions for efficiency
- Batch processing for multiple candidates
- Minimal database round trips

### Single Operations
- Optimized queries with proper indexing
- Efficient updates with minimal data transfer

## Monitoring and Logging

### Logged Events
- All approval/rejection operations
- Bulk operation summaries
- Error conditions and stack traces

### Metrics
- Success/failure rates
- Response times
- Bulk operation performance

## Testing

### Test Scenarios
1. **Single Approval**: Approve one candidate
2. **Single Rejection**: Reject one candidate
3. **Bulk Approval**: Approve multiple candidates
4. **Invalid Inputs**: Test validation error handling
5. **Non-existent Candidates**: Test 404 responses
6. **Authentication**: Test unauthorized access

### Test Data
```json
{
  "validCandidateId": "123e4567-e89b-12d3-a456-426614174000",
  "invalidCandidateId": "invalid-uuid",
  "bulkCandidateIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "987fcdeb-51a2-43d1-b789-123456789abc"
  ]
}
```

## Integration Examples

### Frontend Integration
```typescript
// Approve single candidate
const approveCandidate = async (candidateId: string) => {
  const response = await fetch('/api/mis/candidate-approval?action=approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ candidateId })
  });
  
  return response.json();
};

// Bulk approve candidates
const bulkApproveCandidates = async (candidateIds: string[]) => {
  const response = await fetch('/api/mis/candidate-approval?action=bulk-approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ candidateIds })
  });
  
  return response.json();
};
```

### Webhook Integration
```typescript
// Example webhook payload for candidate approval
interface CandidateApprovalWebhook {
  event: 'candidate.approved' | 'candidate.rejected';
  candidate_id: string;
  approved_by: string;
  timestamp: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    isApproved: boolean;
  };
}
```

## Versioning and Compatibility

### Current Version
- **API Version**: v1
- **Schema Version**: Compatible with current Prisma schema
- **Backward Compatibility**: Maintained for existing integrations

### Future Enhancements
- **Batch Size Limits**: Configurable limits for bulk operations
- **Approval Reasons**: Support for rejection reasons and comments
- **Approval Workflow**: Multi-step approval processes
- **Audit Trail**: Detailed history of approval changes

## Support and Maintenance

### Documentation Updates
- API changes documented in this file
- Schema updates reflected in examples
- Breaking changes clearly marked

### Contact Information
- **Technical Support**: Development team
- **API Issues**: GitHub issues repository
- **Schema Questions**: Database team
