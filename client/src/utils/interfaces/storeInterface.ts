import type { User } from '../interfaces/userInterface';
import type { Notification } from '../interfaces/commonInterface';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isLoading: boolean;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}
