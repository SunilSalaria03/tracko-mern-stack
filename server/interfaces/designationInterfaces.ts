import mongoose, { Document } from "mongoose";

export interface IDesignation extends Document {
  departmentId: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  isDeleted?: boolean;
  addedBy?: string;
  status: 1 | 0;
}