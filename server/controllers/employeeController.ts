import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES } from '../utils/constants/messages';
import {
  getEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
} from '../services/employeeService';

export const getEmployees = async (
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

    const result = await getEmployeesService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Employees fetched successfully', result);
  } catch (error) {
    console.error('Get employees error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getEmployeeById = async (
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

    const result = await getEmployeeByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Employee fetched successfully', result);
  } catch (error) {
    console.error('Get employee by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateEmployee = async (
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

    // Block updating email and password through this endpoint
    if (req.body.email || req.body.password) {
      return helper.failed(res, 'Cannot update email or password through this endpoint');
    }

    const result = await updateEmployeeService(id, req.body);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Employee updated successfully', result);
  } catch (error) {
    console.error('Update employee error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteEmployee = async (
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

    const result = await deleteEmployeeService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Employee deleted successfully', result);
  } catch (error) {
    console.error('Delete employee error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

