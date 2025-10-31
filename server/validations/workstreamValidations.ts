import { IWorkstream } from "../interfaces/workstreamInterfaces";
import Joi from "joi";

export const addWorksteamValidation = (data: Partial<IWorkstream>) => {
    const schema = Joi.object({
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