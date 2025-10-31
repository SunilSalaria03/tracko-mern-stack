import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES, DEPARTMENT_MESSAGES } from '../utils/constants/messages';
import {
  getDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
  addDepartmentService,
} from '../services/departmentService';
import { IDepartment } from '../interfaces/departmentInterfaces';
import { addDepartmentValidation } from '../validations/departmentValidations';

export const getDepartments = async (
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

    const result = await getDepartmentsService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, DEPARTMENT_MESSAGES.DEPARTMENTS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get departments error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getDepartmentById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await getDepartmentByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Department fetched successfully', result);
  } catch (error) {
    console.error('Get department by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addDepartmentValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, DEPARTMENT_MESSAGES.DEPARTMENT_CREATION_NOT_ALLOWED);
    }

    const objToSend: Partial<IDepartment> = {
      ...validatedData,
      addedBy: req.user?.id as string,
    }

    const result = await addDepartmentService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Department created successfully', result);
  } catch (error) {
    console.error('Add department error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, DEPARTMENT_MESSAGES.DEPARTMENT_UPDATE_NOT_ALLOWED);
    }

    const objToSend: Partial<IDepartment> = {
      ...req.body,
      addedBy: req.user?.id as string,
      id: req.params.id as string,
    }

    const result = await updateDepartmentService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Department updated successfully', result);
  } catch (error) {
    console.error('Update department error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteDepartmentService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Department deleted successfully', result);
  } catch (error) {
    console.error('Delete department error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};
