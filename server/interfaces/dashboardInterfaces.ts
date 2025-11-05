import mongoose from "mongoose";

export interface IDashboardParams {
  userId?: string;
  period?: 'today' | 'week' | 'month' | 'lastMonth';
}

export interface IProjectStats {
  projectId: mongoose.Schema.Types.ObjectId | string;
  projectName: string;
  productiveHours: number;
  color: string;
}

export interface IDashboardResponse {
  period: 'today' | 'week' | 'month' | 'lastMonth';
  projects: IProjectStats[];
  totalProductiveHours: number;
  activeProjects: number;
  averageDailyHours: number;
}

