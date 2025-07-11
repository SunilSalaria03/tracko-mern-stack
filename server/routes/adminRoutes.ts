import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// admin routes
router.get('/login', authController.signIn);

// Protected routes
router.use(authMiddleware);
// Enter protected routes here only :-

export default router;
