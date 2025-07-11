import { Request, Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { signInService } from '../services/authService';
import { signInValidation } from '../validations/common';

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
