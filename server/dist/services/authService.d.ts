import { SignInInput } from '../helpers/commonInterfaces';
export declare const signInService: (data: SignInInput) => Promise<{
    authToken: string;
    role: "0" | "1" | "2";
    email: string;
    image?: string;
    name?: string;
    status: "1" | "0";
    phone_number?: string;
    country_code?: string;
    password: string;
    loginTime: number;
    is_otp_verified?: boolean;
    socialId?: string;
    socialType?: "0" | "1" | "2" | "3";
    resetPasswordToken?: string;
    emailOtpExpiry?: Date;
    otp?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    _id: unknown;
    $locals: Record<string, unknown>;
    $op: "save" | "validate" | "remove" | null;
    $where: Record<string, unknown>;
    baseModelName?: string;
    collection: import("mongoose").Collection;
    db: import("mongoose").Connection;
    errors?: import("mongoose").Error.ValidationError;
    id?: any;
    isNew: boolean;
    schema: import("mongoose").Schema;
    __v: number;
} | {
    error: any;
}>;
//# sourceMappingURL=authService.d.ts.map