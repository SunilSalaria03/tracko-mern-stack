import { Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description: string;
  isDeleted?: boolean;
  addedBy?: string;
  status: 1 | 0;
}