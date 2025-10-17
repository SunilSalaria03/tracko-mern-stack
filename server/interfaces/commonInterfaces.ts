import type { ConnectOptions } from "mongoose";
import type { Request } from "express";
import type { Document } from "mongoose";

export interface DatabaseConfig {
  uri: string;
  options: ConnectOptions;
}

export interface AuthRequest extends Request {
  user?: UserToken;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  body: T;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string,
  email: string;
  password: string;
  role: "0" | "1" | "2";
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code?: string;
  image?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  tokenFound: string;
  password: string;
}

export interface ResetPasswordLinkInput {
  token: string;
  email: string;
}

export interface UserToken {
  id: string;
  email: string;
}