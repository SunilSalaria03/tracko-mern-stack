import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import MESSAGES, { USER_MESSAGES, GENERAL_MESSAGES, AUTH_MESSAGES } from '../utils/constants/messages';
import { changePasswordService, editUserService, getProfileService, updateProfileService, uploadFileService } from '../services/userService';
import { changePasswordValidation } from '../validations/authValidations';
import { addUserService } from '../services/userService';
import { addUserValidation } from '../validations/userValidations';
import { deleteUserService, getUserByIdService, getUsersService } from '../services/userService';
import { IUser } from '@/interfaces/userInterfaces';

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

    if (req.body.email || req.body.role || req.body.password || req.body.tenantId) {
      return helper.failed(res, USER_MESSAGES.RESTRICTED_FIELDS_CANNOT_BE_UPDATED);
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

export const addUser = async (req: any, res: Response): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addUserValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const objToSend: Partial<IUser> = {
      ...validatedData,
      addedBy: req.user?.id,
      addedByUserRole: req.user?.role,
      addedByUserTenantId: req.user?.tenantId ?? null,
    }

    const result = await addUserService(objToSend, req.files);
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

    if(req.body && req.body.tenantId) {
      return helper.failed(res, USER_MESSAGES.TENANT_ID_RESTRICTED_FIELDS_CANNOT_BE_UPDATED);
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

export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    console.log('req.user', req.user);
    const user = req.user;
    if (user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const params = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await getUsersService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Users fetched successfully', result);
  } catch (error) {
    console.error('Get users error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    // Check if user is admin
    if (req.user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const { id } = req.params;

    const result = await getUserByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User fetched successfully', result);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    // Check if user is admin
    if (req.user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const { id } = req.params;

    const result = await deleteUserService(id as string);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User deleted successfully', result);
  } catch (error) {
    console.error('Delete user error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};