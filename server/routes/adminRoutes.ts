import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import * as userController from '../controllers/userController';
import * as projectController from '../controllers/projectController';

const router = Router();

// Protected routes
router.use(authMiddleware);

// User routes
router.post('/users/add', userController.addUser);
router.put('/users/:userId', userController.updateUser);
router.get('/users', userController.getUsers);
router.get('/user/:id', userController.getUserById);

// Project routes
router.post('/projects', projectController.addProject);
router.put('/projects/:id', projectController.updateProject);
router.get('/projects', projectController.getProjects);
router.get('/projects/:id', projectController.getProjectById);
router.delete('/projects/:id', projectController.deleteProject);

export default router;
