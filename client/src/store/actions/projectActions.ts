import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../apiEndpoints';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';
import type { 
  ProjectListParams, 
  ProjectListResponse, 
  Project,
  ProjectFormData 
} from '../../utils/interfaces/projectInterface';

export const fetchProjects = createAsyncThunk<
  ProjectListResponse,
  ProjectListParams,
  { rejectValue: string }
>(
  'project/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);

      const url = `${API_ENDPOINTS.PROJECTS.LIST}?${queryParams.toString()}`;
      const response = await apiClient.get<ProjectListResponse>(url);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch projects');
      }
      
      return (response.body || response.data) as ProjectListResponse;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createProject = createAsyncThunk<
  Project,
  ProjectFormData,
  { rejectValue: string }
>(
  'project/createProject',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Project, ProjectFormData>(
        API_ENDPOINTS.PROJECTS.CREATE,
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create project');
      }
      
      return (response.body || response.data) as Project;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateProject = createAsyncThunk<
  Project,
  { id: string; data: Partial<ProjectFormData> },
  { rejectValue: string }
>(
  'project/updateProject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Project, Partial<ProjectFormData>>(
        API_ENDPOINTS.PROJECTS.UPDATE(id),
        data
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update project');
      }
      
      return (response.body || response.data) as Project;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'project/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.PROJECTS.DELETE(id)
      );
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete project');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

