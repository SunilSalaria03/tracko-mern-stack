export interface Admin {
  _id: string;
  role: 0 | 1 | 2; // 0: super admin, 1: admin, 2: manager
  email: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  designation: string;
  department: string;
  status: 0 | 1; // 0: inactive, 1: active
  profileImage?: string;
  dateOfBirth?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  addedBy?: string;
}

export interface AdminFormData {
  role: 0 | 1 | 2;
  email: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  designation: string;
  department: string;
  status: 0 | 1;
  password?: string;
  dateOfBirth?: string;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 0 | 1 | 2;
  status?: 0 | 1;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminListResponse {
  admins: Admin[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

