import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileSectionData } from '@/types/candidate-profile';

interface ProfileSectionProps {
  section: {
    id: string;
    title: string;
    data: ProfileSectionData;
    order: number;
  };
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ section }) => {
  const renderSectionContent = () => {
    switch (section.data.type) {
      case 'basic_info':
        return <BasicInfoSection data={section.data} />;
      case 'about':
        return <AboutSection data={section.data} />;
      case 'experience':
        return <ExperienceSection data={section.data} />;
      case 'education':
        return <EducationSection data={section.data} />;
      case 'skills':
        return <SkillsSection data={section.data} />;
      case 'projects':
        return <ProjectsSection data={section.data} />;
      case 'certificates':
        return <CertificatesSection data={section.data} />;
      case 'languages':
        return <LanguagesSection data={section.data} />;
      case 'awards':
        return <AwardsSection data={section.data} />;
      case 'volunteering':
        return <VolunteeringSection data={section.data} />;
      case 'accomplishments':
        return <AccomplishmentsSection data={section.data} />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderSectionContent()}
      </CardContent>
    </Card>
  );
};

// Basic Info Section Component
const BasicInfoSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    {/* Profile Header */}
    <div className="text-center">
      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
        {data.profile_image_url ? (
          <img 
            src={data.profile_image_url} 
            alt={`${data.first_name} ${data.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl text-gray-600 font-semibold">
            {data.first_name?.[0]}{data.last_name?.[0]}
          </span>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {data.first_name} {data.last_name}
      </h1>
      {data.title && (
        <p className="text-xl text-gray-600 mb-2">{data.title}</p>
      )}
      {data.current_position && (
        <p className="text-lg text-gray-600 mb-2">{data.current_position}</p>
      )}
      {data.industry && (
        <p className="text-gray-500 mb-4">{data.industry}</p>
      )}
    </div>

    {/* Contact & Location Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.location && (
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{data.location}</span>
        </div>
      )}
      {data.phone1 && (
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{data.phone1}</span>
        </div>
      )}
    </div>

    {/* Social Links */}
    {(data.linkedin_url || data.github_url || data.personal_website) && (
      <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
        {data.linkedin_url && (
          <a 
            href={data.linkedin_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        )}
        {data.github_url && (
          <a 
            href={data.github_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        )}
        {data.personal_website && (
          <a 
            href={data.personal_website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        )}
      </div>
    )}

    {/* Professional Summary */}
    {data.professional_summary && (
      <div className="pt-4 border-t border-gray-200">
        <p className="text-gray-700 leading-relaxed">{data.professional_summary}</p>
      </div>
    )}

    {/* Availability Status */}
    {data.availability_status && (
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            data.availability_status === 'available' 
              ? 'bg-gray-100 text-gray-800' 
              : data.availability_status === 'open_to_opportunities'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {data.availability_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        </div>
      </div>
    )}
  </div>
);

// About Section Component
const AboutSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    {data.about && (
      <div>
        <h4 className="font-medium text-gray-900 mb-2">About</h4>
        <p className="text-gray-700 leading-relaxed">{data.about}</p>
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.gender && (
        <div>
          <span className="text-sm font-medium text-gray-700">Gender:</span>
          <p className="text-gray-900">{data.gender.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
        </div>
      )}
      {data.date_of_birth && (
        <div>
          <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
          <p className="text-gray-900">{new Date(data.date_of_birth).toLocaleDateString()}</p>
        </div>
      )}
      {data.pronouns && (
        <div>
          <span className="text-sm font-medium text-gray-700">Pronouns:</span>
          <p className="text-gray-900">{data.pronouns}</p>
        </div>
      )}
      {data.expected_salary_min && data.expected_salary_max && (
        <div>
          <span className="text-sm font-medium text-gray-700">Salary Expectation:</span>
          <p className="text-gray-900">
            {data.expected_salary_min.toLocaleString()} - {data.expected_salary_max.toLocaleString()} {data.currency}
          </p>
        </div>
      )}
    </div>
  </div>
);

// Experience Section Component
const ExperienceSection: React.FC<{ data: any }> = ({ data }) => {
  // Group experiences by company
  const experiencesByCompany = data.experiences.reduce((acc: any, exp: any) => {
    const company = exp.company || 'Unknown Company';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(exp);
    return acc;
  }, {});

  // Calculate total duration for each company
  const getCompanyDuration = (experiences: any[]) => {
    if (experiences.length === 0) return '';
    
    const sortedExps = experiences.sort((a: any, b: any) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    
    const firstStart = new Date(sortedExps[0].start_date);
    const lastEnd = sortedExps[sortedExps.length - 1].is_current 
      ? new Date() 
      : new Date(sortedExps[sortedExps.length - 1].end_date);
    
    const diffTime = Math.abs(lastEnd.getTime() - firstStart.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    let duration = '';
    if (diffYears > 0) {
      duration += `${diffYears} yr${diffYears > 1 ? 's' : ''}`;
    }
    if (diffMonths > 0) {
      if (duration) duration += ' ';
      duration += `${diffMonths} mo${diffMonths > 1 ? 's' : ''}`;
    }
    
    return duration;
  };

  return (
    <div className="space-y-6">
      {Object.entries(experiencesByCompany).map(([company, companyExperiences]: [string, any]) => (
        <div key={company} className="border border-gray-200 rounded-lg p-6 bg-white">
          {/* Company Header */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Company Logo Placeholder */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-gray-600">
                  {company.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{company}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>Full-time</span>
                  <span>•</span>
                  <span>{getCompanyDuration(companyExperiences)}</span>
                  <span>•</span>
                  <span>Hybrid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Experiences */}
          <div className="space-y-4">
            {companyExperiences
              .sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
              .map((exp: any) => (
                <div key={exp.id} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{exp.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>
                          {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {' - '}
                          {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                        </span>
                        <span>•</span>
                        <span>{exp.location || 'Remote'}</span>
                      </div>
                      {exp.employment_type && (
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.employment_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {exp.description && (
                    <p className="text-gray-700 mb-3 leading-relaxed">{exp.description}</p>
                  )}
                  
                  {/* Skills */}
                  {exp.skill_ids && exp.skill_ids.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Skills: {exp.skill_ids.slice(0, 3).join(', ')}</span>
                        {exp.skill_ids.length > 3 && (
                          <span className="text-gray-500">and +{exp.skill_ids.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Accomplishments */}
                  {exp.accomplishments && exp.accomplishments.length > 0 && (
                    <div className="ml-4 mt-3">
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">Key Achievements:</h5>
                      <ul className="space-y-2">
                        {exp.accomplishments.map((acc: any) => (
                          <li key={acc.id} className="text-gray-700 text-sm border-l-2 border-gray-200 pl-3 py-1">
                            <span className="font-medium">{acc.title}</span>
                            {acc.description && (
                              <span className="text-gray-600">: {acc.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Education Section Component
const EducationSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    {data.educations.map((edu: any) => (
      <div key={edu.id} className="border-l-4  border border-gray-200 p-2 pl-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{edu.degree_diploma}</h4>
            <p className="text-gray-600 font-medium">{edu.university_school}</p>
            {edu.field_of_study && (
              <p className="text-gray-600">{edu.field_of_study}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {edu.start_date && new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' - '}
              {edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
            </span>
          </div>
        </div>
        {edu.grade && (
          <p className="text-gray-600 text-sm mb-2">Grade: {edu.grade}</p>
        )}
        {edu.description && (
          <p className="text-gray-700 mb-2">{edu.description}</p>
        )}
        {edu.activities_societies && (
          <p className="text-gray-600 text-sm">Activities: {edu.activities_societies}</p>
        )}
      </div>
    ))}
  </div>
);

// Skills Section Component
const SkillsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.skills.map((skill: any) => (
        <div key={skill.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="font-medium text-gray-900 mb-2">{skill.name}</div>
          {skill.category && (
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium"></span> {skill.category}
            </div>
          )}
          
        </div>
      ))}
    </div>
  </div>
);

// Projects Section Component
const ProjectsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    {data.projects.map((project: any) => (
      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
            {project.role && (
              <p className="text-gray-600 font-medium">{project.role}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {project.start_date && new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' - '}
              {project.is_current ? 'Present' : project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
            </span>
          </div>
        </div>
        {project.description && (
          <p className="text-gray-700 mb-3">{project.description}</p>
        )}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-3">
            <h5 className="font-medium text-gray-900 mb-2">Technologies:</h5>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        {project.url && (
          <a 
            href={project.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 text-sm inline-flex items-center gap-1"
          >
            View Project
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    ))}
  </div>
);

// Certificates Section Component
const CertificatesSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    {data.certificates.map((cert: any) => (
      <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
            <p className="text-gray-600 font-medium">{cert.issuing_authority}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {cert.issue_date && new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        {cert.description && (
          <p className="text-gray-700 mb-2">{cert.description}</p>
        )}
        {cert.credential_url && (
          <a 
            href={cert.credential_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 text-sm inline-flex items-center gap-1"
          >
            Verify Credential
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    ))}
  </div>
);

// Languages Section Component
const LanguagesSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    {data.languages.map((lang: any) => (
      <div key={lang.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div>
          <span className="font-medium text-gray-900">{lang.language}</span>
          {lang.is_native && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              Native
            </span>
          )}
        </div>
        <div className="text-right">
                      {lang.oral_proficiency && (
              <div className="text-sm text-gray-600">
                Oral: {lang.oral_proficiency.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </div>
            )}
            {lang.written_proficiency && (
              <div className="text-sm text-gray-600">
                Written: {lang.written_proficiency.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </div>
            )}
        </div>
      </div>
    ))}
  </div>
);

// Awards Section Component
const AwardsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    {data.awards.map((award: any) => (
      <div key={award.id} className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{award.title}</h4>
            {award.associated_with && (
              <p className="text-gray-600 font-medium">{award.associated_with}</p>
            )}
            {award.offered_by && (
              <p className="text-gray-600">{award.offered_by}</p>
            )}
          </div>
          {award.date && (
            <span className="text-sm text-gray-500">
              {new Date(award.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        {award.description && (
          <p className="text-gray-700">{award.description}</p>
        )}
      </div>
    ))}
  </div>
);

// Volunteering Section Component
const VolunteeringSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    {data.volunteering.map((vol: any) => (
      <div key={vol.id} className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{vol.role}</h4>
            <p className="text-gray-600 font-medium">{vol.institution}</p>
            {vol.cause && (
              <p className="text-gray-600">{vol.cause}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {vol.start_date && new Date(vol.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' - '}
              {vol.is_current ? 'Present' : vol.end_date ? new Date(vol.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
            </span>
          </div>
        </div>
        {vol.description && (
          <p className="text-gray-700">{vol.description}</p>
        )}
      </div>
    ))}
  </div>
);

// Accomplishments Section Component
const AccomplishmentsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    {data.accomplishments.map((acc: any) => (
      <div key={acc.id} className="border-l-4 border-gray-500 pl-4 py-2">
        <h4 className="font-medium text-gray-900 mb-1">{acc.title}</h4>
        {acc.description && (
          <p className="text-gray-700 text-sm">{acc.description}</p>
        )}
        {acc.created_at && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(acc.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    ))}
  </div>
);
