import mongoose from "mongoose";

import { IUserTask } from "../interfaces/userTaskInterface";
import { IListParams } from "../interfaces/userInterfaces";
import userTaskModel from "../models/userTaskModel";
import { GENERAL_MESSAGES, PROJECT_MESSAGES, USER_MESSAGES, USER_TASK_MESSAGES, WORKSTREAM_MESSAGES } from "../utils/constants/messages";
import projectModel from "../models/projectModel";
import workstreamModel from "../models/workstreamModel";

export const getUserTasksService = async (params: IListParams) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || "";
    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder || "desc";
    const startDate = params.startDate ? new Date(params.startDate) : null;
    const endDate = params.endDate ? new Date(params.endDate) : null;

    const searchQuery: any = {
      isDeleted: false,
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      searchQuery.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      searchQuery.date = { $gte: startDate };
    } else if (endDate) {
      searchQuery.date = { $lte: endDate };
    }

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const [userTasks, total] = await Promise.all([
      userTaskModel
        .find(searchQuery)
        .populate("userId", "name email")
        .populate("projectId", "name")
        .populate("workstreamId", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      userTaskModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      userTasks,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Get user tasks service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch user tasks";
    return { error: message };
  }
};

export const getUserTaskByIdService = async (userTaskId: string) => {
  try {
    const userTaskIdStr = typeof userTaskId === "string" ? userTaskId : userTaskId as string;
    if(!mongoose.Types.ObjectId.isValid(userTaskIdStr)) {
      return { error: USER_TASK_MESSAGES.INVALID_USER_TASK_ID };
    }

    const userTask = await userTaskModel
      .findOne({ _id: userTaskIdStr, isDeleted: false })
      .populate("userId", "name email")
      .populate("projectId", "name")
      .populate("workstreamId", "name")
      .populate("addedBy", "name email");

    if (!userTask) {
      return { error: USER_TASK_MESSAGES.USER_TASK_NOT_FOUND };
    }

    return userTask;
  } catch (error) {
    console.error("Get user task by ID service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch user task";
    return { error: message };
  }
};

export const addUserTaskService = async (data: Partial<IUserTask>) => {
  try {
    if(data.projectId) {
      const projectIdStr = typeof data.projectId === "string" ? data.projectId : data.projectId.toString();
      if(!mongoose.Types.ObjectId.isValid(projectIdStr)) {
        return { error: "Invalid project ID" };
      }

      const project = await projectModel.findOne({
        _id: projectIdStr,
        isDeleted: false,
      });
      if (!project) {
        return { error: "Project not found" };
      }
    }

    if(data.workstreamId) {
      const workstreamIdStr = typeof data.workstreamId === "string" ? data.workstreamId : data.workstreamId.toString();
      if(!mongoose.Types.ObjectId.isValid(workstreamIdStr)) {
        return { error: "Invalid workstream ID" };
      }

      const workstream = await workstreamModel.findOne({
        _id: workstreamIdStr,
        isDeleted: false,
      });
      if (!workstream) {
        return { error: "Workstream not found" };
      }
    }

    const createdUserTask = await userTaskModel.create(data);

    return createdUserTask;
  } catch (error) {
    console.error("Create user task service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create user task";
    return { error: message };
  }
};

export const updateUserTaskService = async (data: Partial<IUserTask>) => {
  try {
    if(data.projectId) {
      const projectIdStr = typeof data.projectId === "string" ? data.projectId : data.projectId.toString();
      if(!mongoose.Types.ObjectId.isValid(projectIdStr)) {
        return { error: "Invalid project ID" };
      }
    const project = await projectModel.findOne({
      _id: projectIdStr,
      isDeleted: false,
    });
    if (!project) {
      return { error: PROJECT_MESSAGES.PROJECT_NOT_FOUND };
    }
  }
  if(data.workstreamId) {
    const workstreamIdStr = typeof data.workstreamId === "string" ? data.workstreamId : data.workstreamId.toString();
    if(!mongoose.Types.ObjectId.isValid(workstreamIdStr)) {
      return { error: "Invalid workstream ID" };
    }
    const workstream = await workstreamModel.findOne({
      _id: workstreamIdStr,
      isDeleted: false,
    });
    if (!workstream) {
      return { error: WORKSTREAM_MESSAGES.WORKSTREAM_NOT_FOUND };
    }
  }
    
  if(!data.taskId){
    return { error: "Task ID is required" };
  }

  const taskIdStr = typeof data.taskId === "string" ? data.taskId : data.taskId.toString();
  if(!mongoose.Types.ObjectId.isValid(taskIdStr)) {
    return { error: "Invalid task ID" };
  }

  const task = await userTaskModel.findOne({
    _id: taskIdStr,
    isDeleted: false,
  });

  if (!task) {
    return { error: USER_TASK_MESSAGES.USER_TASK_NOT_FOUND };
  }

  if(task.finalSubmit === true) {
    return { error: USER_TASK_MESSAGES.CANNOT_UPDATE_AFTER_FINAL_SUBMIT_TASK };
  }

  // Remove taskId from update data as it's not a field in the schema
  const { taskId, ...updateData } = data;

  const updatedUserTask = await userTaskModel.findOneAndUpdate(
    { _id: taskIdStr, isDeleted: false }, 
    updateData, 
    {
      new: true,
      runValidators: true,
    }
  );
  
  if (!updatedUserTask) {
    return { error: USER_TASK_MESSAGES.USER_TASK_NOT_FOUND };
  }
  
  return updatedUserTask;
  } catch (error) {
    console.error("Update project service error:", error);
    const message =
      error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const deleteUserTaskService = async (userTaskId: string) => {
  try {
    const userTask = await userTaskModel.findOne({
      _id: userTaskId,
      isDeleted: false,
    });

    if (!userTask) {
      return { error: USER_TASK_MESSAGES.USER_TASK_NOT_FOUND };
    }

    if(userTask.finalSubmit === true) {
      return { error: USER_TASK_MESSAGES.CANNOT_DELETE_AFTER_FINAL_SUBMIT_TASK };
    }

    const deletedUserTask = await userTaskModel.findByIdAndUpdate(
      userTaskId,
      { isDeleted: true },
      { new: true }
    );

      if (!deletedUserTask) {
      return { error: USER_TASK_MESSAGES.USER_TASK_NOT_FOUND };
    }

    return deletedUserTask;
  } catch (error) {
    console.error("Delete project service error:", error);
    const message = error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const finalSubmitUserTaskService = async (data: Partial<IUserTask>) => {
  try {
    const userIdStr = typeof data.userId === "string" ? data.userId : data.userId?.toString();
    if(!userIdStr || !mongoose.Types.ObjectId.isValid(userIdStr)) {
      return { error: USER_MESSAGES.INVALID_USER_ID };
    }

    const query: any = {
      userId: userIdStr,
      isDeleted: false,
      finalSubmit: false,
    };

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const bulkUpdateResult = await userTaskModel.updateMany(
      query,
      { finalSubmit: true },
      { runValidators: true }
    );

    if (bulkUpdateResult.modifiedCount === 0) {
      return { error: "No tasks found to submit" };
    }

    const updatedTasks = await userTaskModel.find({
      userId: userIdStr,
      isDeleted: false,
      finalSubmit: true,
      ...(data.startDate && data.endDate && {
        date: {
          $gte: new Date(data.startDate),
          $lte: new Date(data.endDate)
        }
      })
    })
    .populate("userId", "name email")
    .populate("projectId", "name")
    .populate("workstreamId", "name");

    return {
      message: `Successfully submitted ${bulkUpdateResult.modifiedCount} tasks`,
      count: bulkUpdateResult.modifiedCount,
      tasks: updatedTasks
    };
  } catch (error) {
    console.error("Final submit user task service error:", error);
    const message = error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};
