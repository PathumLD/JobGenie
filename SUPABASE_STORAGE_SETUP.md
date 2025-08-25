# Supabase Storage Setup for Employer Registration

## Issue
The employer registration API is failing with the error:
```
File upload error: Error: Upload failed: Bucket not found
```

This happens because the required storage bucket `business-registration` doesn't exist in your Supabase project.

## Solution Options

### Option 1: Automatic Bucket Creation (Recommended)
The API has been updated to automatically create the bucket if it doesn't exist. This should work automatically on the next API call.

### Option 2: Manual Bucket Creation via Supabase Dashboard
If the automatic creation doesn't work, follow these steps:

1. **Go to your Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on "Buckets"

3. **Create New Bucket**
   - Click "New bucket"
   - Set the following:
     - **Name**: `business-registration`
     - **Public bucket**: ✅ Checked (to allow public access to uploaded files)
     - **File size limit**: `10 MB`
     - **Allowed MIME types**: 
       - `application/pdf`
       - `application/msword`
       - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
       - `image/jpeg`
       - `image/png`

4. **Click "Create bucket"**

### Option 3: Run Setup Script
If you prefer to use a script, you can run the setup script:

```bash
# Install dotenv if not already installed
npm install dotenv

# Run the setup script
node setup-supabase-storage.js
```

## Environment Variables Required
Make sure these are set in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Bucket Configuration Details
- **Name**: `business-registration`
- **Public**: Yes (files are publicly accessible)
- **File Size Limit**: 10MB
- **Allowed File Types**: PDF, Word documents, images
- **Purpose**: Store business registration certificates uploaded by employers

## Testing
After setting up the bucket, test the employer registration API:

```bash
# Test with the provided test file
curl -X POST http://localhost:3000/api/auth/register-employer \
  -F "company_name=Test Company" \
  -F "business_registration_no=BR123456789" \
  -F "business_registration_certificate=@/path/to/test.pdf" \
  -F "business_registered_address=123 Test Street" \
  -F "industry=Technology" \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "email=john.doe@testcompany.com" \
  -F "password=password123" \
  -F "confirm_password=password123"
```

## Troubleshooting
- **Permission Denied**: Ensure your `SUPABASE_SERVICE_ROLE_KEY` has storage permissions
- **Bucket Still Not Found**: Check if the bucket name matches exactly (case-sensitive)
- **File Upload Fails**: Verify the file size is under 10MB and file type is allowed

## Security Notes
- The bucket is public, meaning uploaded files are publicly accessible
- Consider implementing additional access controls if needed
- Files are stored with unique names to prevent conflicts
- Business registration documents contain sensitive information - ensure compliance with data protection regulations
