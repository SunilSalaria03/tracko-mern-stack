import { IUser } from "../interfaces/userInterfaces";
import Joi from "joi";

export const addUserValidation = (data: Partial<IUser>) => {
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
      role: Joi.number().valid(0, 1, 2, 3).required().messages({
        'any.required': 'Role is required',
        'any.only': 'Role must be one of: 0, 1, 2, 3',
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
      dateOfBirth: Joi.string().optional().messages({
        'any.required': 'Date of birth is required',
      }),
      profileImage: Joi.string().optional().messages({
        'any.required': 'Profile image is required',
      }),
      designation: Joi.string().required().messages({
        'any.required': 'Designation is required',
      }),
      department: Joi.string().required().messages({
        'any.required': 'Department is required',
      }),
    });
  
    return schema.validate(data, { abortEarly: false });
  };