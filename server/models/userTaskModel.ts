import mongoose, { Schema } from "mongoose";
import { IUserTask } from "../interfaces/userTaskInterface";

const UserTaskSchema = new Schema<IUserTask>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    workstreamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workstream',
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    spendHours: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    finalSubmit: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserTask>("UserTask", UserTaskSchema);

