import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import { errorMiddleware, tokenMiddleware } from './middleware';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
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