'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/public/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
  postedDate: string;
  skills: string[];
}

interface JobField {
  major: number;
  major_label: string;
  designations: JobDesignation[];
}

interface JobDesignation {
  id: number;
  name: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobField, setSelectedJobField] = useState<number | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<number | null>(null);
  const [jobFields, setJobFields] = useState<JobField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch job fields and designations
  useEffect(() => {
    const fetchJobFilters = async () => {
      try {
        const response = await fetch('/api/jobs/filters');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setJobFields(data.data.jobFields);
          }
        }
      } catch (error) {
        console.error('Error fetching job filters:', error);
      }
    };

    fetchJobFilters();
  }, []);

  // Sample job data - in a real app, this would come from an API
  useEffect(() => {
    const sampleJobs: Job[] = [
      {
        id: '1',
        title: 'Helpdesk Analyst',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$120k - $180k',
        experience: 'Senior',
        description: 'We are looking for a talented Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.',
        postedDate: '2 days ago',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB']
      },
      {
        id: '2',
        title: 'Frontend Developer',
        company: 'Digital Innovations Inc',
        location: 'Remote',
        type: 'Full-time',
        salary: '$80k - $120k',
        experience: 'Mid',
        description: 'Join our frontend team to build beautiful, responsive user interfaces. We use modern technologies and follow best practices.',
        postedDate: '1 week ago',
        skills: ['React', 'Vue.js', 'CSS3', 'JavaScript', 'Git']
      },
      {
        id: '3',
        title: 'DevOps Engineer',
        company: 'CloudTech Systems',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$100k - $150k',
        experience: 'Mid',
        description: 'Help us build and maintain our cloud infrastructure. Experience with AWS, Docker, and Kubernetes required.',
        postedDate: '3 days ago',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux']
      },
      {
        id: '4',
        title: 'Data Scientist',
        company: 'Analytics Pro',
        location: 'Austin, TX',
        type: 'Full-time',
        salary: '$90k - $140k',
        experience: 'Mid',
        description: 'Work with large datasets to extract insights and build predictive models. Python and machine learning experience required.',
        postedDate: '5 days ago',
        skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Scikit-learn']
      },
      {
        id: '5',
        title: 'Product Manager',
        company: 'Innovation Labs',
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: '$110k - $160k',
        experience: 'Senior',
        description: 'Lead product strategy and development for our flagship product. Experience in SaaS and B2B products preferred.',
        postedDate: '1 week ago',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'Stakeholder Management']
      },
      {
        id: '6',
        title: 'UX Designer',
        company: 'Creative Studios',
        location: 'Remote',
        type: 'Contract',
        salary: '$70k - $100k',
        experience: 'Mid',
        description: 'Create intuitive and beautiful user experiences. Strong portfolio and user research skills required.',
        postedDate: '4 days ago',
        skills: ['Figma', 'User Research', 'Prototyping', 'UI Design', 'User Testing']
      },
      {
        id: '7',
        title: 'Machine Learning Engineer',
        company: 'AI Innovations',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$130k - $200k',
        experience: 'Senior',
        description: 'Build and deploy machine learning models at scale. Experience with TensorFlow, PyTorch, and cloud platforms required.',
        postedDate: '1 day ago',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Docker', 'Kubernetes']
      },
      {
        id: '8',
        title: 'Cybersecurity Analyst',
        company: 'SecureNet Solutions',
        location: 'Washington, DC',
        type: 'Full-time',
        salary: '$90k - $140k',
        experience: 'Mid',
        description: 'Protect our systems from cyber threats. Experience with SIEM tools, incident response, and security frameworks required.',
        postedDate: '3 days ago',
        skills: ['SIEM', 'Incident Response', 'NIST Framework', 'Python', 'Network Security']
      },
      {
        id: '9',
        title: 'Blockchain Developer',
        company: 'CryptoCorp',
        location: 'Remote',
        type: 'Full-time',
        salary: '$100k - $160k',
        experience: 'Mid',
        description: 'Develop smart contracts and blockchain applications. Experience with Solidity, Ethereum, and DeFi protocols preferred.',
        postedDate: '5 days ago',
        skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'JavaScript', 'Web3.js']
      }
    ];

    setJobs(sampleJobs);
    setFilteredJobs(sampleJobs);
    setIsLoading(false);
  }, []);

    // Filter jobs based on search and filters
  useEffect(() => {
    setIsFiltering(true);
    
    // Use setTimeout to show filtering state briefly
    const timer = setTimeout(() => {
      let filtered = jobs;
      let filterLog: string[] = [];

      // Filter by search term
      if (searchTerm) {
        const beforeSearch = filtered.length;
        filtered = filtered.filter(job =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        filterLog.push(`Search "${searchTerm}": ${beforeSearch} → ${filtered.length} jobs`);
      }

      // Filter by job field (ISCO08 major category)
      if (selectedJobField) {
        const beforeField = filtered.length;
        const fieldKeywords = getFieldKeywords(selectedJobField);
        const fieldName = jobFields.find(f => f.major === selectedJobField)?.major_label;
        
        filtered = filtered.filter(job => 
          fieldKeywords.some(keyword => 
            job.title.toLowerCase().includes(keyword.toLowerCase()) ||
            job.description.toLowerCase().includes(keyword.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
          )
        );
        filterLog.push(`Field "${fieldName}": ${beforeField} → ${filtered.length} jobs`);
      }

      // Filter by specific job designation
      if (selectedDesignation) {
        const beforeDesignation = filtered.length;
        const designationName = getDesignationName(selectedDesignation);
        
        if (designationName) {
          filtered = filtered.filter(job =>
            job.title.toLowerCase().includes(designationName.toLowerCase()) ||
            job.description.toLowerCase().includes(designationName.toLowerCase())
          );
          filterLog.push(`Designation "${designationName}": ${beforeDesignation} → ${filtered.length} jobs`);
        }
      }

      // Log filtering results for debugging
      if (filterLog.length > 0) {
        console.log('Job filtering:', filterLog.join(', '));
      }

      setFilteredJobs(filtered);
      setIsFiltering(false);
    }, 100); // Small delay to show filtering state

    return () => clearTimeout(timer);
  }, [jobs, searchTerm, selectedJobField, selectedDesignation]);

  // Helper function to get keywords for job field filtering
  const getFieldKeywords = (fieldMajor: number): string[] => {
    const field = jobFields.find(f => f.major === fieldMajor);
    if (!field) return [];
    
    // Map ISCO08 major categories to relevant keywords for sample data
    const fieldKeywordMap: { [key: number]: string[] } = {
      1: ['manager', 'management', 'executive', 'director', 'supervisor'], // Managers
      2: ['professional', 'specialist', 'analyst', 'consultant'], // Professionals
      3: ['technician', 'technologist', 'associate'], // Technicians
      4: ['clerk', 'assistant', 'administrative', 'secretary'], // Clerical
      5: ['service', 'customer', 'sales', 'retail'], // Service and sales
      6: ['agricultural', 'farming', 'fishery'], // Agricultural
      7: ['craft', 'trade', 'artisan', 'construction'], // Craft and related trades
      8: ['operator', 'assembler', 'driver', 'machine'], // Plant and machine operators
      9: ['elementary', 'unskilled', 'laborer'], // Elementary occupations
      10: ['armed forces', 'military', 'defense'], // Armed forces
      11: ['information', 'technology', 'software', 'developer', 'engineer', 'data', 'cybersecurity'], // ICT professionals
      12: ['health', 'medical', 'nurse', 'doctor', 'therapist'], // Health professionals
      13: ['education', 'teacher', 'instructor', 'professor'], // Teaching professionals
      14: ['legal', 'lawyer', 'attorney', 'judge'], // Legal professionals
      15: ['finance', 'accounting', 'banking', 'investment'], // Finance professionals
      16: ['science', 'research', 'laboratory', 'scientist'], // Science professionals
      17: ['engineering', 'architect', 'designer'], // Engineering professionals
      18: ['arts', 'entertainment', 'media', 'journalist'], // Arts and media professionals
      19: ['sports', 'fitness', 'athlete', 'coach'], // Sports professionals
      20: ['social', 'welfare', 'counselor', 'psychologist'], // Social work professionals
      21: ['government', 'public', 'policy', 'administration'], // Government professionals
      22: ['business', 'marketing', 'advertising', 'public relations'], // Business professionals
      23: ['sales', 'marketing', 'advertising', 'retail'], // Sales and marketing professionals
      24: ['hospitality', 'tourism', 'hotel', 'restaurant'], // Hospitality and tourism professionals
      25: ['transport', 'logistics', 'supply chain'], // Transport and logistics professionals
      26: ['environmental', 'conservation', 'sustainability'], // Environmental professionals
      27: ['security', 'safety', 'protection'], // Security and safety professionals
      28: ['quality', 'compliance', 'audit'], // Quality and compliance professionals
      29: ['project', 'program', 'coordination'], // Project and program professionals
      30: ['consulting', 'advisory', 'strategy'], // Consulting and advisory professionals
    };
    
    return fieldKeywordMap[fieldMajor] || [];
  };

  // Helper function to get designation name for filtering
  const getDesignationName = (designationId: number): string | null => {
    if (!selectedJobField) return null;
    
    const field = jobFields.find(f => f.major === selectedJobField);
    if (!field) return null;
    
    const designation = field.designations.find(d => d.id === designationId);
    return designation?.name || null;
  };

  const handleApply = (jobId: string) => {
    // In a real app, this would redirect to the application form
    alert(`Application submitted for job ${jobId}. You will be redirected to complete your profile.`);
    // Redirect to candidate registration or login
    window.location.href = '/candidate/register';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <div className="pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          
          {/* Page Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Find Your Dream Job</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover thousands of job opportunities with all the information you need. 
              It's your future.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Job Field Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">Job Field</label>
                <select
                  value={selectedJobField || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newField = value ? parseInt(value) : null;
                    setSelectedJobField(newField);
                    // Reset designation when field changes
                    if (newField !== selectedJobField) {
                      setSelectedDesignation(null);
                    }
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="">All Job Fields</option>
                  {jobFields.length > 0 ? (
                    jobFields.map((field) => (
                      <option key={field.major} value={field.major}>
                        {field.major_label}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading job fields...</option>
                  )}
                </select>
              </div>

              {/* Job Designation Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">Job Designation</label>
                <select
                  value={selectedDesignation || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDesignation(value ? parseInt(value) : null);
                  }}
                //   disabled={!selectedJobField}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedJobField ? 'All Designations' : 'Select Job Field First'}
                  </option>
                  {selectedJobField && jobFields
                    .find(field => field.major === selectedJobField)
                    ?.designations.map((designation) => (
                      <option key={designation.id} value={designation.id}>
                        {designation.name}
                      </option>
                    )) || (
                      <option value="" disabled>No designations found</option>
                    )}
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedJobField(null);
                    setSelectedDesignation(null);
                  }}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2 sm:py-3"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count and Active Filters */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-gray-600 text-sm sm:text-base">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </p>
                {isFiltering && (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              
              {/* Active Filters Display */}
              {(selectedJobField || selectedDesignation) && (
                <div className="flex flex-wrap gap-2">
                  {selectedJobField && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Field: {jobFields.find(f => f.major === selectedJobField)?.major_label || 'Unknown'}
                      <button
                        onClick={() => setSelectedJobField(null)}
                        className="ml-1 text-emerald-600 hover:text-emerald-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedDesignation && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Role: {getDesignationName(selectedDesignation) || 'Unknown'}
                      <button
                        onClick={() => setSelectedDesignation(null)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job Listings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Job Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-emerald-600 font-medium text-sm">
                          {job.company}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                        {job.postedDate}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {job.description}
                    </p>
                  </div>

                  {/* Job Meta */}
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{job.location}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                      </svg>
                      <span>{job.type}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>{job.salary}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{job.experience} Level</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-2">
                    <Button
                      onClick={() => handleApply(job.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2"
                    >
                      Apply Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2"
                    >
                      Save Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedJobField(null);
                  setSelectedDesignation(null);
                }}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="bg-emerald-50 rounded-lg p-4 sm:p-6 lg:p-8 border border-emerald-200">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-3 sm:mb-4">
                Ready to Apply?
              </h3>
              <p className="text-emerald-700 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                Create your profile and start applying to these amazing opportunities. 
                Our platform makes it easy to manage your applications and track your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/candidate/register'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
                >
                  Create Account
                </Button>
                <Button
                  onClick={() => window.location.href = '/candidate/login'}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
