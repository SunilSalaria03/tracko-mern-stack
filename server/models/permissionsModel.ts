import mongoose, { Schema } from "mongoose";

import { IPermission } from "../interfaces/permissionInterfaces";

const PermissionSchema = new Schema<IPermission>(
  {
    permissionName: {
      type: String,
      required: true,
      trim: true,
    },
    permissionDescription: {
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

export default mongoose.model<IPermission>("Permission", PermissionSchema);

