import { IDepartment } from "../interfaces/departmentInterfaces";
import { IListParams } from "../interfaces/userInterfaces";
import departmentModel from "../models/departmentModel";
import { GENERAL_MESSAGES, DEPARTMENT_MESSAGES } from "../utils/constants/messages";

export const getDepartmentsService = async (params: IListParams) => {
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

    const [departments, total] = await Promise.all([
      departmentModel
        .find(searchQuery)
        .populate("addedBy", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      departmentModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      departments,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Get departments service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch departments";
    return { error: message };
  }
};

export const getDepartmentByIdService = async (departmentId: string) => {
  try {
    const department = await departmentModel
      .findOne({ _id: departmentId, isDeleted: false })
      .populate("addedBy", "name email");

    if (!department) {
      return { error: DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND };
    }

    return department;
  } catch (error) {
    console.error("Get department by ID service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch department";
    return { error: message };
  }
};

export const addDepartmentService = async (data: Partial<IDepartment>) => {
  try {
    const existingDepartment = await departmentModel.findOne({
      name: data.name,
      isDeleted: false,
    });
    if (existingDepartment) {
      return { error: "Department with this name already exists" };
    }

    const createdDepartment = await departmentModel.create(data);

    return createdDepartment;
  } catch (error) {
    console.error("Create department service error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create department";
    return { error: message };
  }
};

export const updateDepartmentService = async (data: Partial<IDepartment>) => {
  try {
    const department = await departmentModel.findOne({
      _id: data?.id,
      isDeleted: false,
    });
    if (!department) {
      return { error: DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND };
    }

    if (data?.name && data?.name !== department.name) {
      const existingDepartment = await departmentModel.findOne({
        name: data?.name,
        isDeleted: false,
        _id: { $ne: data?.id },
      });

      if (existingDepartment) {
        return { error: "Department with this name already exists" };
      }
    }

    const updatedDepartment = await departmentModel
      .findOneAndUpdate({ _id: data?.id, isDeleted: false }, data, {
        new: true,
        runValidators: true,
      })

    if (!updatedDepartment) {
      return { error: DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND };
    }

    return updatedDepartment;
  } catch (error) {
    console.error("Update department service error:", error);
    const message =
      error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

export const deleteDepartmentService = async (departmentId: string) => {
  try {
    const department = await departmentModel.findOne({
      _id: departmentId,
      isDeleted: false,
    });

    if (!department) {
      return { error: DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND };
    }

    const deletedDepartment = await departmentModel.findByIdAndUpdate(
      departmentId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedDepartment) {
      return { error: DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND };
    }

    return deletedDepartment;
  } catch (error) {
    console.error("Delete department service error:", error);
    const message = error instanceof Error ? error.message : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};
