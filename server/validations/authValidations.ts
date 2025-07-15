import Joi from 'joi';

export const signInValidation = (data: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .required()
      .messages({
        'string.base': 'Password must be a string',
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const signUpValidation = (data: {
  email: string;
  password: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code?: string;
}) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .required()
      .messages({
        'string.base': 'Password must be a string',
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    role: Joi.string().valid('0', '1', '2').required().messages({
      'string.base': 'Role must be a string',
      'any.only': 'Role must be one of: 0, 1, 2',
      'any.required': 'Role is required',
    }),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    phone_number: Joi.string().optional(),
    country_code: Joi.string().optional()
  });

  return schema.validate(data, { abortEarly: false });
};
