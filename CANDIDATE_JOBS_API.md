# Candidate Jobs API Documentation

## Overview
The Candidate Jobs API provides comprehensive job search, filtering, and browsing capabilities for candidates in the Job Genie system. This API allows candidates to discover jobs posted by both employers and MIS users, with advanced filtering, search, and pagination features.

## API Endpoints

### 1. Get Jobs List
**Endpoint:** `GET /api/candidate/jobs`

Retrieves a paginated list of published jobs with comprehensive filtering options.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search keyword for job title, description, or company name | `?search=software engineer` |
| `location` | string | Filter by job location | `?location=Colombo` |
| `remote_type` | enum | Filter by remote work type | `?remote_type=remote` |
| `job_type` | enum | Filter by employment type | `?job_type=full_time` |
| `experience_level` | enum | Filter by experience level | `?experience_level=mid` |
| `salary_min` | number | Minimum salary filter | `?salary_min=50000` |
| `salary_max` | number | Maximum salary filter | `?salary_max=150000` |
| `currency` | string | Salary currency filter | `?currency=LKR` |
| `industry` | string | Filter by company industry | `?industry=Technology` |
| `company_size` | enum | Filter by company size | `?company_size=startup` |
| `posted_after` | datetime | Filter jobs posted after date | `?posted_after=2024-01-01T00:00:00Z` |
| `posted_before` | datetime | Filter jobs posted before date | `?posted_before=2024-12-31T23:59:59Z` |
| `page` | number | Page number for pagination (default: 1) | `?page=2` |
| `limit` | number | Number of jobs per page (default: 20, max: 100) | `?limit=10` |
| `sort_by` | enum | Sort field (default: created_at) | `?sort_by=salary_max` |
| `sort_order` | enum | Sort direction (default: desc) | `?sort_order=asc` |

#### Enum Values

**Remote Types:** `remote`, `hybrid`, `onsite`
**Job Types:** `full_time`, `part_time`, `contract`, `internship`, `freelance`
**Experience Levels:** `entry`, `junior`, `mid`, `senior`, `lead`, `principal`
**Company Sizes:** `startup`, `one_to_ten`, `eleven_to_fifty`, `fifty_one_to_two_hundred`, `two_hundred_one_to_five_hundred`, `five_hundred_one_to_one_thousand`, `one_thousand_plus`
**Sort Fields:** `created_at`, `published_at`, `salary_min`, `salary_max`, `views_count`, `applications_count`
**Sort Orders:** `asc`, `desc`

#### Response Format

```json
{
  "message": "Jobs retrieved successfully",
  "jobs": [
    {
      "id": "uuid",
      "title": "Software Engineer",
      "description": "Job description...",
      "job_type": "full_time",
      "experience_level": "mid",
      "location": "Colombo, Sri Lanka",
      "remote_type": "hybrid",
      "salary_min": 80000,
      "salary_max": 120000,
      "currency": "LKR",
      "salary_type": "annual",
      "equity_offered": false,
      "ai_skills_required": true,
      "application_deadline": "2024-12-31T23:59:59Z",
      "status": "published",
      "published_at": "2024-01-15T10:00:00Z",
      "priority_level": 1,
      "views_count": 150,
      "applications_count": 25,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      
      "company": {
        "id": "uuid",
        "name": "TechCorp",
        "industry": "Technology",
        "company_size": "fifty_one_to_two_hundred",
        "company_type": "corporation",
        "headquarters_location": "Colombo, Sri Lanka",
        "logo_url": "https://example.com/logo.png",
        "website": "https://techcorp.com"
      },
      
      "customCompanyName": null,
      "customCompanyEmail": null,
      "customCompanyPhone": null,
      "customCompanyWebsite": null,
      
      "jobDesignation": {
        "id": 1,
        "name": "Software Developer"
      },
      
      "skills": [
        {
          "id": "uuid",
          "name": "JavaScript",
          "category": "programming",
          "required_level": "required",
          "proficiency_level": "intermediate",
          "years_required": 3,
          "weight": 1.0
        }
      ]
    }
  ],
  
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_jobs": 100,
    "has_next": true,
    "has_previous": false,
    "next_page": 2,
    "previous_page": null
  },
  
  "filters": {
    "applied_filters": {
      "search": "software engineer",
      "location": "Colombo",
      "remote_type": "hybrid"
    },
    "available_filters": {
      "experience_levels": ["entry", "junior", "mid", "senior"],
      "job_types": ["full_time", "part_time", "contract"],
      "remote_types": ["remote", "hybrid", "onsite"],
      "industries": ["Technology", "Finance", "Healthcare"],
      "company_sizes": ["startup", "one_to_ten", "eleven_to_fifty"],
      "salary_ranges": [
        { "min": 50000, "max": 100000, "currency": "LKR" },
        { "min": 100000, "max": 200000, "currency": "LKR" }
      ]
    }
  }
}
```

