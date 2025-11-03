import { IPermission } from "../interfaces/permissionInterfaces";
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

export const grantPermissionsToUserValidation = (data: Partial<IPermission>) => {
    const schema = Joi.object({
        userId: Joi.string().required().messages({
            'any.required': 'User ID is required',
        }),
        permissions: Joi.array().items(Joi.object({
            permissionId: Joi.string().required().messages({
                'any.required': 'Permission ID is required',
            }),
            allowAccess: Joi.boolean().required().messages({
                'any.required': 'Allow access to user is required',
            }),
        })).required().messages({
            'any.required': 'Permissions are required',
        }),
    });
    return schema.validate(data, { abortEarly: false });
};