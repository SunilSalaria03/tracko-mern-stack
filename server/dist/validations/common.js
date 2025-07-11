"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const signInValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.base': 'Email must be a string',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),
        password: joi_1.default.string()
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
exports.signInValidation = signInValidation;
//# sourceMappingURL=common.js.map