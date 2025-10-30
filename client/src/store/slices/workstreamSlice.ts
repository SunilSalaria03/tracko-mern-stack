import { createSlice } from '@reduxjs/toolkit';
import type { Workstream } from '../../utils/interfaces/workstreamInterface';
import { 
  fetchWorkstreams, 
  createWorkstream, 
  updateWorkstream, 
  deleteWorkstream 
} from '../actions/workstreamActions';

interface WorkstreamState {
  workstreams: Workstream[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkstreamState = {
  workstreams: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const workstreamSlice = createSlice({
  name: 'workstream',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWorkstreams: (state) => {
      state.workstreams = [];
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workstreams
      .addCase(fetchWorkstreams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkstreams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workstreams = action.payload.workstreams;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchWorkstreams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create workstream
      .addCase(createWorkstream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkstream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workstreams.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createWorkstream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update workstream
      .addCase(updateWorkstream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkstream.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.workstreams.findIndex(ws => ws._id === action.payload._id);
        if (index !== -1) {
          state.workstreams[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWorkstream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete workstream
      .addCase(deleteWorkstream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkstream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workstreams = state.workstreams.filter(ws => ws._id !== action.payload);
        state.total = state.total - 1;
        state.error = null;
      })
      .addCase(deleteWorkstream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearWorkstreams } = workstreamSlice.actions;

export default workstreamSlice.reducer;

