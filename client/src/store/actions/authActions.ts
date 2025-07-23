import { createPostThunk, createGetThunk } from './indexThunkApis';
import { API_ENDPOINTS } from '../apiEndpoints';

type Credentials = { email: string; password: string };
type AuthResponse = { user: unknown; token: string };

export const loginUser = createPostThunk<AuthResponse, Credentials>(
  'auth/login',
  () => API_ENDPOINTS.AUTH.LOGIN
);

export const registerUser = createPostThunk<AuthResponse, Credentials>(
  'auth/register',
  () => API_ENDPOINTS.AUTH.REGISTER
);

export const logoutUser = createPostThunk<void, void>(
  'auth/logout',
  () => API_ENDPOINTS.AUTH.LOGOUT
);

export const getCurrentUser = createGetThunk<unknown>(
  'auth/getCurrentUser',
  () => API_ENDPOINTS.AUTH.ME
);

export const forgotPassword = createPostThunk<unknown, Credentials>(
  'auth/forgotPassword',
  () => API_ENDPOINTS.AUTH.FORGOT_PASSWORD
);
