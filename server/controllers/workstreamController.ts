import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES, WORKSTREAM_MESSAGES } from '../utils/constants/messages';
import {
  getWorkstreamsService,
  getWorkstreamByIdService,
  updateWorkstreamService,
  deleteWorkstreamService,
  addWorkstreamService,
} from '../services/workstreamService';
import { IWorkstream } from '../interfaces/workstreamInterfaces';
import { addWorksteamValidation } from '../validations/workstreamValidations';

export const getWorkstreams = async (
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

    const result = await getWorkstreamsService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, WORKSTREAM_MESSAGES.WORKSTREAMS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get workstreams error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getWorkstreamById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await getWorkstreamByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Workstream fetched successfully', result);
  } catch (error) {
    console.error('Get workstream by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addWorkstream = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addWorksteamValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, WORKSTREAM_MESSAGES.WORKSTREAM_CREATION_NOT_ALLOWED);
    }

    const objToSend: Partial<IWorkstream> = {
      ...validatedData,
      addedBy: req.user?.id as string,
    }

    const result = await addWorkstreamService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Workstream created successfully', result);
  } catch (error) {
    console.error('Add workstream error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateWorkstream = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, WORKSTREAM_MESSAGES.WORKSTREAM_UPDATE_NOT_ALLOWED);
    }

    const objToSend: Partial<IWorkstream> = {
      ...req.body,
      addedBy: req.user?.id as string,
      id: req.params.id as string,
    }

    const result = await updateWorkstreamService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Workstream updated successfully', result);
  } catch (error) {
    console.error('Update workstream error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteWorkstream = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteWorkstreamService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Workstream deleted successfully', result);
  } catch (error) {
    console.error('Delete workstream error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};
