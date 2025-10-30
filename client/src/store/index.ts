import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import employeeSlice from './slices/employeeSlice';
import projectSlice from './slices/projectSlice';
import workstreamSlice from './slices/workstreamSlice';
import adminSlice from './slices/adminSlice';
import { errorMiddleware, tokenMiddleware } from './middleware';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    employee: employeeSlice,
    project: projectSlice,
    workstream: workstreamSlice,
    adminManagement: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(errorMiddleware, tokenMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 