import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import MESSAGES, { USER_MESSAGES, GENERAL_MESSAGES, AUTH_MESSAGES } from '../utils/constants/messages';
import { changePasswordService, editUserService, getProfileService, updateProfileService, uploadFileService } from '../services/userService';
import { changePasswordValidation } from '../validations/authValidations';
import { addUserService } from '../services/authService';
import { addUserValidation } from '../validations/userValidations';

export const getProfile = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    const result = await getProfileService(req.user.id);
    if ("error" in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Profile fetched successfully', result);
  } catch (error) {
    console.error('Get profile error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    if (req.body.email || req.body.role || req.body.password) {
      return helper.failed(res, 'Cannot update restricted fields');
    }
    
    const result = await updateProfileService(req.user.id, req.body, req.files);
    if ("error" in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, USER_MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Update profile error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const changePassword = async (req: any, res: Response): Promise<Response | void> => {
  try {
    const { error } = changePasswordValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const objToSend = {
      userId: req.user.id,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    };

    const result = await changePasswordService(objToSend);
    if ("error" in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, USER_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Change password error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addUser = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addUserValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const result = await addUserService(validatedData, req.files);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, USER_MESSAGES.USER_ADDED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Add user error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return helper.failed(res, USER_MESSAGES.USER_ID_REQUIRED);
    }

    const result = await editUserService(userId as string, req.body, req.files);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(
      res,
      USER_MESSAGES.USER_UPDATED,
      result
    );
  } catch (err) {
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const uploadFile = async (
  req: any,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.files || !req.files.file) {
      return helper.failed(res, USER_MESSAGES.FILE_NOT_FOUND);
    }
    const result = await uploadFileService(req.files.file);

    if (!result) {
      return helper.failed(res, USER_MESSAGES.FILE_UPLOAD_FAILED);
    }
    return helper.success(res, USER_MESSAGES.FILE_UPLOAD_SUCCESS, result);
  } catch (error) {
    console.error("File Upload controller error:", error);
    return helper.error(res, USER_MESSAGES.FILE_UPLOAD_FAILED);
  }
};
