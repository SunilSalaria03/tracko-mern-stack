import userModel from '../models/userModel';
import { USER_MESSAGES } from '../utils/constants/messages';

interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getEmployeesService = async (params: EmployeeListParams) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || '';
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    // Build search query
    const searchQuery: any = {
      isDeleted: false,
      role: { $ne: 0 }, // Exclude admins
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute queries
    const [employees, total] = await Promise.all([
      userModel
        .find(searchQuery)
        .select('-password -deviceToken -deviceType -resetPasswordToken -emailOtpExpiry')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      userModel.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      employees,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Get employees service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch employees';
    return { error: message };
  }
};

export const getEmployeeByIdService = async (employeeId: string) => {
  try {
    const employee = await userModel
      .findOne({ _id: employeeId, isDeleted: false })
      .select('-password -deviceToken -deviceType -resetPasswordToken -emailOtpExpiry');

    if (!employee) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return employee;
  } catch (error) {
    console.error('Get employee by ID service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch employee';
    return { error: message };
  }
};

export const updateEmployeeService = async (
  employeeId: string,
  updateData: Record<string, any>
) => {
  try {
    const allowedUpdates = ['name', 'phoneNumber', 'countryCode', 'role', 'status'];
    const updates: any = {};

    // Only include allowed fields in the update
    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // Validate name if being updated
    if (updates.name && updates.name.trim().length < 2) {
      return { error: 'Name must be at least 2 characters long' };
    }

    // Check if phone number is being updated and if it's already taken
    if (updates.phoneNumber) {
      const existingUser = await userModel.findOne({
        phoneNumber: updates.phoneNumber,
        _id: { $ne: employeeId },
        isDeleted: false,
      });

      if (existingUser) {
        return { error: 'Phone number already in use' };
      }
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return { error: 'No valid fields to update' };
    }

    const updatedEmployee = await userModel
      .findByIdAndUpdate(
        employeeId,
        { $set: updates },
        { new: true, runValidators: true }
      )
      .select('-password -deviceToken -deviceType -resetPasswordToken -emailOtpExpiry');

    if (!updatedEmployee) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return updatedEmployee;
  } catch (error) {
    console.error('Update employee service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update employee';
    return { error: message };
  }
};

export const deleteEmployeeService = async (employeeId: string) => {
  try {
    const employee = await userModel.findById(employeeId);

    if (!employee) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    // Check if trying to delete an admin
    if (employee.role === 0) {
      return { error: 'Cannot delete admin user' };
    }

    // Soft delete
    const deletedEmployee = await userModel.findByIdAndUpdate(
      employeeId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedEmployee) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return { message: 'Employee deleted successfully' };
  } catch (error) {
    console.error('Delete employee service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete employee';
    return { error: message };
  }
};

