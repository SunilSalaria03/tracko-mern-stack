export type UserRole = 0 | 1 | 2; // 0: admin, 1: employee, 2: moderator

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  countryCode?: string;
  status?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
