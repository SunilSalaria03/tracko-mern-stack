import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/userInterfaces";

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: Number,
      enum: [0, 1, 2], // 0: admin, 1: employee, 2: moderator
      default: 1,
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
      default: 1,
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
    deviceToken: {
      type: String,
      default: '',
    },
    deviceType: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    emailOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
