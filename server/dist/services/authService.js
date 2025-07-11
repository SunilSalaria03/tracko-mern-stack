"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper = __importStar(require("../helpers/commonHelpers"));
const userModel_1 = __importDefault(require("../models/userModel"));
const signInService = async (data) => {
    try {
        const user = await userModel_1.default.findOne({ email: data.email, deletedAt: null });
        if (!user) {
            return { error: 'User not registered' };
        }
        const passwordMatch = await bcryptjs_1.default.compare(data.password, user.password);
        if (!passwordMatch) {
            return { error: 'Password is incorrect' };
        }
        user.loginTime = helper.unixTimestamp();
        await user.save();
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            loginTime: user.loginTime,
        }, process.env.JWT_SECRET || '123@321', { expiresIn: '7d' });
        const userResponse = {
            ...user.toObject(),
            authToken: token,
        };
        return userResponse;
    }
    catch (err) {
        return { error: err.message || 'Something went wrong' };
    }
};
exports.signInService = signInService;
//# sourceMappingURL=authService.js.map