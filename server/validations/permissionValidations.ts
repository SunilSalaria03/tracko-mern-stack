import { IPermission } from "@/interfaces/permissionInterfaces";
import Joi from "joi";

export const addPermissionValidation = (data: Partial<IPermission>) => {
    const schema = Joi.object({
        permissionName: Joi.string().required().messages({
            'any.required': 'Permission name is required',
        }),
        permissionDescription: Joi.string().required().messages({
            'any.required': 'Permission description is required',
        }),
    });
    return schema.validate(data, { abortEarly: false });
};