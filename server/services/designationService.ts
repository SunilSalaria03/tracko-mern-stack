import departmentModel from "../models/departmentModel";
import { IDesignation } from "../interfaces/designationInterfaces";
import { IListParams } from "../interfaces/userInterfaces";
import designationModel from "../models/designationModel";
import { GENERAL_MESSAGES, DESIGNATION_MESSAGES, DEPARTMENT_MESSAGES } from "../utils/constants/messages";
import mongoose from "mongoose";

export const getDesignationsService = async (params: IListParams) => {
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

    const [designations, total] = await Promise.all([
      designationModel
        .find(searchQuery)
        .populate("addedBy", "name email")
        .populate("departmentId", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      designationModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      designations,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Get designations service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch designations";
    return { error: message };
  }
};

export const getDesignationByIdService = async (designationId: string) => {
  try {
    const designation = await designationModel
      .findOne({ _id: designationId, isDeleted: false })
      .populate("addedBy", "name email")
      .populate("departmentId", "name");

    if (!designation) {
      return { error: DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND };
    }

    return designation;
  } catch (error) {
    console.error("Get designation by ID service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch designation";
    return { error: message };
  }
};

export const addDesignationService = async (data: Partial<IDesignation>) => {
  try {
    if (data?.departmentId) {
      const depId =
        typeof data.departmentId === "string"
          ? data.departmentId
          : data.departmentId?.toString();
      if (!depId || !mongoose.Types.ObjectId.isValid(depId)) {
        return { error: DEPARTMENT_MESSAGES.INVALID_DEPARTMENT_ID };
      }

      const department = await departmentModel.findOne({
        _id: data?.departmentId,
        isDeleted: false,
      });
      if (!department) {
        return { error: DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND };
      }
    }

    const existingDesignation = await designationModel.findOne({
      name: data.name,
      isDeleted: false,
    });
    if (existingDesignation) {
      return { error: "Designation with this name already exists" };
    }

    const createdDesignation = await designationModel.create(data);

    return createdDesignation;
  } catch (error) {
    console.error("Create designation service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create designation";
    return { error: message };
  }
};

export const updateDesignationService = async (data: Partial<IDesignation>) => {
  try {
    if (data?.departmentId) {
      const depId =
        typeof data.departmentId === "string"
          ? data.departmentId
          : data.departmentId?.toString();
      if (!depId || !mongoose.Types.ObjectId.isValid(depId)) {
        return { error: DEPARTMENT_MESSAGES.INVALID_DEPARTMENT_ID };
      }

      const department = await departmentModel.findOne({
        _id: data?.departmentId,
        isDeleted: false,
      });
      if (!department) {
        return { error: DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND };
      }
    }
    const designation = await designationModel.findOne({
      _id: data?.id,
      isDeleted: false,
    });
    if (!designation) {
      return { error: DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND };
    }

    if (data?.name && data?.name !== designation.name) {
      const existingDesignation = await designationModel.findOne({
        name: data?.name,
        isDeleted: false,
        _id: { $ne: data?.id },
      });

      if (existingDesignation) {
        return { error: "Designation with this name already exists" };
      }
    }

    const updatedDesignation = await designationModel
      .findOneAndUpdate({ _id: data?.id, isDeleted: false }, data, {
        new: true,
        runValidators: true,
      })

    if (!updatedDesignation) {
      return { error: DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND };
    }

    return updatedDesignation;
  } catch (error) {
    console.error("Update designation service error:", error);
    const message =
      error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const deleteDesignationService = async (designationId: string) => {
  try {
    const designation = await designationModel.findOne({
      _id: designationId,
      isDeleted: false,
    });

    if (!designation) {
      return { error: DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND };
    }

    const deletedDesignation = await designationModel.findByIdAndUpdate(
      designationId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedDesignation) {
      return { error: DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND };
    }

    return deletedDesignation;
  } catch (error) {
    console.error("Delete designation service error:", error);
    const message = error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};
