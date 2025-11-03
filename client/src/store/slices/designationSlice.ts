import { createSlice } from "@reduxjs/toolkit";
import type { Designation } from "../../utils/interfaces/designationInterface";
import {
  fetchDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../actions/designationActions";

interface DesignationState {
  designations: Designation[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: DesignationState = {
  designations: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const designationSlice = createSlice({
  name: "designation",
  initialState,
  reducers: {
    clearDesignationError: (state) => {
      state.error = null;
    },
    clearDesignationList: (state) => {
      state.designations = [];
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDesignations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designations = action.payload.designations;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch designations";
      })

      // Create
      .addCase(createDesignation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDesignation.fulfilled, (state) => {
        state.isLoading = false;
        // rely on refetch in UI
        state.total += 1;
      })
      .addCase(createDesignation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create designation";
      })

      // Update
      .addCase(updateDesignation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDesignation.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.designations.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) {
          state.designations[idx] = action.payload;
        }
      })
      .addCase(updateDesignation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update designation";
      })

      // Delete
      .addCase(deleteDesignation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designations = state.designations.filter((d) => d._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete designation";
      });
  },
});

export const { clearDesignationError, clearDesignationList } = designationSlice.actions;
export default designationSlice.reducer;
