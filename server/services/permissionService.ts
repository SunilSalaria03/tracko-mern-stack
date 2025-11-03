import { IWorkstream } from "../interfaces/workstreamInterfaces";
import { IListParams } from "../interfaces/userInterfaces";
import permissionModel from "../models/permissionsModel";
import {
  GENERAL_MESSAGES,
  PERMISSION_MESSAGES,
  WORKSTREAM_MESSAGES,
} from "../utils/constants/messages";
import { IPermission } from "@/interfaces/permissionInterfaces";

export const getPermissionsService = async (params: IListParams) => {
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

    const [permissions, total] = await Promise.all([
      permissionModel
        .find(searchQuery)
        .populate("addedBy", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      permissionModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      permissions,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Get permissions service error:", error);
    const message =
      error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const getPermissionByIdService = async (permissionId: string) => {
  try {
    const permission = await permissionModel
      .findOne({ _id: permissionId, isDeleted: false })
      .populate("addedBy", "name email");

    if (!permission) {
      return { error: PERMISSION_MESSAGES.PERMISSION_NOT_FOUND };
    }

    return permission;
  } catch (error) {
    console.error("Get permission by ID service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch permission";
    return { error: message };
  }
};

export const addPermissionService = async (data: Partial<IPermission>) => {
  try {
    const existingPermission = await permissionModel.findOne({
      permissionName: data.permissionName,
      isDeleted: false,
    });
    if (existingPermission) {
      return { error: PERMISSION_MESSAGES.PERMISSION_NAME_ALREADY_EXISTS };
    }

    const createdPermission = await permissionModel.create(data);

    return createdPermission;
  } catch (error) {
    console.error("Create permission service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create permission";
    return { error: message };
  }
};

export const updatePermissionService = async (data: Partial<IPermission>) => {
  try {
    const permission = await permissionModel.findOne({
      _id: data?.id,
      isDeleted: false,
    });
    if (!permission) {
      return { error: PERMISSION_MESSAGES.INVALID_PERMISSION_ID };
    }

    if (
      data?.permissionName &&
      data?.permissionName !== permission.permissionName
    ) {
      const existingPermission = await permissionModel.findOne({
        permissionName: data?.permissionName,
        isDeleted: false,
        _id: { $ne: data?.id },
      });

      if (existingPermission) {
        return { error: PERMISSION_MESSAGES.PERMISSION_NAME_ALREADY_EXISTS };
      }
    }

    const updatedPermission = await permissionModel.findOneAndUpdate(
      { _id: data?.id, isDeleted: false },
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPermission) {
      return { error: PERMISSION_MESSAGES.INVALID_PERMISSION_ID };
    }

    return updatedPermission;
  } catch (error) {
    console.error("Update permission service error:", error);
    const message =
      error instanceof Error
        ? error.message
        : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const deletePermissionService = async (permissionId: string) => {
  try {
    const permission = await permissionModel.findOne({
      _id: permissionId,
      isDeleted: false,
    });

    if (!permission) {
      return { error: PERMISSION_MESSAGES.INVALID_PERMISSION_ID };
    }

    const deletedPermission = await permissionModel.findByIdAndUpdate(
      permissionId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedPermission) {
      return { error: PERMISSION_MESSAGES.INVALID_PERMISSION_ID };
    }

    return deletedPermission;
  } catch (error) {
    console.error("Delete permission service error:", error);
    const message =
      error instanceof Error
        ? error.message
        : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};
