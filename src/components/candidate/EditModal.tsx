import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  title: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  sectionType,
  data,
  onSave,
  title
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && data) {
      setFormData({ ...data });
      setErrors({});
    }
  }, [isOpen, data]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation for required fields based on section type
    switch (sectionType) {
      case 'work-experience':
        if (!formData.title) newErrors.title = 'Job title is required';
        if (!formData.company) newErrors.company = 'Company name is required';
        break;
      case 'education':
        if (!formData.degree_diploma) newErrors.degree_diploma = 'Degree/Diploma is required';
        if (!formData.university_school) newErrors.university_school = 'University/School is required';
        break;
      case 'skills':
        if (!formData.name) newErrors.name = 'Skill name is required';
        break;
      case 'projects':
        if (!formData.name) newErrors.name = 'Project name is required';
        break;
      case 'certificates':
        if (!formData.title) newErrors.title = 'Certificate title is required';
        if (!formData.issuing_organization) newErrors.issuing_organization = 'Issuing organization is required';
        break;
      case 'languages':
        if (!formData.language) newErrors.language = 'Language is required';
        break;
      case 'awards':
        if (!formData.title) newErrors.title = 'Award title is required';
        break;
      case 'volunteering':
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.institution) newErrors.institution = 'Institution is required';
        break;
      case 'accomplishments':
        if (!formData.title) newErrors.title = 'Accomplishment title is required';
        break;
      case 'basic-info':
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving data:', error);
      // Handle error display if needed
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: string, label: string, type: string = 'text') => {
    const value = formData[field];
    const error = errors[field];

    return (
      <div key={field} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            value={value as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
          />
        ) : type === 'select' ? (
          <select
            value={value as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select {label}</option>
            {field === 'employment_type' && (
              <>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </>
            )}
            {field === 'proficiency' && (
              <>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </>
            )}
          </select>
        ) : type === 'date' ? (
          <input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        ) : type === 'checkbox' ? (
          <input
            type="checkbox"
            checked={value as boolean || false}
            onChange={(e) => handleInputChange(field, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        ) : (
          <input
            type={type}
            value={value as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const renderSectionFields = () => {
    switch (sectionType) {
      case 'experience':
      case 'work-experience':
        return (
          <>
            {renderField('title', 'Job Title')}
            {renderField('company', 'Company')}
            {renderField('location', 'Location')}
            {renderField('employment_type', 'Employment Type', 'select')}
            {renderField('start_date', 'Start Date', 'date')}
            {renderField('end_date', 'End Date', 'date')}
            {renderField('is_current', 'Currently Working', 'checkbox')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'education':
        return (
          <>
            {renderField('degree_diploma', 'Degree/Diploma')}
            {renderField('university_school', 'University/School')}
            {renderField('field_of_study', 'Field of Study')}
            {renderField('start_date', 'Start Date', 'date')}
            {renderField('end_date', 'End Date', 'date')}
            {renderField('grade', 'Grade')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'skills':
        return (
          <>
            {renderField('name', 'Skill Name')}
            {renderField('proficiency', 'Proficiency', 'select')}
            {renderField('years_of_experience', 'Years of Experience', 'number')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'projects':
        return (
          <>
            {renderField('name', 'Project Name')}
            {renderField('description', 'Description', 'textarea')}
            {renderField('start_date', 'Start Date', 'date')}
            {renderField('end_date', 'End Date', 'date')}
            {renderField('is_current', 'Currently Working', 'checkbox')}
            {renderField('role', 'Role')}
            {renderField('url', 'Project URL')}
            {renderField('repository_url', 'Repository URL')}
          </>
        );
      case 'certificates':
        return (
          <>
            {renderField('title', 'Certificate Title')}
            {renderField('issuing_organization', 'Issuing Organization')}
            {renderField('issue_date', 'Issue Date', 'date')}
            {renderField('expiry_date', 'Expiry Date', 'date')}
            {renderField('credential_id', 'Credential ID')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'languages':
        return (
          <>
            {renderField('language', 'Language')}
            {renderField('is_native', 'Native Language', 'checkbox')}
            {renderField('oral_proficiency', 'Oral Proficiency', 'select')}
            {renderField('written_proficiency', 'Written Proficiency', 'select')}
          </>
        );
      case 'awards':
        return (
          <>
            {renderField('title', 'Award Title')}
            {renderField('associated_with', 'Associated With')}
            {renderField('offered_by', 'Offered By')}
            {renderField('date', 'Date', 'date')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'volunteering':
        return (
          <>
            {renderField('role', 'Role')}
            {renderField('institution', 'Institution')}
            {renderField('cause', 'Cause')}
            {renderField('start_date', 'Start Date', 'date')}
            {renderField('end_date', 'End Date', 'date')}
            {renderField('is_current', 'Currently Volunteering', 'checkbox')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'accomplishments':
        return (
          <>
            {renderField('title', 'Accomplishment Title')}
            {renderField('description', 'Description', 'textarea')}
          </>
        );
      case 'basic_info':
      case 'basic-info':
        return (
          <>
            {renderField('first_name', 'First Name')}
            {renderField('last_name', 'Last Name')}
            {renderField('email', 'Email', 'email')}
            {renderField('phone', 'Phone')}
            {renderField('headline', 'Headline')}
            {renderField('summary', 'Summary', 'textarea')}
            {renderField('location', 'Location')}
            {renderField('linkedin_url', 'LinkedIn URL')}
            {renderField('github_url', 'GitHub URL')}
            {renderField('portfolio_url', 'Portfolio URL')}
          </>
        );
      default:
        return <p>Unknown section type</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {renderSectionFields()}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
