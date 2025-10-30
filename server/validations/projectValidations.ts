import { IProject } from "@/interfaces/projectInterfaces";
import Joi from "joi";

export const addProjectValidation = (data: Partial<IProject>) => {
    const schema = Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Name is required',
        }),
        description: Joi.string().required().messages({
            'any.required': 'Description is required',
        })
    });
    return schema.validate(data, { abortEarly: false });
};