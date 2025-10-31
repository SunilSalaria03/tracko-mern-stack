import { Document } from "mongoose";

export interface IWorkstream extends Document {
  name: string;
  description: string;
  isDeleted?: boolean;
  addedBy?: string;
  status: 1 | 0;
}