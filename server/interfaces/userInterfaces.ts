import { Document } from "mongoose";

export interface IUser extends Document {
    role: 0 | 1 | 2;
    email: string;
    profileImage?: string;
    name?: string;
    status: 1 | 0;
    phoneNumber?: string;
    countryCode?: string;
    dateOfBirth?: string;
    password: string;
    isDeleted?: boolean;
    resetPasswordToken?: string | null;
    emailOtpExpiry?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    tempPassword?: string | null;
    Designation?: string;
    Department?: string;
    Location?: string;
    addedBy?: string | null;
  }

export interface IChangePassword {
  userId: string;
  oldPassword: string;
  newPassword: string;
}