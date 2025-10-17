import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { User } from '../../utils/interfaces/userInterface';

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.user;

export const selectAppState = createSelector(
  [selectAuth, selectUser],
  (auth, user) => ({
    authUser: auth.user,
    authToken: auth.token,
    isAuthenticated: auth.isAuthenticated,
    authLoading: auth.isLoading,
    authError: auth.error,
    allUsers: user.users,
    currentUser: user.currentUser,
    userLoading: user.isLoading,
    userError: user.error,
  })
);

export const selectUserById = (userId: string) =>
  createSelector([selectAppState], (state) =>
    state.allUsers.find((user: User) => user._id === userId)
  );