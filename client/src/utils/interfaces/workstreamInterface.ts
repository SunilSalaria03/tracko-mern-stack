export interface Workstream {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  projectId?: {
    _id: string;
    name: string;
    code: string;
  };
  teamLead?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkstreamFormData {
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  projectId?: string;
  teamLead?: string;
  startDate?: string;
  endDate?: string;
}

export interface WorkstreamListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface WorkstreamListResponse {
  workstreams: Workstream[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkstreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workstream?: Workstream | null;
}

