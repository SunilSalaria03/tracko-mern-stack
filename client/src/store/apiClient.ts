import type { ApiResponse } from "../utils/interfaces/apiInterface";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

export function createApiError(status: number, message: string): Error & { status: number } {
  const error = new Error(message);
  (error as unknown as { status: number }).status = status;
  return error as Error & { status: number };
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  // Only add Content-Type header if there's a body
  const headers: Record<string, string> = {
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get('Content-Type');

    if (!response.ok) {
      throw createApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data;
    }

    return { success: false, errors: ['Unexpected response format'], message: 'Unexpected response format' } as ApiResponse<T>;
  } catch (error) {
    if ((error as Error & { status?: number }).status) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),

  post: <T, D = unknown>(endpoint: string, data?: D) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T, D = unknown>(endpoint: string, data?: D) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
    }),
};
