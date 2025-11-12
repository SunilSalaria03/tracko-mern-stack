type ValidationRule = {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage: {
    requiredMsg?: string;
    patternMsg?: string;
    minLengthMsg?: string;
    maxLengthMsg?: string;
  };
};

export type ValidationSchema = Record<string, ValidationRule>;

export const validateField = (
  name: string,
  value: string,
  schema: ValidationSchema
): string | null => {
  const rules = schema[name];
  if (!rules) return null;

  const { required, pattern, minLength, maxLength, errorMessage } = rules;

  if (required && !value) {
    return errorMessage.requiredMsg || 'This field is required';
  }

  if (pattern && !pattern.test(value)) {
    return errorMessage.patternMsg || 'Invalid format';
  }
  if (minLength && value.length < minLength) {
    return errorMessage.minLengthMsg || `Must be at least ${minLength} characters`;
  }
  if (maxLength && value.length > maxLength) {
    return errorMessage.maxLengthMsg || `Must not exceed ${maxLength} characters`;
  }

  return null;
};

export const loginValidation = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: { 
      requiredMsg: 'Email is required',
      patternMsg: 'Invalid email format',
    },
  },
  password: {
    required: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{4,10}$/,
    minLength: 4,
    maxLength: 10,
    errorMessage: {
      requiredMsg: 'Password is required',
      patternMsg:
      'Password must contain uppercase, lowercase, number, special character, and no spaces',
      minLengthMsg: 'Password must be at least 4 characters long',
      maxLengthMsg: 'Password must not exceed 10 characters',
    },
  },
};

export const forgotPasswordValidation = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: {
      requiredMsg: 'Email is required',
      patternMsg: 'Invalid email format',
    },
  },
};

export const resetPasswordValidation = {
  password: {
    required: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{4,10}$/,
    minLength: 4,
    maxLength: 10,
    errorMessage: {
      requiredMsg: 'New Password is required',
      patternMsg:
        'New Password must contain uppercase, lowercase, number, special character, and no spaces',
      minLengthMsg: 'New Password must be at least 4 characters long',
      maxLengthMsg: 'New Password must not exceed 10 characters',
    },
  },
  confirmPassword: {
    required: true,
    errorMessage: {
      requiredMsg: 'Confirm New Password is required',
    },
  },
};