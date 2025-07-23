export type UserRole = 'admin' | 'user' | 'moderator';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
