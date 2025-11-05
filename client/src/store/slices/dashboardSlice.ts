import { createSlice } from "@reduxjs/toolkit";
import type { 
  ProjectStats, 
  TimePeriod 
} from "../../utils/interfaces/dashboardInterface";
import { getDashboardStats } from "../actions/dashboardActions";

interface DashboardState {
  projects: ProjectStats[];
  totalProductiveHours: number;
  activeProjects: number;
  averageDailyHours: number;
  period: TimePeriod;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  projects: [],
  totalProductiveHours: 0,
  activeProjects: 0,
  averageDailyHours: 0,
  period: 'today',
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.totalProductiveHours = action.payload.totalProductiveHours;
        state.activeProjects = action.payload.activeProjects;
        state.averageDailyHours = action.payload.averageDailyHours;
        state.period = action.payload.period;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch dashboard stats";
      });
  },
});

export const { clearDashboardError, setPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;

