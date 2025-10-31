import { API_ENDPOINTS } from "../apiEndpoints";
import type { User, UsersResponse } from "../../utils/interfaces/userInterface";
import {  createGetThunk, createPostThunk, createPutThunk } from "./indexThunkApis";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../apiClient";
import { handleApiError } from "../../utils/common/helpers";

export const fetchUsers = createGetThunk<UsersResponse>(
    'user/fetchUsers',
    () => API_ENDPOINTS.USERS.LIST
  );
  
// Fetch single user by id
export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>(
  'user/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
      if (!response.success) return rejectWithValue(response.error || 'Failed to fetch user');
      return (response.body || response.data) as User;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

  export const fetchUserProfile = createGetThunk<User>(
    'user/fetchProfile',
    () => API_ENDPOINTS.USERS.PROFILE
  );
  
  export const updateUserProfile = createPutThunk<User, Partial<User>>(
    'user/updateProfile',
    () => API_ENDPOINTS.USERS.UPDATE_PROFILE
  );

  export const changePassword = createPutThunk<unknown, { oldPassword: string; newPassword: string }>(
    'user/changePassword',
    () => API_ENDPOINTS.USERS.CHANGE_PASSWORD
  );
  
// Admin: create user
export const createUser = createPostThunk<User, Partial<User>>(
  'user/createUser',
  () => API_ENDPOINTS.USERS.CREATE
);

// Admin: update user
export const updateUser = createAsyncThunk<
  User,
  { id: string; data: Partial<User> },
  { rejectValue: string }
>(
  'user/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<User, Partial<User>>(API_ENDPOINTS.USERS.UPDATE(id), data);
      if (!response.success) return rejectWithValue(response.error || 'Failed to update user');
      return (response.body || response.data) as User;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.USERS.DELETE(id));
      if (!response.success) return rejectWithValue(response.error || 'Failed to delete user');
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);