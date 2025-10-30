import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../apiEndpoints';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';
import type { 
  WorkstreamListParams, 
  WorkstreamListResponse, 
  Workstream,
  WorkstreamFormData 
} from '../../utils/interfaces/workstreamInterface';

export const fetchWorkstreams = createAsyncThunk<
  WorkstreamListResponse,
  WorkstreamListParams,
  { rejectValue: string }
>(
  'workstream/fetchWorkstreams',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);

      const url = `${API_ENDPOINTS.WORKSTREAMS.LIST}?${queryParams.toString()}`;
      const response = await apiClient.get<WorkstreamListResponse>(url);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch workstreams');
      }
      
      return (response.body || response.data) as WorkstreamListResponse;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createWorkstream = createAsyncThunk<
  Workstream,
  WorkstreamFormData,
  { rejectValue: string }
>(
  'workstream/createWorkstream',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Workstream, WorkstreamFormData>(
        API_ENDPOINTS.WORKSTREAMS.CREATE,
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create workstream');
      }
      
      return (response.body || response.data) as Workstream;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateWorkstream = createAsyncThunk<
  Workstream,
  { id: string; data: Partial<WorkstreamFormData> },
  { rejectValue: string }
>(
  'workstream/updateWorkstream',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Workstream, Partial<WorkstreamFormData>>(
        API_ENDPOINTS.WORKSTREAMS.UPDATE(id),
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update workstream');
      }
      
      return (response.body || response.data) as Workstream;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteWorkstream = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'workstream/deleteWorkstream',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.WORKSTREAMS.DELETE(id)
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete workstream');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

