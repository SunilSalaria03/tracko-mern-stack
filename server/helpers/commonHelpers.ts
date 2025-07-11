import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  code: number;
  message: string;
  body: any;
}

export const failed = (res: Response, message: string | object = ''): Response<ApiResponse> => {
  const finalMessage =
    typeof message === 'object'
      ? (message as any).message || ''
      : message;

  return res.status(400).json({
    success: false,
    code: 400,
    message: finalMessage,
    body: {},
  });
};

export const error = (res: Response, err: any): Response<ApiResponse> => {
  const code = typeof err === 'object' && err.code ? err.code : 403;
  const message = typeof err === 'object' ? err.message || '' : err;

  return res.status(code).json({
    success: false,
    code,
    message,
    body: {},
  });
};

export const success = (
  res: Response,
  message: string | object = '',
  data: any
): Response<ApiResponse> => {
  const finalMessage =
    typeof message === 'object'
      ? (message as any).message || ''
      : message;

  return res.status(200).json({
    success: true,
    code: 200,
    message: finalMessage,
    body: data,
  });
};

export const unixTimestamp = (): number => Math.floor(Date.now() / 1000);
