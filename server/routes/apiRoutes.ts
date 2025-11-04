import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';
import * as userTaskController from '../controllers/userTaskController';
import * as projectController from '../controllers/projectController';

const router = Router();

// Public routes (no authentication required)
router.post('/auth/login', authController.signIn);
// router.post('/auth/signup', authController.signUp);
router.post('/auth/forgotPassword', authController.forgotPassword);
router.post('/auth/resetPassword', authController.resetPassword);

// file upload routes
router.post('/files/upload', userController.uploadFile);

// Apply authentication middleware to all routes below
router.use(authMiddleware);

// Protected routes (authentication required)
router.post('/auth/logout', authController.logout);
router.delete('/delete-account', authController.deleteAccount);

// User profile routes
router.get('/users/profile', userController.getProfile);
router.put('/users/profile', userController.updateProfile);
router.put('/users/changePassword', userController.changePassword);

// User task routes
router.post('/userTasks', userTaskController.addUserTask);
router.get('/userTasks', userTaskController.getUserTasks);
router.get('/userTasks/:id', userTaskController.getUserTaskById);
router.delete('/userTasks/:id', userTaskController.deleteUserTask);
router.put('/userTasks/finalSubmit', userTaskController.finalSubmitUserTask);
router.put('/userTasks/:id', userTaskController.updateUserTask);

// Project assignment routes
router.post('/projectAssignments', projectController.projectAssignment);

export default router;
