import type { User } from "./userInterface";

export interface Designation {
  _id: string;
  departmentId?: string;     // FK -> Department
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  addedBy?: User | null;
  isDeleted?: boolean;
}

export interface DesignationFormData {
  departmentId: string;
  name: string;
  description?: string;
}

export interface DesignationListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  departmentId?: string; // optional filter
}

export interface DesignationListResponse {
  designations: Designation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DesignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  designation?: Designation | null;
}
