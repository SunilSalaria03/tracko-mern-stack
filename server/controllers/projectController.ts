import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES, PROJECT_MESSAGES } from '../utils/constants/messages';
import {
  getProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  addProjectService,
  projectAssignmentService,
  getProjectAssignmentsService,
} from '../services/projectService';
import { projectAssignmentValidation, addProjectValidation } from '../validations/projectValidations';
import { IProject } from '../interfaces/projectInterfaces';

export const getProjects = async (
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

    const result = await getProjectsService(params);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PROJECT_MESSAGES.PROJECTS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get projects error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await getProjectByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PROJECT_MESSAGES.PROJECTS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get project by ID error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const addProject = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = addProjectValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, PROJECT_MESSAGES.PROJECT_CREATION_NOT_ALLOWED);
    }

    const objToSend: Partial<IProject> = {
      ...validatedData,
      addedBy: req.user?.id as string,
    }

    const result = await addProjectService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PROJECT_MESSAGES.PROJECT_ADDED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Add project error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (req.user?.role !== 1 && req.user?.role !== 2) {
      return helper.failed(res, PROJECT_MESSAGES.PROJECT_UPDATE_NOT_ALLOWED);
    }

    const objToSend: Partial<IProject> = {
      ...req.body,
      addedBy: req.user?.id as string,
      id: req.params.id as string,
    }

    const result = await updateProjectService(objToSend);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PROJECT_MESSAGES.PROJECT_UPDATED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Update project error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteProjectService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PROJECT_MESSAGES.PROJECT_DELETED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Delete project error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};

export const projectAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { error, value: validatedData } = projectAssignmentValidation(req.body);
    if (error) {
      return helper.failed(res, error.details[0].message);
    }

    const objToSend: Partial<IProject> = {
      ...validatedData,
      addedBy: req.user?.id as string,
    }

    const result = await projectAssignmentService(objToSend);
    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, PROJECT_MESSAGES.PROJECT_ASSIGNMENT_CREATED_SUCCESSFULLY, result);

  } catch (error) {
    console.error('Add project assignment error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};


export const getProjectAssignments = async(
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const result = await getProjectAssignmentsService({ userId: req.user?.id as string });
    
    if ('error' in result) {
      return helper.failed(res, result.error);
    }
    return helper.success(res, PROJECT_MESSAGES.PROJECTS_FETCHED_SUCCESSFULLY, result);
  } catch (error) {
    console.error('Get project assignments error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};