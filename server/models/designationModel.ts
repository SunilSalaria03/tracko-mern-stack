import mongoose, { Schema } from "mongoose";
import { IDesignation } from "../interfaces/designationInterfaces";

const DesignationSchema = new Schema<IDesignation>(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
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

export default mongoose.model<IDesignation>("Designation", DesignationSchema);

