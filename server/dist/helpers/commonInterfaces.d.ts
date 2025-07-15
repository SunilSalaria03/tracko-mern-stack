import type { ConnectOptions } from "mongoose";
import type { Request } from "express";
import type { Document } from "mongoose";
export interface DatabaseConfig {
    uri: string;
    options: ConnectOptions;
}
export interface AuthRequest extends Request {
    user?: Record<string, any>;
}
export interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    body: T;
}
export interface SignInInput {
    email: string;
    password: string;
}
export interface IUser extends Document {
    role: "0" | "1" | "2";
    email: string;
    image?: string;
    name?: string;
    status: "1" | "0";
    phone_number?: string;
    country_code?: string;
    password: string;
    socialId?: string;
    socialType?: "0" | "1" | "2" | "3";
    resetPasswordToken?: string;
    emailOtpExpiry?: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=commonInterfaces.d.ts.map