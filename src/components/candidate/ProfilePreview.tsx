import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { CandidateProfileResponse, BasicInfoSection, ExperienceSection, EducationSection, SkillsSection, ProjectsSection, CertificatesSection, LanguagesSection, AwardsSection, VolunteeringSection } from '@/types/candidate-profile';

interface MergeResults {
  basic_info_updated: boolean;
  new_work_experiences: number;
  new_educations: number;
  new_certificates: number;
  new_projects: number;
  new_skills: number;
  new_awards: number;
  new_volunteering: number;
  new_languages: number;
  new_accomplishments: number;
  skipped_duplicates: {
    work_experiences: number;
    educations: number;
    certificates: number;
    projects: number;
    skills: number;
    awards: number;
    volunteering: number;
    languages: number;
    accomplishments: number;
  };
}

interface ExtractedBasicInfo {
  first_name?: string;
  last_name?: string;
  title?: string;
  current_position?: string;
  industry?: string;
  bio?: string;
  about?: string;
  country?: string;
  city?: string;
  location?: string;
  address?: string;
  phone1?: string;
  phone2?: string;
  personal_website?: string;
  github_url?: string;
  linkedin_url?: string;
  years_of_experience?: number;
  gender?: string;
  date_of_birth?: string;
  nic?: string;
  passport?: string;
  remote_preference?: string;
  experience_level?: string;
  expected_salary_min?: number;
  expected_salary_max?: number;
  currency?: string;
  availability_status?: string;
  availability_date?: string;
  professional_summary?: string;
  total_years_experience?: number;
  open_to_relocation?: boolean;
  willing_to_travel?: boolean;
  security_clearance?: boolean;
  disability_status?: string;
  veteran_status?: string;
  pronouns?: string;
  salary_visibility?: string;
  notice_period?: number;
  work_authorization?: string;
  visa_assistance_needed?: boolean;
  work_availability?: string;
  interview_ready?: boolean;
  pre_qualified?: boolean;
}

