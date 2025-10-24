import { Request, Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { 
  signInService, 
  signUpService, 
  deleteAccountService, 
  logoutService,
  forgotPasswordService,
  resetPasswordService 
} from '../services/authService';
import { signInValidation, signUpValidation } from '../validations/commonValidations';
import { forgotPasswordValidation, resetPasswordValidation } from '../validations/authValidations';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { AUTH_MESSAGES, USER_MESSAGES, GENERAL_MESSAGES } from '../utils/constants/messages';

export const signIn = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { error } = signInValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const objToSend = {
        email: req.body.email,
        password: req.body.password,
    }
    const result = await signInService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result?.error);
    }
    return helper.success(res, AUTH_MESSAGES.LOGIN_SUCCESS, result);
  } catch (error) {
    console.error('Sign-in error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const signUp = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { error } = signUpValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const signUpData = {
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      countryCode: req.body.countryCode,
    };

    const result = await signUpService(signUpData, req.files);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, AUTH_MESSAGES.SIGNUP_SUCCESS, result);
  } catch (error) {
    console.error('Signup error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, AUTH_MESSAGES.USER_NOT_AUTHENTICATED);
    }

    const result = await deleteAccountService(req.user);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, USER_MESSAGES.ACCOUNT_DELETED, result);
  } catch (error) {
    console.error('Delete account error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, AUTH_MESSAGES.USER_NOT_AUTHENTICATED);
    }

    const result = await logoutService(req.user);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, AUTH_MESSAGES.LOGOUT_SUCCESS, result);
  } catch (error) {
    console.error('Logout error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {    
    const { error } = forgotPasswordValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const result = await forgotPasswordService(req.body);

    if ("error" in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS, result);
  } catch (error: any) {
    console.error("Forgot password controller error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { error } = resetPasswordValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const result = await resetPasswordService(req.body);

    if ("error" in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, AUTH_MESSAGES.PASSWORD_RESET_SUCCESS, result);
  } catch (error) {
    console.error("Reset password controller error:", error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};