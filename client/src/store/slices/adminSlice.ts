import { createSlice } from '@reduxjs/toolkit';
import type { Admin } from '../../utils/interfaces/adminInterface';
import { fetchAdmins, createAdmin, updateAdmin, deleteAdmin } from '../actions/adminActions';

interface AdminState {
  admins: Admin[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'adminManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdmins: (state) => {
      state.admins = [];
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admins
      .addCase(fetchAdmins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload.admins;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create admin
      .addCase(createAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update admin
      .addCase(updateAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.admins.findIndex(admin => admin._id === action.payload._id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete admin
      .addCase(deleteAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = state.admins.filter(admin => admin._id !== action.payload);
        state.total = state.total - 1;
        state.error = null;
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAdmins } = adminSlice.actions;

export default adminSlice.reducer;

