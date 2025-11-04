import { createSlice } from '@reduxjs/toolkit';
import type { Project } from '../../utils/interfaces/projectInterface';
import { 
  fetchProjects,
  fetchProjectsWithoutParams,
  createProject, 
  updateProject, 
  deleteProject 
} from '../actions/projectActions';

interface ProjectState {
  projects: Project[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
       .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch projects without params
      .addCase(fetchProjectsWithoutParams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectsWithoutParams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchProjectsWithoutParams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, _action) => {
        state.isLoading = false;
         state.total += 1;
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.projects.findIndex(proj => proj._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.projects = state.projects.filter(proj => proj._id !== action.payload);
        state.total = state.total - 1;
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearProjects } = projectSlice.actions;

export default projectSlice.reducer;

