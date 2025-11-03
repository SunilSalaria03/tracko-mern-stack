import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../apiEndpoints';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';
import type {
  DepartmentListParams,
  DepartmentListResponse,
  Department,
  DepartmentFormData,
} from '../../utils/interfaces/departmentInterface';

export const fetchDepartments = createAsyncThunk<
  DepartmentListResponse,
  DepartmentListParams,
  { rejectValue: string }
>(
  'department/fetchDepartments',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);

      const url = `${API_ENDPOINTS.DEPARTMENTS.LIST}?${queryParams.toString()}`;
      const response = await apiClient.get<DepartmentListResponse>(url);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch departments');
      }

      return (response.body || response.data) as DepartmentListResponse;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createDepartment = createAsyncThunk<
  Department,
  DepartmentFormData,
  { rejectValue: string }
>(
  'department/createDepartment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Department, DepartmentFormData>(
        API_ENDPOINTS.DEPARTMENTS.CREATE,
        data
      );

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create department');
      }

      return (response.body || response.data) as Department;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateDepartment = createAsyncThunk<
  Department,
  { id: string; data: Partial<DepartmentFormData> },
  { rejectValue: string }
>(
  'department/updateDepartment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Department, Partial<DepartmentFormData>>(
        API_ENDPOINTS.DEPARTMENTS.UPDATE(id),
        data
      );

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update department');
      }

      return (response.body || response.data) as Department;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteDepartment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'department/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.DEPARTMENTS.DELETE(id)
      );

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete department');
      }

      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
