
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/index';

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 

// export const saveToken = (token: string): void => {
//   localStorage.setItem('token', token);
// };

// export const removeToken = (): void => {
//   localStorage.removeItem('token');
// };

// export const getToken = (): string | null => {
//   return localStorage.getItem('token');
// };