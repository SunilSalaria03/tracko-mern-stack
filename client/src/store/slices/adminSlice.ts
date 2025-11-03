// src/store/slices/adminSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { Admin } from "../../utils/interfaces/adminInterface";
import { fetchAdmins, createAdmin, updateAdmin, deleteAdmin } from "../actions/adminActions";

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
  name: "adminManagement",
  initialState,
  reducers: {
    clearAdminError: (state) => {
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
      .addCase(fetchAdmins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload.users;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch admins";
      })

      .addCase(createAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        // optional: state.admins.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create admin";
      })

      .addCase(updateAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const i = state.admins.findIndex((a) => a._id === action.payload._id);
        if (i !== -1) state.admins[i] = action.payload;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update admin";
      })

      .addCase(deleteAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = state.admins.filter((a) => a._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete admin";
      });
  },
});

export const { clearAdminError, clearAdmins } = adminSlice.actions;
export default adminSlice.reducer;
