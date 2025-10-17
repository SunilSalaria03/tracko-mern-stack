import { Request, Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { signInService, signUpService, deleteAccountService, logoutService } from '../services/authService';
import { signInValidation, signUpValidation } from '../validations/commonValidations';
import { AuthRequest } from '../interfaces/commonInterfaces';

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
    return helper.success(res, 'Sign-in successful', result);
  } catch (error) {
    console.error('Sign-in error:', error);
    return helper.error(res, 'Something went wrong');
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

    return helper.success(res, 'Signup successful and your free trial has been started', result);
  } catch (error) {
    console.error('Signup error:', error);
    return helper.error(res, 'Something went wrong');
  }
};
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    const result = await deleteAccountService(req.user);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Account deleted successfully', result);
  } catch (error) {
    console.error('Delete account error:', error);
    return helper.error(res, 'Something went wrong');
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    const result = await logoutService(req.user);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User Logged Out Successfully', result);
  } catch (error) {
    console.error('Logout error:', error);
    return helper.error(res, 'Something went wrong');
  }
};

// export const forgotPassword = async (req: Request, res: Response): Promise<Response | void> => {
//   try {
//     const { error } = forgotPasswordValidation(req.body);
//     if (error) {
//       return helper.failed(res, error.details[0].message);
//     }

//     const result = await forgotPasswordService(req.body);

//     if ('error' in result) {
//       return helper.failed(res, result.error);
//     }

//     return helper.success(res, 'Mail sent successfully', result);
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     return helper.error(res, 'Something went wrong');
//   }
// };

// export const resetPasswordLink = async (req: Request, res: Response): Promise<Response | void> => {
//   try {
//     const { token, email } = req.query;
    
//     if (!token || !email) {
//       return helper.failed(res, 'Token and email are required');
//     }

//     const result = await resetPasswordService({ token: token as string, email: email as string });

//     if ('error' in result) {
//       return res.render('reset-password', { 
//         error: result.error, 
//         token: null, 
//         email: null 
//       });
//     }

//     return res.render('reset-password', { 
//       error: null, 
//       token: token as string, 
//       email: email as string 
//     });
//   } catch (error) {
//     console.error('Reset password link error:', error);
//     return res.render('reset-password', { 
//       error: 'Something went wrong', 
//       token: null, 
//       email: null 
//     });
//   }
// };

// export const resetPassword = async (req: Request, res: Response): Promise<Response | void> => {
//   try {
//     const { error } = resetPasswordValidation(req.body);
//     if (error) {
//       return helper.failed(res, error.details[0].message);
//     }

//     const result = await resetPasswordService(req.body);

//     if ('error' in result) {
//       return helper.failed(res, result.error);
//     }

//     return helper.success(res, 'Password reset successfully', result);
//   } catch (error) {
//     console.error('Reset password error:', error);
//     return helper.error(res, 'Something went wrong');
//   }
// };  
