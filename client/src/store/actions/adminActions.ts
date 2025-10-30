import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../apiEndpoints';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';
import type { AdminListParams, AdminListResponse, Admin, AdminFormData } from '../../utils/interfaces/adminInterface';

export const fetchAdmins = createAsyncThunk<
  AdminListResponse,
  AdminListParams,
  { rejectValue: string }
>(
  'admin/fetchAdmins',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.role !== undefined) queryParams.append('role', params.role.toString());
      if (params.status !== undefined) queryParams.append('status', params.status.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${API_ENDPOINTS.ADMINS.LIST}?${queryParams.toString()}`;
      const response = await apiClient.get<AdminListResponse>(url);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch admins');
      }
      
      return (response.body || response.data) as AdminListResponse;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createAdmin = createAsyncThunk<
  Admin,
  AdminFormData & { password: string },
  { rejectValue: string }
>(
  'admin/createAdmin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Admin, AdminFormData & { password: string }>(
        API_ENDPOINTS.ADMINS.CREATE,
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create admin');
      }
      
      return (response.body || response.data) as Admin;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateAdmin = createAsyncThunk<
  Admin,
  { id: string; data: Partial<AdminFormData> },
  { rejectValue: string }
>(
  'admin/updateAdmin',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Admin, Partial<AdminFormData>>(
        API_ENDPOINTS.ADMINS.UPDATE(id),
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update admin');
      }
      
      return (response.body || response.data) as Admin;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteAdmin = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'admin/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.ADMINS.DELETE(id)
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete admin');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

