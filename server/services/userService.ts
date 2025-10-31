import bcrypt from 'bcryptjs';

import { IChangePassword, IListParams, IUser } from '../interfaces/userInterfaces';
import { imageUpload } from '../helpers/commonHelpers';
import userModel from '../models/userModel';
import { AUTH_MESSAGES, GENERAL_MESSAGES, USER_MESSAGES } from '../utils/constants/messages';
import tenantModel from '../models/tenantModel';
import jwt from 'jsonwebtoken';
import * as helper from '../helpers/commonHelpers';

export const getProfileService = async (userId: string) => {
  try {
    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return user;
  } catch (error) {
    console.error('Get profile service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    return { error: message };
  }
};

export const updateProfileService = async (userId: string, updateData: Record<string, any>, files?: any) => {
  try {
    const allowedUpdates = ['name', 'phoneNumber', 'countryCode'];
    const updates: any = {};

    // Only include allowed fields in the update
    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // Handle profile image upload
    if (files && files.profileImage) {
      const imagePath = imageUpload(files.profileImage, 'images');
      if (imagePath) {
        updates.profileImage = imagePath;
      }
    }

    // Validate name if being updated
    if (updates.name && updates.name.trim().length < 2) {
      return { error: 'Name must be at least 2 characters long' };
    }

    // Check if phone number is being updated and if it's already taken
    if (updates.phoneNumber) {
      const existingUser = await userModel.findOne({
        phoneNumber: updates.phoneNumber,
        _id: { $ne: userId },
        isDeleted: false
      });

      if (existingUser) {
        return { error: 'Phone number already in use' };
      }
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return { error: 'No valid fields to update' };
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return updatedUser;
  } catch (error) {
    console.error('Update profile service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return { error: message };
  }
};

export const uploadFileService = async (files: any) => {
  try {
    const fileUrl = imageUpload(files, 'images');

    if (!fileUrl) {
      return { error: USER_MESSAGES.FILE_UPLOAD_FAILED };
    }
    return fileUrl;
  } catch (error) {
    console.error("File upload error:", error);
    return { error: GENERAL_MESSAGES.SOMETHING_WENT_WRONG };
  }
};

export const changePasswordService = async (data: IChangePassword) => {
  try {
    const user = await userModel.findOne({ _id: data.userId, isDeleted: false });
    if (!user) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    const isOldPasswordCorrect = await bcrypt.compare(data.oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return { error: USER_MESSAGES.OLD_PASSWORD_INCORRECT };
    }
    
    if (data.newPassword === data.oldPassword) {
      return { error: USER_MESSAGES.NEW_PASSWORD_SAME };
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    const hashedNewPassword = await bcrypt.hash(data.newPassword, saltRounds);

    await userModel.updateOne({ _id: data.userId, isDeleted: false }, { password: hashedNewPassword, tempPassword: null });

    return { message: 'Password changed successfully' };
  } catch (error) {
    console.error('Change password service error:', error);
    return { error: GENERAL_MESSAGES.SOMETHING_WENT_WRONG };
  }
};

export const editUserService = async (userId: string, data: Partial<IUser>, files?: any) => {
  try {
    const existingUser = await userModel.findOne({ _id: userId, isDeleted: false });
    if (!existingUser) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    if(existingUser.email !== data.email) {
      const existingUserWithEmail = await userModel.findOne({ email: data.email, isDeleted: false });
      if (existingUserWithEmail) {
        return { error: USER_MESSAGES.USER_EMAIL_ALREADY_EXISTS };
      }
    }

    if(existingUser.phoneNumber !== data.phoneNumber) {
      const existingUserWithPhoneNumber = await userModel.findOne({ phoneNumber: data.phoneNumber, isDeleted: false });
      if (existingUserWithPhoneNumber) {
        return { error: USER_MESSAGES.USER_PHONE_NUMBER_ALREADY_EXISTS };
      }
    }
    
    if(files && files.profileImage) {
      const imagePath = imageUpload(files.profileImage, 'images');
      if (imagePath) {
        data.profileImage = imagePath;
      }
    }

    if(data.password) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      data.password = hashedPassword;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, data, { new: true });
    if (!updatedUser) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return updatedUser;
  } catch (err: any) {
    console.error('Edit user service error:', err);
    return { error: err.message || 'Something went wrong' };
  }
};

export const getUsersService = async (params: IListParams) => {
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
    const [users, total] = await Promise.all([
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
      users,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Get users service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return { error: message };
  }
};

export const getUserByIdService = async (userId: string) => {
  try {
    const user = await userModel
      .findOne({ _id: userId, isDeleted: false })
      .select('-password -deviceToken -deviceType -resetPasswordToken -emailOtpExpiry');

    if (!user) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return user;
  } catch (error) {
    console.error('Get user by ID service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return { error: message };
  }
};

export const deleteUserService = async (userId: string) => {
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    // Check if trying to delete an admin
    if (user.role === 0) {
      return { error: 'Cannot delete admin user' };
    }

    // Soft delete
    const deletedUser = await userModel.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedUser) {
      return { error: USER_MESSAGES.USER_NOT_FOUND };
    }

    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { error: message };
  }
};

export const addUserService = async (data: Partial<IUser>, files?: any) => {
  try {
    if((data.role == 1 || data.role == 0) && data.addedByUserRole != 0) {
        return { error: AUTH_MESSAGES.ADMIN_ACCESS_DENIED };
    }

    if(data.role == 0){
      const adminExist = await userModel.findOne({ role: 0, isDeleted: false });
      if (adminExist) {
        return { error: AUTH_MESSAGES.SUPER_ADMIN_ALREADY_EXISTS };
      }
    }
    
    if(data.email){
      const isEmailExist = await userModel.findOne({ 
        email: data.email, 
        isDeleted: false 
      });
      if (isEmailExist) {
        return { error: AUTH_MESSAGES.EMAIL_ALREADY_EXISTS };
      }
    }

    if (data.phoneNumber) {
      const isPhoneExist = await userModel.findOne({ 
        phoneNumber: data.phoneNumber, 
        isDeleted: false 
      });
      
      if (isPhoneExist) {
        return { error: 'Phone already exists' };
      }
    }

    let imagePath = '';
    if (files && files.profileImage) {
      imagePath = helper.imageUpload(files.profileImage, 'images');
    }

    // Hash password
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    const hashedPassword = await bcrypt.hash(data.password || '', saltRounds);

    const objToCreate = {
      ...data,
      password: hashedPassword,
      profileImage: imagePath,
      tempPassword: (data.role == 0) ? null : data.password,
    };

    const user = await userModel.create(objToCreate);
    if(data.role == 0 || data.role == 1) {
      const tenant = await tenantModel.create({
        adminUserId: user._id,
      });
      console.log('tenant111111', tenant);
      user.tenantId = tenant._id as any;
      await user.save({ validateBeforeSave: false });
    } else {
      console.log('data.addedByUserTenantId', data.addedByUserTenantId);
      user.tenantId = data.addedByUserTenantId;
      await user.save({ validateBeforeSave: false });
    }

    console.log('user', user);

    const token = jwt.sign(
      { 
        id: user._id, 
        email: data.email,
        role: user.role,
      },
      process.env.JWT_SECRET || '123@321',
      { expiresIn: '7d' }
    );

    // Prepare response
    const userInfo = {
      ...user.toObject(),
      password: hashedPassword,
      authToken: token,
    };

    return userInfo;
  } catch (err: any) {
    console.error('Add user service error:', err);
    return { error: err.message || 'Something went wrong' };
  }
};