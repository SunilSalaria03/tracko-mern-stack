import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "../apiEndpoints";
import { apiClient } from "../apiClient";
import { handleApiError } from "../../utils/common/helpers";
import type {
  DesignationListParams,
  DesignationListResponse,
  Designation,
  DesignationFormData,
} from "../../utils/interfaces/designationInterface";

/**
 * NOTE: Expected API_ENDPOINTS shape (add if missing):
 * API_ENDPOINTS.DESIGNATIONS = {
 *   LIST: "/api/designations",
 *   CREATE: "/api/designations",
 *   UPDATE: (id: string) => `/api/designations/${id}`,
 *   DELETE: (id: string) => `/api/designations/${id}`,
 * }
 */

export const fetchDesignations = createAsyncThunk<
  DesignationListResponse,
  DesignationListParams,
  { rejectValue: string }
>(
  "designation/fetchDesignations",
  async (params, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();

      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));
      if (params.search) query.append("search", params.search);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortOrder) query.append("sortOrder", params.sortOrder);
      if (params.departmentId) query.append("departmentId", params.departmentId);

      const url = `${API_ENDPOINTS.DESIGNATIONS.LIST}?${query.toString()}`;
      const response = await apiClient.get<DesignationListResponse>(url);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch designations");
      }
      return (response.body || response.data) as DesignationListResponse;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const createDesignation = createAsyncThunk<
  Designation,
  DesignationFormData,
  { rejectValue: string }
>(
  "designation/createDesignation",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Designation, DesignationFormData>(
        API_ENDPOINTS.DESIGNATIONS.CREATE,
        payload
      );

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to create designation");
      }
      return (response.body || response.data) as Designation;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const updateDesignation = createAsyncThunk<
  Designation,
  { id: string; data: Partial<DesignationFormData> },
  { rejectValue: string }
>(
  "designation/updateDesignation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Designation, Partial<DesignationFormData>>(
        API_ENDPOINTS.DESIGNATIONS.UPDATE(id),
        data
      );

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to update designation");
      }
      return (response.body || response.data) as Designation;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const deleteDesignation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "designation/deleteDesignation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.DESIGNATIONS.DELETE(id)
      );

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to delete designation");
      }
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);
