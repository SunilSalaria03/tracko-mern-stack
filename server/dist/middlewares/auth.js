"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                error: 'Access denied. No token provided.'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Invalid token.'
        });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({
                error: 'Access denied. Admin privileges required.'
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(403).json({
            error: 'Access denied.'
        });
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=auth.js.map