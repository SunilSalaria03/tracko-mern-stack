import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES, DESIGNATION_MESSAGES } from '../utils/constants/messages';
import {
  getDesignationsService,
  getDesignationByIdService,
  updateDesignationService,
  deleteDesignationService,
  addDesignationService,
} from '../services/designationService';
import { addDesignationValidation } from '../validations/designationValidations';
import { IDesignation } from '../interfaces/designationInterfaces';

export const getDesignations = async (
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

    const result = await getDesignationsService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, DESIGNATION_MESSAGES.DESIGNATIONS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get designations error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getDesignationById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await getDesignationByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Designation fetched successfully', result);
  } catch (error) {
    console.error('Get designation by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addDesignation = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addDesignationValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, DESIGNATION_MESSAGES.DESIGNATION_CREATION_NOT_ALLOWED);
    }

    const objToSend: Partial<IDesignation> = {
      ...validatedData,
      addedBy: req.user?.id as string,
    }

    const result = await addDesignationService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Designation created successfully', result);
  } catch (error) {
    console.error('Add designation error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateDesignation = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, DESIGNATION_MESSAGES.DESIGNATION_UPDATE_NOT_ALLOWED);
    }

    const objToSend: Partial<IDesignation> = {
      ...req.body,
      addedBy: req.user?.id as string,
      id: req.params.id as string,
    }

    const result = await updateDesignationService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Designation updated successfully', result);
  } catch (error) {
    console.error('Update designation error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteDesignation = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteDesignationService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Designation deleted successfully', result);
  } catch (error) {
    console.error('Delete designation error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};
