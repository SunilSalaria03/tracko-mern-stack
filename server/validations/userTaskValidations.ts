import { IUserTask } from "../interfaces/userTaskInterface";
import Joi from "joi";

export const addUserTaskValidation = (data: Partial<IUserTask>) => {
    const schema = Joi.object({
      projectId: Joi.string().required().messages({
        'any.required': 'Project ID is required',
      }),
      workstreamId: Joi.string().required().messages({
        'any.required': 'Workstream ID is required',
      }),
      taskDescription: Joi.string().required().messages({
        'any.required': 'Task description is required',
      }),
      date: Joi.date().required().messages({
        'any.required': 'Date is required',
      }),
      spendHours: Joi.string().required().messages({
        'any.required': 'Spend hours is required',
      }),
    });
  
    return schema.validate(data, { abortEarly: false });
  };

  export const finalSubmitUserTaskValidation = (data: Partial<IUserTask>) => {
    const schema = Joi.object({
      startDate: Joi.date().required().messages({
        'any.required': 'Start date is required',
      }),
      endDate: Joi.date().required().messages({
        'any.required': 'End date is required',
      }),
    });
    return schema.validate(data, { abortEarly: false });
  };