export type UserRole = 0 | 1 | 2 | 3;

export interface User {
  _id: string;
  tenantId?: string | null;
  email: string;
  designation: string;
  department?: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  status?: number;
  isDeleted?: boolean;
  tempPassword?: string | null;
  addedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export const isManagementRole = (role: UserRole): boolean => role === 0 || role === 1 || role === 2;
export const isEmployeeRole = (role: UserRole): boolean => role === 3;

export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case 0: return 'Super Admin';
    case 1: return 'Admin';
    case 2: return 'Manager';
    case 3: return 'Employee';
    default: return 'Unknown';
  }
};
