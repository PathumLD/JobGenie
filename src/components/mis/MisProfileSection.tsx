import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileSectionData } from '@/types/candidate-profile';

interface MisProfileSectionProps {
  section: {
    id: string;
    title: string;
    data: ProfileSectionData;
    order: number;
  };
}

export const MisProfileSection: React.FC<MisProfileSectionProps> = ({ section }) => {
  const renderSectionContent = () => {
    switch (section.data.type) {
      case 'experience':
        return (
          <div className="space-y-4">
            {section.data.experiences?.map((exp: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900 text-lg">{exp.title}</h4>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.start_date && new Date(exp.start_date).toLocaleDateString()} - 
                  {exp.is_current ? 'Present' : (exp.end_date && new Date(exp.end_date).toLocaleDateString()) || 'Not specified'}
                </p>
                {exp.description && (
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'education':
        return (
          <div className="space-y-4">
            {section.data.educations?.map((edu: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900 text-lg">{edu.degree_diploma}</h4>
                <p className="text-gray-600">{edu.university_school}</p>
                {edu.field_of_study && (
                  <p className="text-gray-600">{edu.field_of_study}</p>
                )}
                <p className="text-sm text-gray-500">
                  {edu.start_date && new Date(edu.start_date).toLocaleDateString()} - 
                  {edu.end_date && new Date(edu.end_date).toLocaleDateString() || 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        );
      
      case 'skills':
        return (
          <div className="flex flex-wrap gap-2">
            {section.data.skills?.map((skill: any, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                {skill.name}
              </span>
            ))}
          </div>
        );
      
      case 'projects':
        return (
          <div className="space-y-4">
            {section.data.projects?.map((project: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
                {project.role && (
                  <p className="text-gray-600">{project.role}</p>
                )}
                {project.description && (
                  <p className="text-gray-700 mt-2">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'certificates':
        return (
          <div className="space-y-4">
            {section.data.certificates?.map((cert: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                <p className="text-gray-600">{cert.issuing_authority}</p>
                {cert.issue_date && (
                  <p className="text-sm text-gray-500">
                    Issued: {new Date(cert.issue_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'languages':
        return (
          <div className="flex flex-wrap gap-2">
            {section.data.languages?.map((lang: any, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                {lang.language} {lang.is_native && '(Native)'}
              </span>
            ))}
          </div>
        );
      
      case 'awards':
        return (
          <div className="space-y-4">
            {section.data.awards?.map((award: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">{award.title}</h4>
                <p className="text-gray-600">{award.offered_by}</p>
                {award.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(award.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'volunteering':
        return (
          <div className="space-y-4">
            {section.data.volunteering?.map((vol: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">{vol.role}</h4>
                <p className="text-gray-600">{vol.institution}</p>
                {vol.description && (
                  <p className="text-gray-700 mt-2">{vol.description}</p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'accomplishments':
        return (
          <div className="space-y-4">
            {section.data.accomplishments?.map((acc: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">{acc.title}</h4>
                {acc.description && (
                  <p className="text-gray-700 mt-2">{acc.description}</p>
                )}
              </div>
            ))}
          </div>
        );
      
      default:
        return <div className="text-gray-500">Section content not available</div>;
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderSectionContent()}
      </CardContent>
    </Card>
  );
};
