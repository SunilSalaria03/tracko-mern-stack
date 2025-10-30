import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES } from '../utils/constants/messages';
import {
  getProjectsService,
  getProjectByIdService,
  createProjectService,
  updateProjectService,
  deleteProjectService,
} from '../services/projectService';

export const getProjects = async (
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

    return helper.success(res, 'Projects fetched successfully', result);
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
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    // Check if user is admin
    if (req.user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const { id } = req.params;

    const result = await getProjectByIdService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Project fetched successfully', result);
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
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    // Check if user is admin
    if (req.user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      return helper.failed(res, 'Name and description are required');
    }

    const projectData = {
      name,
      description,
      addedBy: req.user.id,
    };

    const result = await createProjectService(projectData);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Project created successfully', result);
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
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    // Check if user is admin
    if (req.user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // Validate at least one field is provided
    if (!name && !description) {
      return helper.failed(res, 'At least one field (name or description) is required');
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const result = await updateProjectService(id, updateData);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Project updated successfully', result);
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
    if (!req.user) {
      return helper.failed(res, 'User not authenticated');
    }

    // Check if user is admin
    if (req.user.role !== 0) {
      return helper.failed(res, 'Access denied. Admin only.');
    }

    const { id } = req.params;

    const result = await deleteProjectService(id);

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Project deleted successfully', result);
  } catch (error) {
    console.error('Delete project error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};
