import { Response } from 'express';
interface ApiResponse {
    success: boolean;
    code: number;
    message: string;
    body: any;
}
export declare const failed: (res: Response, message?: string | object) => Response<ApiResponse>;
export declare const error: (res: Response, err: any) => Response<ApiResponse>;
export declare const success: (res: Response, message: string | object | undefined, data: any) => Response<ApiResponse>;
export declare const unixTimestamp: () => number;
export {};
//# sourceMappingURL=commonHelpers.d.ts.map