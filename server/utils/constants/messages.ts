// Authentication Messages
export const AUTH_MESSAGES = {
  // Success
  LOGIN_SUCCESS: 'Sign-in successful',
  SIGNUP_SUCCESS: 'Signup successful and your free trial has been started',
  LOGOUT_SUCCESS: 'User Logged Out Successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PASSWORD_RESET_MAIL_SENT: 'Password reset link sent to your email',
  FORGOT_PASSWORD_SUCCESS: 'Password reset link sent successfully',
  TOKEN_VERIFIED: 'Token verified successfully',
  
  // Errors
  USER_NOT_REGISTERED: 'User not registered',
  INCORRECT_PASSWORD: 'Password is incorrect',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired or invalid',
  ACCESS_DENIED_NO_TOKEN: 'Access denied. No token provided.',
  ADMIN_ALREADY_EXISTS: 'Admin already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PHONE_ALREADY_EXISTS: 'Phone already exists',
  FORGOT_PASSWORD_FAILED: 'Failed to send password reset link',
  RESET_PASSWORD_FAILED: 'Failed to reset password',
};

// User Messages
export const USER_MESSAGES = {
  // Success
  ACCOUNT_DELETED: 'Account deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  
  // Errors
  USER_NOT_FOUND: 'User not found',
  FAILED_TO_DELETE: 'Failed to delete user',
  FAILED_TO_UPDATE: 'Failed to update login time',
};

// General Messages
export const GENERAL_MESSAGES = {
  // Success
  SUCCESS: 'Operation completed successfully',
  
  // Errors
  SOMETHING_WENT_WRONG: 'Something went wrong',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
};

// Admin Messages
export const ADMIN_MESSAGES = {
  // Success
  ADMIN_ACTION_SUCCESS: 'Admin action completed successfully',
  
  // Errors
  ACCESS_DENIED: 'Access denied. Admin privileges required.',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions',
};

// Export all messages as a single object for convenience
export const MESSAGES = {
  AUTH: AUTH_MESSAGES,
  USER: USER_MESSAGES,
  GENERAL: GENERAL_MESSAGES,
  VALIDATION: VALIDATION_MESSAGES,
  ADMIN: ADMIN_MESSAGES,
};

export default MESSAGES;

