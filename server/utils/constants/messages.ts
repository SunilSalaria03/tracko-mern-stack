export const AUTH_MESSAGES = {
  ADMIN_ACCESS_DENIED: 'Admin access denied, you cannot add admin',
  LOGIN_SUCCESS: 'Sign-in successful',
  SIGNUP_SUCCESS: 'Signup successful and your free trial has been started',
  LOGOUT_SUCCESS: 'User Logged Out Successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PASSWORD_RESET_MAIL_SENT: 'Password reset link sent to your email',
  FORGOT_PASSWORD_SUCCESS: 'Password reset link sent successfully',
  TOKEN_VERIFIED: 'Token verified successfully',
  USER_NOT_REGISTERED: 'User not registered',
  INCORRECT_PASSWORD: 'Password is incorrect',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired or invalid',
  ACCESS_DENIED_NO_TOKEN: 'Access denied. No token provided.',
  SUPER_ADMIN_ALREADY_EXISTS: 'Super admin already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PHONE_ALREADY_EXISTS: 'Phone already exists',
  FORGOT_PASSWORD_FAILED: 'Failed to send password reset link',
  RESET_PASSWORD_FAILED: 'Failed to reset password',
};

export const USER_MESSAGES = {
  INVALID_USER_ID: 'Invalid user ID',
  RESTRICTED_FIELDS_CANNOT_BE_UPDATED: 'Email, role, password and tenantId are restricted fields and cannot be updated',
  TENANT_ID_RESTRICTED_FIELDS_CANNOT_BE_UPDATED: 'Tenant ID restricted field cannot be updated',
  USER_EMAIL_ALREADY_EXISTS: 'User email already exists',
  USER_PHONE_NUMBER_ALREADY_EXISTS: 'User phone number already exists',
  USER_ID_REQUIRED: 'User ID is required',
  USER_UPDATED_FAILED: 'Failed to update user',
  USER_UPDATED_SUCCESSFULLY: 'User updated successfully',
  USER_ADDED_SUCCESSFULLY: 'User added successfully',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',
  NEW_PASSWORD_SAME: 'New password cannot be the same as the old password',
  PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed successfully',
  PASSWORD_CHANGED_FAILED: 'Failed to change password',
  ACCOUNT_DELETED: 'Account deleted successfully',
  PROFILE_UPDATED_SUCCESSFULLY: 'Profile updated successfully',
  PROFILE_UPDATED_FAILED: 'Failed to update profile',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  RESTRICTED_FIELDS: 'Restricted fields cannot be updated',
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
  FILE_UPLOAD_FAILED: 'Failed to upload file',
  FILE_NOT_FOUND: 'File not found',
  USER_NOT_FOUND: 'User not found',
  FAILED_TO_DELETE: 'Failed to delete user',
  FAILED_TO_UPDATE: 'Failed to update login time',
};

export const GENERAL_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
};

export const ADMIN_MESSAGES = {
  ADMIN_ACTION_SUCCESS: 'Admin action completed successfully',
  ACCESS_DENIED: 'Access denied. Admin privileges required.',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions',
};

export const PROJECT_MESSAGES = {
  PROJECT_NOT_FOUND: 'Project not found',
  PROJECT_NAME_ALREADY_EXISTS: 'Project name already exists',
  PROJECTS_FETCHED_SUCCESSFULLY: 'Projects fetched successfully',
  PROJECT_CREATION_NOT_ALLOWED: 'Admin and Manager only can add project',
  PROJECT_UPDATE_NOT_ALLOWED: 'Admin and Manager only can update project',
};

export const DEPARTMENT_MESSAGES = {
  DEPARTMENT_NOT_FOUND: 'Department not found',
  DEPARTMENT_NAME_ALREADY_EXISTS: 'Department name already exists',
  DEPARTMENTS_FETCHED_SUCCESSFULLY: 'Departments fetched successfully',
  DEPARTMENT_CREATION_NOT_ALLOWED: 'Admin and Manager only can add department',
  DEPARTMENT_UPDATE_NOT_ALLOWED: 'Admin and Manager only can update department',
  INVALID_DEPARTMENT_ID: 'Invalid department ID',
};

export const DESIGNATION_MESSAGES = {
  INVALID_DESIGNATION_ID: 'Invalid designation ID',
  DESIGNATION_NOT_FOUND: 'Designation not found',
  DESIGNATION_NAME_ALREADY_EXISTS: 'Designation name already exists',
  DESIGNATION_CREATION_NOT_ALLOWED: 'Admin and Manager only can add designation',
  DESIGNATION_UPDATE_NOT_ALLOWED: 'Admin and Manager only can update designation',
  DESIGNATIONS_FETCHED_SUCCESSFULLY: 'Designations fetched successfully',
};

export const WORKSTREAM_MESSAGES = {
  WORKSTREAM_NOT_FOUND: 'Workstream not found',
  WORKSTREAM_NAME_ALREADY_EXISTS: 'Workstream name already exists',
  WORKSTREAMS_FETCHED_SUCCESSFULLY: 'Workstreams fetched successfully',
  WORKSTREAM_CREATION_NOT_ALLOWED: 'Admin and Manager only can add workstream',
  WORKSTREAM_UPDATE_NOT_ALLOWED: 'Admin and Manager only can update workstream',
};

export const USER_TASK_MESSAGES = {
  USER_TASK_ID_REQUIRED: 'User task ID is required',
  USER_TASK_NOT_FOUND: 'User task not found',
  USER_TASK_DESCRIPTION_ALREADY_EXISTS: 'User task description already exists',
  USER_TASKS_FETCHED_SUCCESSFULLY: 'User tasks fetched successfully',
  USER_TASK_CREATION_NOT_ALLOWED: 'Admin and Manager only can add user task',
  USER_TASK_UPDATE_NOT_ALLOWED: 'Admin and Manager only can update user task',
  INVALID_USER_TASK_ID: 'Invalid user task ID',
  CANNOT_UPDATE_AFTER_FINAL_SUBMIT_TASK: 'Cannot update after final submission of the task',
  CANNOT_DELETE_AFTER_FINAL_SUBMIT_TASK: 'Cannot delete after final submission of the task',
};

export const PERMISSION_MESSAGES = {
  PERMISSIONS_NOT_FOUND: 'Permissions not found',
  PERMISSIONS_REQUIRED: 'Permissions are required',
  PERMISSION_NAME_ALREADY_EXISTS: 'Permission name already exists',
  PERMISSIONS_FETCHED_SUCCESSFULLY: 'Permissions fetched successfully',
  PERMISSION_CREATION_NOT_ALLOWED: 'Admin and Manager only can add permission',
  PERMISSION_UPDATE_NOT_ALLOWED: 'Admin and Manager only can update permission',
  INVALID_PERMISSION_ID: 'Invalid permission ID',
  PERMISSION_GRANTED_TO_USER_SUCCESSFULLY: 'Permission granted to user successfully',
};

export const MESSAGES = {
  AUTH: AUTH_MESSAGES,
  USER: USER_MESSAGES,
  GENERAL: GENERAL_MESSAGES,
  VALIDATION: VALIDATION_MESSAGES,
  ADMIN: ADMIN_MESSAGES,
  PROJECT: PROJECT_MESSAGES,
  DEPARTMENT: DEPARTMENT_MESSAGES,
  DESIGNATION: DESIGNATION_MESSAGES,
  WORKSTREAM: WORKSTREAM_MESSAGES,
  USER_TASK: USER_TASK_MESSAGES,
  PERMISSION: PERMISSION_MESSAGES,
};

export default MESSAGES;

