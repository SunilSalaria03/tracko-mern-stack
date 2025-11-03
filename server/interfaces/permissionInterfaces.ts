import mongoose, { Document } from "mongoose";

export interface IPermission extends Document {
  permissionName: string;
  permissionDescription: string;
  isDeleted?: boolean;
  addedBy?: string | mongoose.Schema.Types.ObjectId | null;
  status: 1 | 0;
}