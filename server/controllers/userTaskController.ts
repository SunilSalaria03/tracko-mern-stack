import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES, USER_TASK_MESSAGES } from '../utils/constants/messages';
import {
  getUserTasksService,
  getUserTaskByIdService,
  updateUserTaskService,
  deleteUserTaskService,
  addUserTaskService,
  finalSubmitUserTaskService,
} from '../services/userTaskService';
import { IUserTask } from '../interfaces/userTaskInterface';
import { addUserTaskValidation, finalSubmitUserTaskValidation } from '../validations/userTaskValidations';
import mongoose from 'mongoose';

export const getUserTasks = async (
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
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const result = await getUserTasksService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, USER_TASK_MESSAGES.USER_TASKS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get user tasks error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getUserTaskById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await getUserTaskByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User task fetched successfully', result);
  } catch (error) {
    console.error('Get user task by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addUserTask = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addUserTaskValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const objToSend: Partial<IUserTask> = {
      ...validatedData,
      userId: req.user?.id as string,
      addedBy: req.user?.id as string,
    }

    const result = await addUserTaskService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User task created successfully', result);
  } catch (error) {
    console.error('Add user task error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateUserTask = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if(!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return helper.failed(res, USER_TASK_MESSAGES.INVALID_USER_TASK_ID);
    }

    const objToSend: Partial<IUserTask> = {
      ...req.body,
      taskId: req.params.id as string,
      addedBy: req.user?.id as string,
    }

    const result = await updateUserTaskService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User task updated successfully', result);
  } catch (error) {
    console.error('Update user task error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteUserTask = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteUserTaskService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User task deleted successfully', result);
  } catch (error) {
    console.error('Delete user task error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const finalSubmitUserTask = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    console.log(req.body);
    const { error, value: validatedData } = finalSubmitUserTaskValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const objToSend: Partial<IUserTask> = {
      userId: req.user?.id as string,
      finalSubmit: true,
      ...validatedData,
    }
    const result = await finalSubmitUserTaskService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'User task final submitted successfully', result);
  } catch (error) {
    console.error('Final submit user task error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};