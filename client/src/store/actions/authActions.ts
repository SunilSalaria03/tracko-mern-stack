import {
  createPostThunk,
  createGetThunk,
  createAuthPostThunk,
} from "./indexThunkApis";
import { API_ENDPOINTS } from "../apiEndpoints";
import type {
  AuthResponse,
  Credentials,
  SignUpData,
} from "../../utils/interfaces/authInterface";

export const loginUser = createAuthPostThunk<AuthResponse, Credentials>(
  "auth/loginUser",
  () => API_ENDPOINTS.AUTH.LOGIN
);

export const registerUser = createAuthPostThunk<AuthResponse, Credentials>(
  "auth/registerUser",
  () => API_ENDPOINTS.AUTH.REGISTER
);

export const logoutUser = createPostThunk<void, void>(
  "auth/logout",
  () => API_ENDPOINTS.AUTH.LOGOUT
);

export const getCurrentUser = createGetThunk<unknown>(
  "auth/getCurrentUser",
  () => API_ENDPOINTS.AUTH.ME
);

export const forgotPassword = createPostThunk<unknown, { email: string }>(
  "auth/forgotPassword",
  () => API_ENDPOINTS.AUTH.FORGOT_PASSWORD
);

export const resetPassword = createPostThunk<
  unknown,
  {
    encryptedEmail: string;
    resetPasswordToken: string;
    password: string;
  }
>("auth/resetPassword", () => API_ENDPOINTS.AUTH.RESET_PASSWORD);

export const signUp = createAuthPostThunk<AuthResponse, SignUpData>(
  "auth/signUp",
  () => API_ENDPOINTS.USERS.CHANGE_PASSWORD
);

 
