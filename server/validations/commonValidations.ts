import { IUser } from '@/interfaces/userInterfaces';
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
export const signUpValidation = (data: Partial<IUser>) => {
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
    role: Joi.number().valid(0, 1, 2).required().messages({
      'any.required': 'Role is required',
      'any.only': 'Role must be one of: 0, 1, 2',
    }),
    name: Joi.string().required().messages({
      'any.required': 'Name is required',
    }),
    phoneNumber: Joi.string().required().messages({
      'any.required': 'Phone number is required',
    }),
    countryCode: Joi.string().required().messages({
      'any.required': 'Country code is required',
    }),
  });

  return schema.validate(data, { abortEarly: false });
};
export const forgotPasswordValidation = (data: { email: string }) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const resetPasswordValidation = (data: { email: string; tokenFound: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
    tokenFound: Joi.string().required().messages({
      'string.base': 'Token must be a string',
      'any.required': 'Token is required',
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