### 2. Get Job Details
**Endpoint:** `GET /api/candidate/jobs/{id}`

Retrieves detailed information about a specific job, including company details, skills, and related jobs.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Job UUID |

#### Response Format

```json
{
  "message": "Job details retrieved successfully",
  "job": {
    "id": "uuid",
    "title": "Software Engineer",
    "description": "Detailed job description...",
    "job_type": "full_time",
    "experience_level": "mid",
    "location": "Colombo, Sri Lanka",
    "remote_type": "hybrid",
    "salary_min": 80000,
    "salary_max": 120000,
    "currency": "LKR",
    "salary_type": "annual",
    "equity_offered": false,
    "ai_skills_required": true,
    "application_deadline": "2024-12-31T23:59:59Z",
    "status": "published",
    "published_at": "2024-01-15T10:00:00Z",
    "priority_level": 1,
    "views_count": 151,
    "applications_count": 25,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    
    "company": {
      "id": "uuid",
      "name": "TechCorp",
      "email": "hr@techcorp.com",
      "industry": "Technology",
      "company_size": "fifty_one_to_two_hundred",
      "company_type": "corporation",
      "headquarters_location": "Colombo, Sri Lanka",
      "description": "Leading technology company...",
      "logo_url": "https://example.com/logo.png",
      "website": "https://techcorp.com",
      "benefits": "Health insurance, flexible hours...",
      "culture_description": "Innovative and collaborative...",
      "founded_year": 2010,
      "social_media_links": {},
      "verification_status": "verified"
    },
    
    "customCompanyName": null,
    "customCompanyEmail": null,
    "customCompanyPhone": null,
    "customCompanyWebsite": null,
    
    "jobDesignation": {
      "id": 1,
      "name": "Software Developer",
      "iscoUnitGroup": {
        "id": 1,
        "name": "Software and Applications Developers and Analysts",
        "minorGroup": {
          "id": 1,
          "name": "Software Developers",
          "subMajorGroup": {
            "id": 1,
            "name": "Information and Communications Technology Professionals",
            "majorGroup": {
              "id": 1,
              "code": "25",
              "label": "Information and Communications Technology Professionals"
            }
          }
        }
      }
    },
    
    "skills": [
      {
        "id": "uuid",
        "name": "JavaScript",
        "category": "programming",
        "description": "Modern JavaScript development",
        "required_level": "required",
        "proficiency_level": "intermediate",
        "years_required": 3,
        "weight": 1.0
      }
    ],
    
    "creator_type": "employer",
    "creator_mis_user": null
  },
  
  "related_jobs": [
    {
      "id": "uuid",
      "title": "Full Stack Developer",
      "company_name": "TechCorp",
      "customCompanyName": null,
      "location": "Colombo, Sri Lanka",
      "remote_type": "hybrid",
      "salary_min": 90000,
      "salary_max": 130000,
      "currency": "LKR",
      "experience_level": "mid",
      "job_type": "full_time",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### 3. Get Available Filters
**Endpoint:** `GET /api/candidate/jobs/filters`

Retrieves all available filters and search suggestions for the job search interface.

#### Response Format

```json
{
  "message": "Job filters retrieved successfully",
  "filters": {
    "experience_levels": [
      {
        "value": "entry",
        "label": "Entry",
        "count": 45
      }
    ],
    "job_types": [
      {
        "value": "full_time",
        "label": "Full Time",
        "count": 120
      }
    ],
    "remote_types": [
      {
        "value": "remote",
        "label": "Remote",
        "count": 35
      }
    ],
    "industries": [
      {
        "value": "Technology",
        "label": "Technology",
        "count": 80
      }
    ],
    "company_sizes": [
      {
        "value": "startup",
        "label": "Startup",
        "count": 25
      }
    ],
    "salary_ranges": [
      {
        "min": 50000,
        "max": 100000,
        "currency": "LKR",
        "count": 60
      }
    ],
    "popular_skills": [
      {
        "id": "uuid",
        "name": "JavaScript",
        "category": "programming",
        "count": 45
      }
    ],
    "popular_locations": [
      {
        "value": "Colombo",
        "count": 80
      }
    ],
    "job_designations": [
      {
        "id": 1,
        "name": "Software Developer",
        "count": 35
      }
    ]
  },
  
  "search_suggestions": {
    "popular_searches": [
      "Software Engineer",
      "Data Scientist",
      "Product Manager"
    ],
    "trending_keywords": [
      "AI",
      "Remote Work",
      "Blockchain"
    ],
    "skill_suggestions": [
      "JavaScript",
      "Python",
      "React"
    ],
    "company_suggestions": [
      "TechCorp",
      "InnovateLabs",
      "Digital Solutions"
    ]
  }
}
```

## Features

### 1. **Advanced Search & Filtering**
- **Text Search**: Search across job titles, descriptions, and company names
- **Location Filtering**: Filter by specific locations
- **Remote Work Options**: Filter by remote, hybrid, or onsite work
- **Employment Type**: Filter by full-time, part-time, contract, etc.
- **Experience Level**: Filter by entry, junior, mid, senior, lead, principal
- **Salary Range**: Filter by minimum and maximum salary with currency support
- **Industry Filtering**: Filter by company industry
- **Company Size**: Filter by company size categories
- **Date Filtering**: Filter by job posting date

### 2. **Pagination & Sorting**
- **Pagination**: Configurable page size with navigation
- **Sorting**: Sort by various fields (date, salary, views, applications)
- **Order Control**: Ascending or descending sort order

### 3. **Rich Job Information**
- **Company Details**: Full company information for verified companies
- **Custom Company Info**: Support for jobs posted by MIS users
- **Skills Required**: Detailed skill requirements with proficiency levels
- **Job Designation**: ISCO classification system integration
- **Related Jobs**: AI-powered job recommendations

### 4. **Performance Optimizations**
- **Parallel Queries**: Efficient database queries for filters
- **Smart Caching**: Optimized filter generation
- **View Tracking**: Automatic view count increments
- **Related Job Suggestions**: Intelligent job matching

## Error Handling

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Job not found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "message": "Expected number, received string",
      "path": ["salary_min"]
    }
  ]
}
```

