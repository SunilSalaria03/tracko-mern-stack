import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';
import { handleApiError } from '../../utils/common/helpers';

export function createGetThunk<T>(
  typePrefix: string,
  getEndpoint: () => string
) {
  return createAsyncThunk<T, void, { rejectValue: string }>(
    typePrefix,
    async (_, { rejectWithValue }) => {
      try {
        const response = await apiClient.get<T>(getEndpoint());
        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return response.data as T;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createPostThunk<T, D>(
  typePrefix: string,
  getEndpoint: () => string
) {
  return createAsyncThunk<T, D, { rejectValue: string }>(
    typePrefix,
    async (data, { rejectWithValue }) => {
      try {
        const response = await apiClient.post<T, D>(getEndpoint(), data);
        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return response.data as T;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createPutThunk<T, D>(
  typePrefix: string,
  getEndpoint: () => string
) {
  return createAsyncThunk<T, D, { rejectValue: string }>(
    typePrefix,
    async (data, { rejectWithValue }) => {
      try {
        const response = await apiClient.put<T, D>(getEndpoint(), data);
        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return response.data as T;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createDeleteThunk<T>(
  typePrefix: string,
  getEndpoint: () => string
) {
  return createAsyncThunk<T, void, { rejectValue: string }>(
    typePrefix,
    async (_, { rejectWithValue }) => {
      try {
        const response = await apiClient.delete<T>(getEndpoint());
        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return response.data as T;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}
