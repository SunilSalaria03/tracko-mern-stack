import { Document } from "mongoose";

export interface IUser extends Document {
    role: 0 | 1 | 2;
    email: string;
    profileImage?: string;
    name?: string;
    status: 1 | 0;
    phoneNumber?: string;
    countryCode?: string;
    password: string;
    isDeleted?: boolean;
    resetPasswordToken?: string | null;
    emailOtpExpiry?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    deviceToken?: string;
    deviceType?: string;
  }