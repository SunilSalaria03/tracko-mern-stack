import type { User } from "./userInterface";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  startDate?: string; // ISO string from API
  endDate?: string;   // ISO string from API
  status?: 0 | 1 | 2 | 3;
  createdAt?: string;
  updatedAt?: string;
  addedBy?: User | null;
  isDeleted?: boolean;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  startDate: string; // yyyy-MM-dd (from input type="date")
  endDate: string;   // yyyy-MM-dd
  status: 0 | 1 | 2 | 3;
 }

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string; // optional filter
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

