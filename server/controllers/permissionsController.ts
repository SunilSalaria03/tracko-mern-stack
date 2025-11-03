import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES, PERMISSION_MESSAGES } from '../utils/constants/messages';
import {
  getPermissionsService,
  getPermissionByIdService,
  updatePermissionService,
  deletePermissionService,
  addPermissionService,
} from '../services/permissionService';
import { IPermission } from '../interfaces/permissionInterfaces';
import { addPermissionValidation } from '../validations/permissionValidations';

export const getPermissions = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const params = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await getPermissionsService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PERMISSION_MESSAGES.PERMISSIONS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get permissions error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getPermissionById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await getPermissionByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Permission fetched successfully', result);
  } catch (error) {
    console.error('Get permission by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addPermission = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addPermissionValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, PERMISSION_MESSAGES.PERMISSION_CREATION_NOT_ALLOWED);
    }

    const objToSend: Partial<IPermission> = {
      ...validatedData,
      addedBy: req.user?.id as string,
    }

    const result = await addPermissionService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Permission created successfully', result);
  } catch (error) {
    console.error('Add permission error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updatePermission = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, PERMISSION_MESSAGES.PERMISSION_UPDATE_NOT_ALLOWED);
    }

    const objToSend: Partial<IPermission> = {
      ...req.body,
      addedBy: req.user?.id as string,
      id: req.params.id as string,
    }

    const result = await updatePermissionService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Permission updated successfully', result);
  } catch (error) {
    console.error('Update permission error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deletePermission = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deletePermissionService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Permission deleted successfully', result);
  } catch (error) {
    console.error('Delete permission error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};
