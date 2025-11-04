import mongoose, { Document } from "mongoose";

export interface IProject extends Document {
  projects?: Array<{
    projectId: string;
    allowAccess: boolean;
  }>;
  userId?: string |mongoose.Schema.Types.ObjectId | null;
  name: string;
  description: string;
  isDeleted?: boolean;
  addedBy?: string;
  startDate: Date;
  endDate: Date;
  status: 0 | 1 | 2 | 3;
}