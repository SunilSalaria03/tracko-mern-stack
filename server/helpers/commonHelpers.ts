import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

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

export const imageUpload = (file: any, folder: string): string => {
  try {
    const uploadDir = path.join(__dirname, '..', 'public', folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Move file to upload directory
    file.mv(filePath);
    
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error('Image upload error:', error);
    return '';
  }
};

// Generate random numbers
export const generateRandomNumbers = (length: number): string => {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
};

// Encrypt string
export const encrypt = (text: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'fallback_key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const welcomeHtml = (bgImageLink: string, logoImageLink: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Tracko</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="background-image: url('${bgImageLink}'); background-size: cover; background-position: center; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoImageLink}" alt="Tracko Logo" style="max-width: 200px; height: auto;">
          </div>
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to Tracko!</h1>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Tracko! Your account has been successfully created and your free trial has started.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We're excited to have you on board and can't wait to see what you'll create with our platform.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Reset password email HTML template
export const resetPasswordHtml = (resetPasswordLink: string, logoImageLink: string, bgImageLink: string, userName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password - Tracko</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="background-image: url('${bgImageLink}'); background-size: cover; background-position: center; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoImageLink}" alt="Tracko Logo" style="max-width: 200px; height: auto;">
          </div>
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Reset Your Password</h1>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hello ${userName},
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${resetPasswordLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            If you didn't request this password reset, you can safely ignore this email. The link will expire in 10 minutes.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser: ${resetPasswordLink}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Modern reset email template with Cloudinary logo
export const resetEmailTemplate = (resetPasswordLink: string, userName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 90%;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://res.cloudinary.com/douhm2cpi/image/upload/v1755082255/uploads/images/finallogo.png" alt="Logo" style="max-width: 200px; height: auto;">
          </div>
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Reset Your Password</h1>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hello ${userName},
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${resetPasswordLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            If you didn't request this password reset, you can safely ignore this email. The link will expire in 10 minutes.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser: ${resetPasswordLink}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};