## Usage Examples

### Basic Job Search
```typescript
const response = await fetch('/api/candidate/jobs?search=developer&location=Colombo');
const data = await response.json();
```

### Advanced Filtering
```typescript
const params = new URLSearchParams({
  search: 'software engineer',
  location: 'Colombo',
  remote_type: 'hybrid',
  experience_level: 'mid',
  salary_min: '80000',
  salary_max: '150000',
  currency: 'LKR',
  page: '1',
  limit: '20'
});

const response = await fetch(`/api/candidate/jobs?${params}`);
const data = await response.json();
```

### Get Job Details
```typescript
const response = await fetch('/api/candidate/jobs/job-uuid-here');
const data = await response.json();
```

### Get Available Filters
```typescript
const response = await fetch('/api/candidate/jobs/filters');
const data = await response.json();
```

## Database Integration

The API integrates with the following Prisma models:
- **Job**: Core job information
- **Company**: Company details for employer-posted jobs
- **JobSkill**: Skills required for each job
- **Skill**: Skill definitions and categories
- **JobDesignation**: ISCO job classification system
- **IscoUnitGroup**: ISCO hierarchy integration

## Security Features

- **Published Jobs Only**: Only shows jobs with `status: 'published'`
- **Input Validation**: Comprehensive Zod schema validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Rate Limiting Ready**: Prepared for rate limiting implementation

## Performance Considerations

- **Efficient Queries**: Optimized database queries with proper indexing
- **Parallel Processing**: Multiple database queries run concurrently
- **Pagination**: Prevents large result sets from overwhelming the system
- **Smart Filtering**: Filters are applied at the database level

## Future Enhancements

- **AI-Powered Job Matching**: Machine learning-based job recommendations
- **Advanced Analytics**: Job market insights and trends
- **Real-time Updates**: WebSocket support for live job updates
- **Saved Searches**: User-specific search preferences
- **Job Alerts**: Email notifications for new matching jobs
