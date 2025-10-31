import { IWorkstream } from "../interfaces/workstreamInterfaces";
import { IListParams } from "../interfaces/userInterfaces";
import workstreamModel from "../models/workstreamModel";
import { GENERAL_MESSAGES, WORKSTREAM_MESSAGES } from "../utils/constants/messages";

export const getWorkstreamsService = async (params: IListParams) => {
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

    const [workstreams, total] = await Promise.all([
      workstreamModel
        .find(searchQuery)
        .populate("addedBy", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      workstreamModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      workstreams,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Get workstreams service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch workstreams";
    return { error: message };
  }
};

export const getWorkstreamByIdService = async (workstreamId: string) => {
  try {
    const workstream = await workstreamModel
      .findOne({ _id: workstreamId, isDeleted: false })
      .populate("addedBy", "name email");

    if (!workstream) {
      return { error: WORKSTREAM_MESSAGES.WORKSTREAM_NOT_FOUND };
    }

    return workstream;
  } catch (error) {
    console.error("Get workstream by ID service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch workstream";
    return { error: message };
  }
};

export const addWorkstreamService = async (data: Partial<IWorkstream>) => {
  try {
    const existingWorkstream = await workstreamModel.findOne({
      name: data.name,
      isDeleted: false,
    });
    if (existingWorkstream) {
      return { error: "Workstream with this name already exists" };
    }

    const createdWorkstream = await workstreamModel.create(data);

    return createdWorkstream;
  } catch (error) {
    console.error("Create workstream service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create workstream";
    return { error: message };
  }
};

export const updateWorkstreamService = async (data: Partial<IWorkstream>) => {
  try {
    const workstream = await workstreamModel.findOne({
      _id: data?.id,
      isDeleted: false,
    });
    if (!workstream) {
      return { error: WORKSTREAM_MESSAGES.WORKSTREAM_NOT_FOUND };
    }

    if (data?.name && data?.name !== workstream.name) {
      const existingWorkstream = await workstreamModel.findOne({
        name: data?.name,
        isDeleted: false,
        _id: { $ne: data?.id },
      });

      if (existingWorkstream) {
        return { error: "Workstream with this name already exists" };
      }
    }

    const updatedWorkstream = await workstreamModel
      .findOneAndUpdate({ _id: data?.id, isDeleted: false }, data, {
        new: true,
        runValidators: true,
      })

    if (!updatedWorkstream) {
      return { error: WORKSTREAM_MESSAGES.WORKSTREAM_NOT_FOUND };
    }

    return updatedWorkstream;
  } catch (error) {
    console.error("Update workstream service error:", error);
    const message =
      error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const deleteWorkstreamService = async (workstreamId: string) => {
  try {
    const workstream = await workstreamModel.findOne({
      _id: workstreamId,
      isDeleted: false,
    });

    if (!workstream) {
      return { error: WORKSTREAM_MESSAGES.WORKSTREAM_NOT_FOUND };
    }

    const deletedWorkstream = await workstreamModel.findByIdAndUpdate(
      workstreamId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedWorkstream) {
      return { error: WORKSTREAM_MESSAGES.WORKSTREAM_NOT_FOUND };
    }

    return deletedWorkstream;
  } catch (error) {
    console.error("Delete workstream service error:", error);
    const message = error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};
