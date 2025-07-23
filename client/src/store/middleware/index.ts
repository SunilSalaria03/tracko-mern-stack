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

  if (
    typeof action === 'object' &&
    action !== null &&
    (
      (action as { type?: string }).type === 'auth/loginUser/fulfilled' ||
      (action as { type?: string }).type === 'auth/registerUser/fulfilled'
    )
  ) {
    const token = (action as { payload?: { token?: string } }).payload?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
  }

  if (
    typeof action === 'object' &&
    action !== null &&
    (
      (action as { type?: string }).type === 'auth/logoutUser/fulfilled'
    )
  ) {
    localStorage.removeItem('token');
  }

  return result;
};

