import { createAsyncThunk } from '@reduxjs/toolkit';
import { createPostThunk, createGetThunk } from './indexThunkApis';
import { API_ENDPOINTS } from '../apiEndpoints';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';

type Credentials = { email: string; password: string };
type AuthResponse = { user: unknown; token: string };
type ServerAuthResponse = { authToken: string; [key: string]: unknown };
type SignUpData = { 
  email: string; 
  password: string;
  name: string;
  role: number;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth?: string;
};

// Custom login thunk to handle server's authToken -> token transformation
export const loginUser = createAsyncThunk<AuthResponse, Credentials, { rejectValue: string }>(
  'auth/loginUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ServerAuthResponse, Credentials>(API_ENDPOINTS.AUTH.LOGIN, data);
      if (!response.success) {
        return rejectWithValue(response.error || response.message || 'Login failed');
      }
      const serverData = (response.body || response.data) as ServerAuthResponse;
      // Transform server response (authToken) to client format (token)
      const { authToken, ...userData } = serverData;
      return {
        user: userData,
        token: authToken
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Custom register thunk to handle server's authToken -> token transformation
export const registerUser = createAsyncThunk<AuthResponse, Credentials, { rejectValue: string }>(
  'auth/registerUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ServerAuthResponse, Credentials>(API_ENDPOINTS.AUTH.REGISTER, data);
      if (!response.success) {
        return rejectWithValue(response.error || response.message || 'Registration failed');
      }
      const serverData = (response.body || response.data) as ServerAuthResponse;
      // Transform server response (authToken) to client format (token)
      const { authToken, ...userData } = serverData;
      return {
        user: userData,
        token: authToken
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const logoutUser = createPostThunk<void, void>(
  'auth/logout',
  () => API_ENDPOINTS.AUTH.LOGOUT
);

export const getCurrentUser = createGetThunk<unknown>(
  'auth/getCurrentUser',
  () => API_ENDPOINTS.AUTH.ME
);

export const forgotPassword = createPostThunk<unknown, { email: string }>(
  'auth/forgotPassword',
  () => API_ENDPOINTS.AUTH.FORGOT_PASSWORD
);

export const resetPassword = createPostThunk<unknown, {
  encryptedEmail: string;
  resetPasswordToken: string;
  password: string;
}>(
  'auth/resetPassword',
  () => API_ENDPOINTS.AUTH.RESET_PASSWORD
);

export const signUp = createAsyncThunk<AuthResponse, SignUpData, { rejectValue: string }>(
  'auth/signUp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ServerAuthResponse, SignUpData>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      if (!response.success) {
        return rejectWithValue(response.error || response.message || 'Sign up failed');
      }
      const serverData = (response.body || response.data) as ServerAuthResponse;
      // Transform server response (authToken) to client format (token)
      const { authToken, ...userData } = serverData;
      return {
        user: userData,
        token: authToken
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
