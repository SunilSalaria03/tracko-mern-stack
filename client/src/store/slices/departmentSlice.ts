import { createSlice } from '@reduxjs/toolkit';
import type { Department } from '../../utils/interfaces/departmentInterface';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../actions/departmentActions';

interface DepartmentState {
  departments: Department[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDepartments: (state) => {
      state.departments = [];
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload.departments;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        // If your API returns the created entity, you can unshift it:
        // state.departments.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.departments.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.departments[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete department
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = state.departments.filter((d) => d._id !== action.payload);
        state.total = state.total - 1;
        state.error = null;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDepartments } = departmentSlice.actions;
export default departmentSlice.reducer;
