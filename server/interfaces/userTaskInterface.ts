import mongoose, { Document } from "mongoose";

export interface IUserTask extends Document {
  taskId?: string | mongoose.Schema.Types.ObjectId | null;
  userId?: mongoose.Schema.Types.ObjectId | null;
  projectId?: mongoose.Schema.Types.ObjectId | null;
  workstreamId?: mongoose.Schema.Types.ObjectId | null;
  taskDescription?: string;
  date?: Date;
  spendHours?: string;
  addedBy?: mongoose.Schema.Types.ObjectId | null;
  isDeleted?: boolean;
  finalSubmit?: boolean;
  startDate?: Date;
  endDate?: Date;
}