interface ExtractedWorkExperience {
  title: string;
  company: string;
  employment_type: string;
  is_current: boolean;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface ExtractedEducation {
  degree_diploma: string;
  university_school: string;
  field_of_study?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  activities_societies?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface ExtractedCertificate {
  name: string;
  issuing_authority: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface ExtractedProject {
  name: string;
  description: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  role?: string;
  responsibilities?: string[];
  technologies?: string[];
  tools?: string[];
  methodologies?: string[];
  is_confidential: boolean;
  can_share_details: boolean;
  url?: string;
  repository_url?: string;
  media_urls?: string[];
  skills_gained?: string[];
}

interface ExtractedSkill {
  name: string;
  category?: string;
  description?: string;
  proficiency?: number;
}

interface ExtractedAward {
  title: string;
  offered_by: string;
  associated_with?: string;
  date: string;
  description?: string;
  media_url?: string;
  skill_ids?: string[];
}

interface ExtractedVolunteering {
  role: string;
  institution: string;
  cause?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  media_url?: string;
}

interface ExtractedLanguage {
  language: string;
  is_native: boolean;
  oral_proficiency?: string;
  written_proficiency?: string;
}

interface ExtractedData {
  basic_info: ExtractedBasicInfo;
  work_experiences: ExtractedWorkExperience[];
  educations: ExtractedEducation[];
  certificates: ExtractedCertificate[];
  projects: ExtractedProject[];
  skills: ExtractedSkill[];
  awards: ExtractedAward[];
  volunteering: ExtractedVolunteering[];
  languages: ExtractedLanguage[];
  accomplishments: Array<{
    title: string;
    description: string;
    work_experience_id?: string;
    resume_id?: string;
  }>;
}

interface ProfilePreviewProps {
  existingProfile: CandidateProfileResponse['data'] | null;
  newData: ExtractedData | null;
  mergeResults: MergeResults | null;
  onViewProfile: () => void;
  onUploadAnother: () => void;
}

export function ProfilePreview({ 
  existingProfile, 
  newData, 
  mergeResults, 
  onViewProfile, 
  onUploadAnother 
}: ProfilePreviewProps) {
  const renderBasicInfo = () => {
    const basicInfoSection = existingProfile?.sections?.find((s) => s.data.type === 'basic_info');
    const basicInfo = basicInfoSection?.data as BasicInfoSection | undefined;
    const newBasicInfo = newData?.basic_info;
    
    if (!basicInfo && !newBasicInfo) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Basic Information
            {mergeResults?.basic_info_updated && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Updated
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={basicInfo?.first_name || newBasicInfo?.first_name || ''}
              readOnly
              className={newBasicInfo?.first_name && !basicInfo?.first_name ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Last Name"
              value={basicInfo?.last_name || newBasicInfo?.last_name || ''}
              readOnly
              className={newBasicInfo?.last_name && !basicInfo?.last_name ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Professional Title"
              value={basicInfo?.title || newBasicInfo?.title || ''}
              readOnly
              className={newBasicInfo?.title && !basicInfo?.title ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Current Position"
              value={basicInfo?.current_position || newBasicInfo?.current_position || ''}
              readOnly
              className={newBasicInfo?.current_position && !basicInfo?.current_position ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Industry"
              value={basicInfo?.industry || newBasicInfo?.industry || ''}
              readOnly
              className={newBasicInfo?.industry && !basicInfo?.industry ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Location"
              value={basicInfo?.location || newBasicInfo?.location || ''}
              readOnly
              className={newBasicInfo?.location && !basicInfo?.location ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Phone"
              value={basicInfo?.phone1 || newBasicInfo?.phone1 || ''}
              readOnly
              className={newBasicInfo?.phone1 && !basicInfo?.phone1 ? 'border-green-300 bg-green-50' : ''}
            />
            <FormInput
              label="Years of Experience"
              value={(basicInfo?.years_of_experience || newBasicInfo?.years_of_experience || 0).toString()}
              readOnly
              className={newBasicInfo?.years_of_experience && !basicInfo?.years_of_experience ? 'border-green-300 bg-green-50' : ''}
            />
          </div>
          
          {(basicInfo?.bio || newBasicInfo?.bio) && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <p className="text-gray-600 text-sm">{basicInfo?.bio || newBasicInfo?.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWorkExperience = () => {
    const experienceSection = existingProfile?.sections?.find((s) => s.data.type === 'experience');
    const existingExp = (experienceSection?.data as ExperienceSection | undefined)?.experiences || [];
    const newExp = newData?.work_experiences || [];
    
    if (existingExp.length === 0 && newExp.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Work Experience
            {mergeResults?.new_work_experiences > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_work_experiences} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing experiences */}
            {existingExp.map((exp, index) => (
              <div key={`existing-${index}`} className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.start_date && new Date(exp.start_date).toLocaleDateString()} - {exp.is_current ? 'Present' : (exp.end_date && new Date(exp.end_date).toLocaleDateString()) || 'Not specified'}
                </p>
                <p className="text-sm text-gray-500">
                  {exp.employment_type} • {exp.location || 'Location not specified'}
                </p>
                {exp.description && (
                  <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                )}
              </div>
            ))}
            
            {/* New experiences */}
            {newExp.map((exp, index) => (
              <div key={`new-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || 'Not specified'}
                </p>
                <p className="text-sm text-gray-500">
                  {exp.employment_type} • {exp.location || 'Location not specified'}
                </p>
                {exp.description && (
                  <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEducation = () => {
    const educationSection = existingProfile?.sections?.find((s) => s.data.type === 'education');
    const existingEdu = (educationSection?.data as EducationSection | undefined)?.educations || [];
    const newEdu = newData?.educations || [];
    
    if (existingEdu.length === 0 && newEdu.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Education
            {mergeResults?.new_educations > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_educations} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing education */}
            {existingEdu.map((edu, index) => (
              <div key={`existing-edu-${index}`} className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">{edu.degree_diploma}</h4>
                <p className="text-gray-600">{edu.university_school}</p>
                <p className="text-sm text-gray-500">
                  {edu.field_of_study && `${edu.field_of_study} • `}
                  {edu.start_date && new Date(edu.start_date).toLocaleDateString()} - {edu.end_date && new Date(edu.end_date).toLocaleDateString() || 'Not specified'}
                </p>
                {edu.grade && (
                  <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                )}
                {edu.description && (
                  <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                )}
              </div>
            ))}
            
            {/* New education */}
            {newEdu.map((edu, index) => (
              <div key={`new-edu-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{edu.degree_diploma}</h4>
                <p className="text-gray-600">{edu.university_school}</p>
                <p className="text-sm text-gray-500">
                  {edu.field_of_study && `${edu.field_of_study} • `}
                  {edu.start_date} - {edu.end_date || 'Not specified'}
                </p>
                {edu.grade && (
                  <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                )}
                {edu.description && (
                  <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSkills = () => {
    const skillsSection = existingProfile?.sections?.find((s) => s.data.type === 'skills');
    const existingSkills = (skillsSection?.data as SkillsSection | undefined)?.skills || [];
    const newSkills = newData?.skills || [];
    
    if (existingSkills.length === 0 && newSkills.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Skills
            {mergeResults?.new_skills > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_skills} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing skills */}
            {existingSkills.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Existing Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {existingSkills.map((skill, index) => (
                    <span
                      key={`existing-skill-${index}`}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                    >
                      {skill.name}
                      {skill.proficiency && ` (${skill.proficiency}%)`}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* New skills */}
            {newSkills.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  Newly Added Skills
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    New
                  </span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {newSkills.map((skill, index) => (
                    <span
                      key={`new-skill-${index}`}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-300"
                    >
                      {skill.name}
                      {skill.proficiency && ` (${skill.proficiency}%)`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProjects = () => {
    const projectsSection = existingProfile?.sections?.find((s) => s.data.type === 'projects');
    const existingProjects = (projectsSection?.data as ProjectsSection | undefined)?.projects || [];
    const newProjects = newData?.projects || [];
    
    if (existingProjects.length === 0 && newProjects.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Projects
            {mergeResults?.new_projects > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_projects} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing projects */}
            {existingProjects.map((project, index) => (
              <div key={`existing-project-${index}`} className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                <p className="text-gray-600">{project.role || 'Role not specified'}</p>
                <p className="text-sm text-gray-500">
                  {project.start_date && new Date(project.start_date).toLocaleDateString()} - {project.is_current ? 'Present' : (project.end_date && new Date(project.end_date).toLocaleDateString()) || 'Not specified'}
                </p>
                <p className="text-sm text-gray-500">
                  Technologies: {project.technologies?.join(', ') || 'Not specified'}
                </p>
                {project.description && (
                  <p className="text-gray-700 mt-2 text-sm">{project.description}</p>
                )}
              </div>
            ))}
            
            {/* New projects */}
            {newProjects.map((project, index) => (
              <div key={`new-project-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                <p className="text-gray-600">{project.role || 'Role not specified'}</p>
                <p className="text-sm text-gray-500">
                  {project.start_date && `${project.start_date} - ${project.is_current ? 'Present' : project.end_date || 'Not specified'}`}
                </p>
                <p className="text-sm text-gray-500">
                  Technologies: {project.technologies?.join(', ') || 'Not specified'}
                </p>
                {project.description && (
                  <p className="text-gray-700 mt-2 text-sm">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCertificates = () => {
    const certificatesSection = existingProfile?.sections?.find((s) => s.data.type === 'certificates');
    const existingCerts = (certificatesSection?.data as CertificatesSection | undefined)?.certificates || [];
    const newCerts = newData?.certificates || [];
    
    if (existingCerts.length === 0 && newCerts.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Certificates
            {mergeResults?.new_certificates > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_certificates} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing certificates */}
            {existingCerts.map((cert, index) => (
              <div key={`existing-cert-${index}`} className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                <p className="text-gray-600">Issued by: {cert.issuing_authority}</p>
                <p className="text-sm text-gray-500">
                  {cert.issue_date && new Date(cert.issue_date).toLocaleDateString()}
                  {cert.expiry_date && ` • Expiry: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                </p>
                {cert.description && (
                  <p className="text-gray-700 mt-2 text-sm">{cert.description}</p>
                )}
              </div>
            ))}
            
            {/* New certificates */}
            {newCerts.map((cert, index) => (
              <div key={`new-cert-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                <p className="text-gray-600">Issued by: {cert.issuing_authority}</p>
                <p className="text-sm text-gray-500">
                  {cert.issue_date && `Issue Date: ${cert.issue_date}`}
                  {cert.expiry_date && ` • Expiry: ${cert.expiry_date}`}
                </p>
                {cert.description && (
                  <p className="text-gray-700 mt-2 text-sm">{cert.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVolunteering = () => {
    const existingVol = existingProfile?.sections?.find((s) => s.data.type === 'volunteering')?.data?.volunteering || [];
    const newVol = newData?.volunteering || [];
    
    if (existingVol.length === 0 && newVol.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Volunteering
            {mergeResults?.new_volunteering > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_volunteering} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing volunteering */}
            {existingVol.map((vol, index) => (
              <div key={`existing-vol-${index}`} className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">{vol.role}</h4>
                <p className="text-gray-600">{vol.institution}</p>
                <p className="text-sm text-gray-500">
                  {vol.start_date && new Date(vol.start_date).toLocaleDateString()} - {vol.is_current ? 'Present' : (vol.end_date && new Date(vol.end_date).toLocaleDateString()) || 'Not specified'}
                </p>
                {vol.cause && (
                  <p className="text-sm text-gray-500">Cause: {vol.cause}</p>
                )}
                {vol.description && (
                  <p className="text-gray-700 mt-2 text-sm">{vol.description}</p>
                )}
              </div>
            ))}
            
            {/* New volunteering */}
            {newVol.map((vol, index) => (
              <div key={`new-vol-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{vol.role}</h4>
                <p className="text-gray-600">{vol.institution}</p>
                <p className="text-sm text-gray-500">
                  {vol.start_date} - {vol.is_current ? 'Present' : vol.end_date || 'Not specified'}
                </p>
                {vol.cause && (
                  <p className="text-sm text-gray-500">Cause: {vol.cause}</p>
                )}
                {vol.description && (
                  <p className="text-gray-700 mt-2 text-sm">{vol.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAwards = () => {
    const existingAwards = existingProfile?.sections?.find((s) => s.data.type === 'awards')?.data?.awards || [];
    const newAwards = newData?.awards || [];
    
    if (existingAwards.length === 0 && newAwards.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Awards
            {mergeResults?.new_awards > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_awards} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing awards */}
            {existingAwards.map((award, index) => (
              <div key={`existing-award-${index}`} className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-semibold text-gray-900">{award.title}</h4>
                <p className="text-gray-600">Offered by: {award.offered_by}</p>
                <p className="text-sm text-gray-500">
                  Date: {award.date && new Date(award.date).toLocaleDateString()}
                  {award.associated_with && ` • Associated: ${award.associated_with}`}
                </p>
                {award.description && (
                  <p className="text-gray-700 mt-2 text-sm">{award.description}</p>
                )}
              </div>
            ))}
            
            {/* New awards */}
            {newAwards.map((award, index) => (
              <div key={`new-award-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{award.title}</h4>
                <p className="text-gray-600">Offered by: {award.offered_by}</p>
                <p className="text-sm text-gray-500">
                  Date: {award.date}
                  {award.associated_with && ` • Associated: ${award.associated_with}`}
                </p>
                {award.description && (
                  <p className="text-gray-700 mt-2 text-sm">{award.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLanguages = () => {
    const existingLangs = existingProfile?.sections?.find((s) => s.data.type === 'languages')?.data?.languages || [];
    const newLangs = newData?.languages || [];
    
    if (existingLangs.length === 0 && newLangs.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Languages
            {mergeResults?.new_languages > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_languages} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing languages */}
            {existingLangs.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Existing Languages</h5>
                <div className="flex flex-wrap gap-2">
                  {existingLangs.map((lang, index) => (
                    <span
                      key={`existing-lang-${index}`}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                    >
                      {lang.language} ({lang.oral_proficiency || 'Not specified'})
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* New languages */}
            {newLangs.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  Newly Added Languages
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    New
                  </span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {newLangs.map((lang, index) => (
                    <span
                      key={`new-lang-${index}`}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-300"
                    >
                      {lang.language} ({lang.oral_proficiency || 'Not specified'})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAccomplishments = () => {
    const newAccomplishments = newData?.accomplishments || [];
    
    if (newAccomplishments.length === 0) return null;

    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Accomplishments
            {mergeResults?.new_accomplishments > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{mergeResults.new_accomplishments} New
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* New accomplishments */}
            {newAccomplishments.map((accomplishment, index) => (
              <div key={`new-accomplishment-${index}`} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Newly Added
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{accomplishment.title}</h4>
                {accomplishment.description && (
                  <p className="text-gray-700 mt-2 text-sm">{accomplishment.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">CV Processed Successfully</h2>
        <p className="text-green-700">
          Your CV has been processed and new information has been added to your profile.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-white border-0 shadow-md">
        <CardContent className="p-6 text-center">
          {(() => {
            const totalNewItems = (mergeResults?.new_work_experiences || 0) + 
                                 (mergeResults?.new_educations || 0) + 
                                 (mergeResults?.new_skills || 0) + 
                                 (mergeResults?.new_projects || 0) + 
                                 (mergeResults?.new_certificates || 0) + 
                                 (mergeResults?.new_awards || 0) + 
                                 (mergeResults?.new_volunteering || 0) + 
                                 (mergeResults?.new_languages || 0) + 
                                 (mergeResults?.new_accomplishments || 0);
            
            if (totalNewItems === 0) {
              return (
                <div className="text-gray-600">
                  <div className="text-lg font-medium mb-2">No New Items Added</div>
                  <div className="text-sm">Your profile already contains all the information from this CV.</div>
                </div>
              );
            }
            
            const sections = [];
            if (mergeResults?.new_work_experiences > 0) {
              sections.push(`${mergeResults.new_work_experiences} new work experience${mergeResults.new_work_experiences > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_educations > 0) {
              sections.push(`${mergeResults.new_educations} new education${mergeResults.new_educations > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_skills > 0) {
              sections.push(`${mergeResults.new_skills} new skill${mergeResults.new_skills > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_projects > 0) {
              sections.push(`${mergeResults.new_projects} new project${mergeResults.new_projects > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_certificates > 0) {
              sections.push(`${mergeResults.new_certificates} new certificate${mergeResults.new_certificates > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_awards > 0) {
              sections.push(`${mergeResults.new_awards} new award${mergeResults.new_awards > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_volunteering > 0) {
              sections.push(`${mergeResults.new_volunteering} new volunteering experience${mergeResults.new_volunteering > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_languages > 0) {
              sections.push(`${mergeResults.new_languages} new language${mergeResults.new_languages > 1 ? 's' : ''}`);
            }
            if (mergeResults?.new_accomplishments > 0) {
              sections.push(`${mergeResults.new_accomplishments} new accomplishment${mergeResults.new_accomplishments > 1 ? 's' : ''}`);
            }
            
            const lastSection = sections.pop();
            const summaryText = sections.length > 0 
              ? `${sections.join(', ')} and ${lastSection} added to your profile`
              : `${lastSection} added to your profile`;
            
            return (
              <div className="text-green-700">
                <div className="text-2xl font-bold mb-2">{totalNewItems} New Item{totalNewItems > 1 ? 's' : ''} Added</div>
                <div className="text-sm">{summaryText}</div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Profile Preview Sections */}
      {renderBasicInfo()}
      {renderWorkExperience()}
      {renderEducation()}
      {renderSkills()}
      {renderProjects()}
      {renderCertificates()}
             {renderVolunteering()}
       {renderAwards()}
       {renderLanguages()}
       {renderAccomplishments()}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button 
          onClick={onViewProfile}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        >
          View Updated Profile
        </Button>
        <Button 
          variant="outline"
          onClick={onUploadAnother}
          className="px-8 py-3"
        >
          Upload Another CV
        </Button>
      </div>
    </div>
  );
}
