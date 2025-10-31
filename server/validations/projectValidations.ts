import { IProject } from "@/interfaces/projectInterfaces";
import Joi from "joi";

export const addProjectValidation = (data: Partial<IProject>) => {
    const schema = Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Name is required',
        }),
        description: Joi.string().required().messages({
            'any.required': 'Description is required',
        }),
        startDate: Joi.date().required().messages({
            'any.required': 'Start date is required',
        }),
        endDate: Joi.date().required().messages({
            'any.required': 'End date is required',
        }),
        status: Joi.number().valid(0, 1).required().messages({
            'any.required': 'Status is required',
            'any.only': 'Status must be one of: 0, 1',
        }),
    });
    return schema.validate(data, { abortEarly: false });
};