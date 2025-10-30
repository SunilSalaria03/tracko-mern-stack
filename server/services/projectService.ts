import { IProject, ProjectListParams } from "../interfaces/projectInterfaces";
import projectModel from "../models/projectModel";
import { GENERAL_MESSAGES, PROJECT_MESSAGES } from "../utils/constants/messages";

export const getProjectsService = async (params: ProjectListParams) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || "";
    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    const searchQuery: any = {
      isDeleted: false,
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      projectModel
        .find(searchQuery)
        .populate("addedBy", "name email")
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
    console.error("Get projects service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch projects";
    return { error: message };
  }
};

export const getProjectByIdService = async (projectId: string) => {
  try {
    const project = await projectModel
      .findOne({ _id: projectId, isDeleted: false })
      .populate("addedBy", "name email");

    if (!project) {
      return { error: PROJECT_MESSAGES.PROJECT_NOT_FOUND };
    }

    return project;
  } catch (error) {
    console.error("Get project by ID service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch project";
    return { error: message };
  }
};

export const addProjectService = async (data: Partial<IProject>) => {
  try {
    const existingProject = await projectModel.findOne({
      name: data.name,
      isDeleted: false,
    });
    if (existingProject) {
      return { error: "Project with this name already exists" };
    }

    const createdProject = await projectModel.create(data);

    return createdProject;
  } catch (error) {
    console.error("Create project service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create project";
    return { error: message };
  }
};

export const updateProjectService = async (data: Partial<IProject>) => {
  try {
    const project = await projectModel.findOne({
      _id: data?.id,
      isDeleted: false,
    });
    if (!project) {
      return { error: PROJECT_MESSAGES.PROJECT_NOT_FOUND };
    }

    if (data?.name && data?.name !== project.name) {
      const existingProject = await projectModel.findOne({
        name: data?.name,
        isDeleted: false,
        _id: { $ne: data?.id },
      });

      if (existingProject) {
        return { error: "Project with this name already exists" };
      }
    }

    const updatedProject = await projectModel
      .findOneAndUpdate({ _id: data?.id, isDeleted: false }, data, {
        new: true,
        runValidators: true,
      })

    if (!updatedProject) {
      return { error: PROJECT_MESSAGES.PROJECT_NOT_FOUND };
    }

    return updatedProject;
  } catch (error) {
    console.error("Update project service error:", error);
    const message =
      error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const deleteProjectService = async (projectId: string) => {
  try {
    const project = await projectModel.findOne({
      _id: projectId,
      isDeleted: false,
    });

    if (!project) {
      return { error: PROJECT_MESSAGES.PROJECT_NOT_FOUND };
    }

    const deletedProject = await projectModel.findByIdAndUpdate(
      projectId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProject) {
      return { error: PROJECT_MESSAGES.PROJECT_NOT_FOUND };
    }

    return deletedProject;
  } catch (error) {
    console.error("Delete project service error:", error);
    const message = error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};
