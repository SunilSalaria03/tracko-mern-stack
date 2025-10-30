import mongoose, { Document } from "mongoose";

export interface ITenant extends Document {
  adminUserId: mongoose.Schema.Types.ObjectId | null;
  isDeleted?: boolean;
}
