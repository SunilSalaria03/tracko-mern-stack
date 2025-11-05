import type { User } from "./userInterface";

export interface Workstream {
  _id: string;
  name: string;
  description?: string;
  status: 0 | 1;
  createdAt?: string;
  updatedAt?: string;
  addedBy?: User | null;
  isDeleted?: boolean;
}

export interface WorkstreamFormData {
  name: string; 
  description?: string; 
  status: 0 | 1;
}

export interface WorkstreamListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: 0 | 1;
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

export type WorkstreamFormModalProps = {
  open: boolean;
  isEdit: boolean;
  initialValues: WorkstreamFormData;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: WorkstreamFormData) => Promise<void> | void;
  showStatusSelect?: boolean;
};

export type WorkstreamViewModalProps = {
  open: boolean;
  workstream: Workstream | null;
  onClose: () => void;
};

export type WorkstreamDeleteModalProps = {
  open: boolean;
  workstreamName?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

 