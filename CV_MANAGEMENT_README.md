# CV Management System

## Overview
The CV Management System allows candidates to manage their professional resumes through a comprehensive web interface. Candidates can upload, view, organize, and maintain multiple versions of their resumes.

## Features

### Core Functionality
- **Resume Upload**: Upload new resumes in various formats (PDF, DOC, DOCX, TXT)
- **Resume Viewing**: View resumes directly in the browser or download them
- **Primary Resume Management**: Set one resume as primary for job applications
- **Resume Organization**: Manage multiple resume versions
- **Resume Deletion**: Remove outdated or unnecessary resumes

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Card-based Layout**: Clean, organized display of resume information
- **Visual Indicators**: Clear identification of primary resume and file types
- **Action Buttons**: Easy access to view, download, and manage functions

## API Endpoints

### 1. Get All Resumes
- **Endpoint**: `GET /api/candidate/resume/upload`
- **Purpose**: Retrieve all resumes for the authenticated candidate
- **Response**: List of resumes with metadata and primary resume information

### 2. Update Resume
- **Endpoint**: `PUT /api/candidate/resume/manage`
- **Purpose**: Update resume properties (make primary, toggle fetch permissions)
- **Body**: `{ resume_id: string, is_primary?: boolean, is_allow_fetch?: boolean }`

### 3. Delete Resume
- **Endpoint**: `DELETE /api/candidate/resume/manage`
- **Purpose**: Remove a resume from the system
- **Body**: `{ resume_id: string }`

### 4. Get Resume by ID
- **Endpoint**: `GET /api/candidate/resume/[id]`
- **Purpose**: Retrieve a specific resume by its ID
- **Response**: Single resume with full metadata

## Database Schema

The system uses the following Prisma models:

### Resume Model
```prisma
model Resume {
  id                String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  candidate_id      String           @db.Uuid
  is_allow_fetch    Boolean?         @default(true)
  resume_url        String?
  original_filename String?          @db.VarChar(255)
  file_size         Int?
  file_type         String?          @db.VarChar(50)
  is_primary        Boolean?         @default(false)
  uploaded_at       DateTime?        @default(now())
  created_at        DateTime?        @default(now())
  updated_at        DateTime?        @updatedAt
  accomplishments   Accomplishment[]
  applications      Application[]
  candidate         Candidate        @relation(fields: [candidate_id], references: [user_id], onDelete: Cascade)
}
```

## File Management

### Supported File Types
- **PDF**: Portable Document Format (recommended)
- **DOC/DOCX**: Microsoft Word documents
- **TXT**: Plain text files

### File Size Limits
- Maximum file size: Configurable through environment variables
- Default: 10MB per file

### Storage
- Files are stored in Supabase storage
- Organized by candidate ID for security
- Public URLs generated for access

## Security Features

### Authentication
- JWT-based authentication required for all operations
- Role-based access control (candidates only)
- Token validation on every request

### Authorization
- Candidates can only access their own resumes
- Database-level constraints prevent unauthorized access
- File storage isolation by user

### Data Validation
- File type validation
- File size validation
- Input sanitization

## User Experience Features

### Visual Feedback
- Loading states during operations
- Success/error notifications via toast messages
- Confirmation dialogs for destructive actions

### Responsive Design
- Mobile-first approach
- Adaptive grid layout
- Touch-friendly interface

### Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support

## Integration Points

### Navigation
- Added to candidate sidebar under "Career Tools"
- Available in profile section as "Resume & Documents"
- Direct link from dashboard

### Related Features
- **CV Upload**: Seamless transition to upload new resumes
- **Profile Management**: Integrated with candidate profile system
- **Job Applications**: Primary resume automatically used for applications

## Error Handling

### Common Scenarios
- **Authentication Failures**: Redirect to login
- **File Not Found**: Clear error messages
- **Network Issues**: Retry mechanisms and user feedback
- **Validation Errors**: Field-specific error messages

### User Communication
- Toast notifications for immediate feedback
- Loading indicators for long operations
- Confirmation dialogs for important actions

## Performance Considerations

### Optimization
- Lazy loading of resume content
- Efficient database queries with proper indexing
- Image optimization for file previews

### Caching
- Browser-level caching for static assets
- API response caching where appropriate
- File URL caching for better performance

## Future Enhancements

### Planned Features
- **Resume Versioning**: Track changes and maintain history
- **Resume Templates**: Pre-built formats for different industries
- **Bulk Operations**: Manage multiple resumes simultaneously
- **Resume Analytics**: Track usage and performance metrics

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Search**: Filter and search through resume content
- **Export Options**: Multiple format support for downloads
- **Integration APIs**: Third-party service connections

## Development Notes

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL with UUID support
- **Storage**: Supabase storage service

### Code Organization
- **Components**: Reusable UI components in `/components/ui`
- **Pages**: Route-specific pages in `/app/candidate/resume-management`
- **API Routes**: Backend endpoints in `/app/api/candidate/resume`
- **Types**: TypeScript definitions in `/types/resume-management`
- **Services**: Business logic in `/services/resumeService`

### Testing
- API endpoints tested with proper authentication
- Frontend components tested for responsive behavior
- Error scenarios validated with appropriate user feedback

## Deployment

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `JWT_SECRET`: JWT signing secret

### Build Process
- Next.js build optimization
- Static asset optimization
- Environment-specific configurations

## Support and Maintenance

### Monitoring
- API endpoint health checks
- Error logging and alerting
- Performance metrics tracking

### Updates
- Regular dependency updates
- Security patch management
- Feature enhancement releases

---

This CV Management System provides a robust, secure, and user-friendly way for candidates to manage their professional resumes, ensuring they can present their best selves to potential employers.
