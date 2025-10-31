import { Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  isDeleted?: boolean;
  addedBy?: string;
  startDate: Date;
  endDate: Date;
  status: 0 | 1 | 2 | 3;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
