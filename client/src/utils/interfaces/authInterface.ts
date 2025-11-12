import type { User } from "../interfaces/userInterface";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
export type Credentials = { email: string; password: string,resetPasswordToken?: string };
export type ServerAuthResponse = { authToken: string; [key: string]: unknown };
export type SignUpData = {
  email: string;
  password: string;
  name: string;
  role: number;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth?: string;
};
