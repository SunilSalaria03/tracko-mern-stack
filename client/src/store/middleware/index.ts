import type { Middleware } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export const errorMiddleware: Middleware = () => (next) => (action) => {
  try {
    const result = next(action);

    const actionWithType = action as { type?: string; payload?: unknown; error?: { message?: string } };
    const actionType = actionWithType.type;
    if (typeof actionType === 'string' && actionType.endsWith('/rejected')) {
      const errorMessage =
        actionWithType.payload ||
        actionWithType.error?.message ||
        'An unknown error occurred';

        toast.error(errorMessage as string || 'Unexpected error occurred');
    }

    return result;
  } catch (error) {
    console.error('Redux Middleware Error:', error);
    throw error;
  }
};

export const tokenMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  // Handle login and register - save both token and user
  if (
    typeof action === 'object' &&
    action !== null &&
    (
      (action as { type?: string }).type === 'auth/loginUser/fulfilled' ||
      (action as { type?: string }).type === 'auth/registerUser/fulfilled'
    )
  ) {
    const payload = (action as { payload?: { token?: string; user?: unknown } }).payload;
    if (payload?.token) {
      localStorage.setItem('token', payload.token);
    }
    if (payload?.user) {
      localStorage.setItem('user', JSON.stringify(payload.user));
    }
  }

  // Handle getCurrentUser - update user in localStorage
  if (
    typeof action === 'object' &&
    action !== null &&
    (action as { type?: string }).type === 'auth/getCurrentUser/fulfilled'
  ) {
    const payload = (action as { payload?: unknown }).payload;
    if (payload) {
      localStorage.setItem('user', JSON.stringify(payload));
    }
  }

  // Handle logout - clear all auth data
  if (
    typeof action === 'object' &&
    action !== null &&
    (
      (action as { type?: string }).type === 'auth/logoutUser/fulfilled' ||
      (action as { type?: string }).type === 'auth/logoutUser/rejected'
    )
  ) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Handle getCurrentUser rejection - clear all auth data
  if (
    typeof action === 'object' &&
    action !== null &&
    (action as { type?: string }).type === 'auth/getCurrentUser/rejected'
  ) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return result;
};

