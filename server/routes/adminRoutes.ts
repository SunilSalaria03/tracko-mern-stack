import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// router.get('/login', authController.signIn);

// Protected routes
router.use(authMiddleware);

export default router;
