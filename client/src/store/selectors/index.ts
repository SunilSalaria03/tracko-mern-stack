import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { User } from '../../utils/interfaces/userInterface';

// =================== AUTH ===================

export const selectAuth = (state: RootState) => state.auth;

export const selectAuthUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectAuthToken = createSelector(
  [selectAuth],
  (auth) => auth.token
);

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

// =================== USER ===================

export const selectUserState = (state: RootState) => state.user;

export const selectAllUsers = createSelector(
  [selectUserState],
  (user) => user.users
);

export const selectCurrentUser = createSelector(
  [selectUserState],
  (user) => user.currentUser
);

export const selectUserLoading = createSelector(
  [selectUserState],
  (user) => user.isLoading
);

export const selectUserError = createSelector(
  [selectUserState],
  (user) => user.error
);

export const selectUserById = (userId: string) =>
  createSelector([selectAllUsers], (users) =>
    users.find((user: User) => user._id === userId)
  );

export const selectUserByEmail = (email: string) =>
  createSelector([selectAllUsers], (users) =>
    users.find((user: User) => user.email === email)
  );

export const selectUsersByRole = (role: string) =>
  createSelector([selectAllUsers], (users) =>
    users.filter((user: User) => user.role === role)
  );

// =================== COMBINED ===================

export const selectIsAnyLoading = createSelector(
  [selectAuthLoading, selectUserLoading],
  (authLoading, userLoading) => authLoading || userLoading
);

export const selectUserProfile = createSelector(
  [selectAuthUser, selectCurrentUser],
  (authUser, currentUser) => currentUser || authUser
);
