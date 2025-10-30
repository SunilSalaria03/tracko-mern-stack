export interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  clientName?: string;
  budget?: number;
  teamMembers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFormData {
  name: string;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  clientName?: string;
  budget?: number;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project | null;
}

