import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    tenantId?: mongoose.Schema.Types.ObjectId | null;
    role: 0 | 1 | 2 | 3;
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
    designation?: string;
    department?: string;
    Location?: string;
    addedBy?: string | null;
    addedByUserRole?: 0 | 1 | 2 | 3;
    addedByUserTenantId?: mongoose.Schema.Types.ObjectId | null;
  }

export interface IChangePassword {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface IListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}