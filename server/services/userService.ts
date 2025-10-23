import { imageUpload } from '../helpers/commonHelpers';
import userModel from '../models/userModel';
import { GENERAL_MESSAGES, USER_MESSAGES } from '../utils/constants/messages';

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
