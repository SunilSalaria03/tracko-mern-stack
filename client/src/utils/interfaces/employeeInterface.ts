export interface Employee {
  _id: string;
  email: string;
  name: string;
  role: 0 | 1 | 2;
  profileImage?: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  status?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddEmployeeFormData {
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  confirmPassword?: string;
  role: 0 | 1 | 2;
}

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
