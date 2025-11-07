import mongoose, { Schema } from "mongoose";

import { IPermission } from "../interfaces/permissionInterfaces";

const PermissionSchema = new Schema<IPermission>(
  {
    role: {
        type: Number,
        enum: [1, 2, 3],
        default: 1,
        description: "1 = admin, 2 = manager, 3 = user",
    },
    rolePermissionIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Permission',
        default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPermission>("Permission", PermissionSchema);

