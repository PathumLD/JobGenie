import { authenticatedFetch } from '@/lib/auth-storage';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class ProfileService {
  private static async makeApiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await authenticatedFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Basic Info
  static async updateBasicInfo(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/basic-info', 'PUT', data);
  }

  // Work Experience
  static async updateWorkExperience(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/work-experience/${id}`, 'PUT', data);
  }

  static async createWorkExperience(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/work-experience', 'POST', data);
  }

  static async deleteWorkExperience(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/work-experience/${id}`, 'DELETE');
  }

  // Education
  static async updateEducation(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/education/${id}`, 'PUT', data);
  }

  static async createEducation(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/education', 'POST', data);
  }

  static async deleteEducation(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/education/${id}`, 'DELETE');
  }

  // Skills
  static async updateSkill(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/skills/${id}`, 'PUT', data);
  }

  static async createSkill(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/skills', 'POST', data);
  }

  static async deleteSkill(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/skills/${id}`, 'DELETE');
  }

  // Projects
  static async updateProject(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/projects/${id}`, 'PUT', data);
  }

  static async createProject(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/projects', 'POST', data);
  }

  static async deleteProject(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/projects/${id}`, 'DELETE');
  }

  // Certificates
  static async updateCertificate(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/certificates/${id}`, 'PUT', data);
  }

  static async createCertificate(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/certificates', 'POST', data);
  }

  static async deleteCertificate(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/certificates/${id}`, 'DELETE');
  }

  // Languages
  static async updateLanguage(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/languages/${id}`, 'PUT', data);
  }

  static async createLanguage(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/languages', 'POST', data);
  }

  static async deleteLanguage(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/languages/${id}`, 'DELETE');
  }

  // Awards
  static async updateAward(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/awards/${id}`, 'PUT', data);
  }

  static async createAward(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/awards', 'POST', data);
  }

  static async deleteAward(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/awards/${id}`, 'DELETE');
  }

  // Volunteering
  static async updateVolunteering(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/volunteering/${id}`, 'PUT', data);
  }

  static async createVolunteering(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/volunteering', 'POST', data);
  }

  static async deleteVolunteering(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/volunteering/${id}`, 'DELETE');
  }

  // Accomplishments
  static async updateAccomplishment(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/accomplishments/${id}`, 'PUT', data);
  }

  static async createAccomplishment(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/accomplishments', 'POST', data);
  }

  static async deleteAccomplishment(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/accomplishments/${id}`, 'DELETE');
  }

  // Resume
  static async updateResume(id: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/resume/${id}`, 'PUT', data);
  }

  static async createResume(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.makeApiCall('/api/candidate/profile/sections/resume', 'POST', data);
  }

  static async deleteResume(id: string): Promise<ApiResponse<unknown>> {
    return this.makeApiCall(`/api/candidate/profile/sections/resume/${id}`, 'DELETE');
  }

  // Generic update method that routes to the appropriate section
  static async updateSection(
    sectionType: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse<unknown>> {
    switch (sectionType) {
      case 'basic-info':
        return this.updateBasicInfo(data);
      case 'work-experience':
        return this.updateWorkExperience(id, data);
      case 'education':
        return this.updateEducation(id, data);
      case 'skills':
        return this.updateSkill(id, data);
      case 'projects':
        return this.updateProject(id, data);
      case 'certificates':
        return this.updateCertificate(id, data);
      case 'languages':
        return this.updateLanguage(id, data);
      case 'awards':
        return this.updateAward(id, data);
      case 'volunteering':
        return this.updateVolunteering(id, data);
      case 'accomplishments':
        return this.updateAccomplishment(id, data);
      case 'resume':
        return this.updateResume(id, data);
      default:
        throw new Error(`Unknown section type: ${sectionType}`);
    }
  }

  // Generic create method that routes to the appropriate section
  static async createSection(
    sectionType: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse<unknown>> {
    switch (sectionType) {
      case 'work-experience':
        return this.createWorkExperience(data);
      case 'education':
        return this.createEducation(data);
      case 'skills':
        return this.createSkill(data);
      case 'projects':
        return this.createProject(data);
      case 'certificates':
        return this.createCertificate(data);
      case 'languages':
        return this.createLanguage(data);
      case 'awards':
        return this.createAward(data);
      case 'volunteering':
        return this.createVolunteering(data);
      case 'accomplishments':
        return this.createAccomplishment(data);
      case 'resume':
        return this.createResume(data);
      default:
        throw new Error(`Unknown section type: ${sectionType}`);
    }
  }

  // Generic delete method that routes to the appropriate section
  static async deleteSection(
    sectionType: string,
    id: string
  ): Promise<ApiResponse<unknown>> {
    switch (sectionType) {
      case 'work-experience':
        return this.deleteWorkExperience(id);
      case 'education':
        return this.deleteEducation(id);
      case 'skills':
        return this.deleteSkill(id);
      case 'projects':
        return this.deleteProject(id);
      case 'certificates':
        return this.deleteCertificate(id);
      case 'languages':
        return this.deleteLanguage(id);
      case 'awards':
        return this.deleteAward(id);
      case 'volunteering':
        return this.deleteVolunteering(id);
      case 'accomplishments':
        return this.deleteAccomplishment(id);
      case 'resume':
        return this.deleteResume(id);
      default:
        throw new Error(`Unknown section type: ${sectionType}`);
    }
  }
}
