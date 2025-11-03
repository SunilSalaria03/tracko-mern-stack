import type { User } from "./userInterface";

export interface Department {
  _id: string;
  name: string;
  description?: string;
  status?: 0 | 1;          // 0=Inactive, 1=Active (extend if needed)
  createdAt?: string;
  updatedAt?: string;
  addedBy?: User | null;
  isDeleted?: boolean;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  status: 0 | 1;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export interface DepartmentListResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: Department | null;
}

