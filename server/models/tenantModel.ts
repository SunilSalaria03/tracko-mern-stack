import { ITenant } from "@/interfaces/tenantInterface";
import mongoose, { Schema } from "mongoose";

const TenantSchema = new Schema<ITenant>(
  {
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

export default mongoose.model<ITenant>("Tenant", TenantSchema);
