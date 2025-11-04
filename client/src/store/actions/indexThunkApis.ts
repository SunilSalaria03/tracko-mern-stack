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
        return response.body as T;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createGetThunkWithParams<T, P>(
  typePrefix: string,
  getEndpoint: (params: P) => string,
 ) {
  return createAsyncThunk<T, P, { rejectValue: string }>(
    typePrefix,
    async (params, { rejectWithValue }) => {
      try {
         const response = await apiClient.get<T>(getEndpoint(params),  );

        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return response.body as T;
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
        return response.body as T;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createPutThunk<TBody, TData>(
  typePrefix: string,
  getEndpoint: (data: TData) => string
) {
  return createAsyncThunk<TBody, TData, { rejectValue: string }>(
    typePrefix,
    async (data, { rejectWithValue }) => {
      try {
        const response = await apiClient.put<TBody, TData>(getEndpoint(data), data);
        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return response.body as TBody;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createPutThunkWithParams<TBody, TParams, TData>(
  typePrefix: string,
  getEndpoint: (params: TParams) => string
) {
  return createAsyncThunk<{ body: TBody; message: string }, { params: TParams; data: TData }, { rejectValue: string }>(
    typePrefix,
    async ({ params, data }, { rejectWithValue }) => {
      try {
        const response = await apiClient.put<TBody, TData>(getEndpoint(params), data);
        if (!response.success) {
          return rejectWithValue(response.error || "Request failed");
        }
        return { body: response.body as TBody, message: response.message };
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}

export function createDeleteThunk<T>(
  typePrefix: string,
  getEndpoint: (id: string) => string
) {
  return createAsyncThunk<{ body: T; message: string }, string, { rejectValue: string }>(
    typePrefix,
    async (id, { rejectWithValue }) => {
      try {
        const response = await apiClient.delete<T>(getEndpoint(id));
        if (!response.success) {
          return rejectWithValue(response.error || 'Request failed');
        }
        return { body: response.body as T, message: response.message };
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );
}
