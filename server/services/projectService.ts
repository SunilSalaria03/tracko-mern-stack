import projectModel from '../models/projectModel';

interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreateProjectData {
  name: string;
  description: string;
  addedBy?: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
}

export const getProjectsService = async (params: ProjectListParams) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || '';
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    // Build search query
    const searchQuery: any = {
      isDeleted: false,
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute queries
    const [projects, total] = await Promise.all([
      projectModel
        .find(searchQuery)
        .populate('addedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      projectModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      projects,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Get projects service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
    return { error: message };
  }
};

export const getProjectByIdService = async (projectId: string) => {
  try {
    const project = await projectModel
      .findOne({ _id: projectId, isDeleted: false })
      .populate('addedBy', 'name email');

    if (!project) {
      return { error: 'Project not found' };
    }

    return project;
  } catch (error) {
    console.error('Get project by ID service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch project';
    return { error: message };
  }
};

export const createProjectService = async (projectData: CreateProjectData) => {
  try {
    // Check if project with same name already exists
    const existingProject = await projectModel.findOne({
      name: projectData.name,
      isDeleted: false,
    });

    if (existingProject) {
      return { error: 'Project with this name already exists' };
    }

    const newProject = new projectModel(projectData);
    await newProject.save();

    return newProject;
  } catch (error) {
    console.error('Create project service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create project';
    return { error: message };
  }
};

export const updateProjectService = async (
  projectId: string,
  updateData: UpdateProjectData
) => {
  try {
    const project = await projectModel.findOne({ _id: projectId, isDeleted: false });

    if (!project) {
      return { error: 'Project not found' };
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== project.name) {
      const existingProject = await projectModel.findOne({
        name: updateData.name,
        isDeleted: false,
        _id: { $ne: projectId },
      });

      if (existingProject) {
        return { error: 'Project with this name already exists' };
      }
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    if (!updatedProject) {
      return { error: 'Project not found' };
    }

    return updatedProject;
  } catch (error) {
    console.error('Update project service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update project';
    return { error: message };
  }
};

export const deleteProjectService = async (projectId: string) => {
  try {
    const project = await projectModel.findOne({ _id: projectId, isDeleted: false });

    if (!project) {
      return { error: 'Project not found' };
    }

    // Soft delete
    const deletedProject = await projectModel.findByIdAndUpdate(
      projectId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProject) {
      return { error: 'Project not found' };
    }

    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Delete project service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete project';
    return { error: message };
  }
};

