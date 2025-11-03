import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/userInterfaces";

const UserSchema = new Schema<IUser>(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
    },
    role: {
      type: Number,
      enum: [0, 1, 2, 3], // 0: super admin, 1: admin, 2: manager, 3: user
      default: 2,
      required: true,
    },
    designationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designation',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      description: "1 = active, 0 = inactive",
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    emailOtpExpiry: {
      type: Date,
      default: null,
    },
    tempPassword: {
      type: String,
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    grantedPermissionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Permission',
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
