import mongoose, { Schema } from "mongoose";
import { IProject } from "../interfaces/projectInterfaces";

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      description: "1 = active, 0 = inactive",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>("Project", ProjectSchema);

