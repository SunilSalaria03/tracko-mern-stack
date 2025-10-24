import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../apiEndpoints';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';
import type { EmployeeListParams, EmployeeListResponse, Employee } from '../../utils/interfaces/employeeInterface';

export const fetchEmployees = createAsyncThunk<
  EmployeeListResponse,
  EmployeeListParams,
  { rejectValue: string }
>(
  'employee/fetchEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${API_ENDPOINTS.EMPLOYEES.LIST}?${queryParams.toString()}`;
      const response = await apiClient.get<EmployeeListResponse>(url);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch employees');
      }
      
      return (response.body || response.data) as EmployeeListResponse;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateEmployee = createAsyncThunk<
  Employee,
  { id: string; data: Partial<Employee> },
  { rejectValue: string }
>(
  'employee/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Employee, Partial<Employee>>(
        API_ENDPOINTS.EMPLOYEES.UPDATE(id),
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update employee');
      }
      
      return (response.body || response.data) as Employee;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteEmployee = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'employee/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.EMPLOYEES.DELETE(id)
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete employee');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

