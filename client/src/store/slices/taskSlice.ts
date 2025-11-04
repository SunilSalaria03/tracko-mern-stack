import { createSlice } from "@reduxjs/toolkit";
import type { TimeTrackTask } from "../../utils/interfaces/TimeTrackInterface";
import {
  createTimeTrackTask,
  getTaskList,
  deleteTimeTrackTask,
  updateTimeTrackTask,
  finalSubmitTimeTrackTask,
} from "../actions/timeTrackActions";

interface TaskState {
  tasks: TimeTrackTask[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTaskList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTaskList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.userTasks;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getTaskList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch tasks";
      })

      .addCase(createTimeTrackTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTimeTrackTask.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.tasks.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createTimeTrackTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create task";
      })

      .addCase(deleteTimeTrackTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTimeTrackTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.meta.arg);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteTimeTrackTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete task";
      })

      .addCase(updateTimeTrackTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTimeTrackTask.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.body) {
          const taskIndex = state.tasks.findIndex((t) => t._id === action.payload.body._id);
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = action.payload.body;
          }
        }
      })
      .addCase(updateTimeTrackTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update task";
      })

      .addCase(finalSubmitTimeTrackTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(finalSubmitTimeTrackTask.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(finalSubmitTimeTrackTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to submit tasks";
      });
  },
});

export const { clearTaskError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
