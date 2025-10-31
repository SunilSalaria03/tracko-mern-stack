import { IDesignation } from "../interfaces/designationInterfaces";
import Joi from "joi";

export const addDesignationValidation = (data: Partial<IDesignation>) => {
    const schema = Joi.object({
        departmentId: Joi.string().required().messages({
            'any.required': 'Department ID is required',
        }),
        name: Joi.string().required().messages({
            'any.required': 'Name is required',
        }),
        description: Joi.string().required().messages({
            'any.required': 'Description is required',
        }),
        status: Joi.number().valid(0, 1).optional().messages({
            'any.only': 'Status must be one of: 0, 1',
        }),
    });
    return schema.validate(data, { abortEarly: false });
};