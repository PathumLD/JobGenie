// MIS Types based on updated Prisma schema

export interface MisUser {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface MisCompanyAccess {
  id: string;
  mis_user_id: string;
  company_id: string;
  can_create_jobs: boolean;
  can_manage_jobs: boolean;
  created_at: Date;
  updated_at: Date;
}
