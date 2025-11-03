import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import * as userController from '../controllers/userController';
import * as projectController from '../controllers/projectController';
import * as departmentController from '../controllers/departmentController';
import * as designationController from '../controllers/designationController';
import * as workstreamController from '../controllers/workstreamController';
import * as userTaskController from '../controllers/userTaskController';

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

// Department routes
router.post('/departments', departmentController.addDepartment);
router.put('/departments/:id', departmentController.updateDepartment);
router.get('/departments', departmentController.getDepartments);
router.get('/departments/:id', departmentController.getDepartmentById);
router.delete('/departments/:id', departmentController.deleteDepartment);

// Designation routes
router.post('/designations', designationController.addDesignation);
router.put('/designations/:id', designationController.updateDesignation);
router.get('/designations', designationController.getDesignations);
router.get('/designations/:id', designationController.getDesignationById);
router.delete('/designations/:id', designationController.deleteDesignation);

// Workstream routes
router.post('/workstreams', workstreamController.addWorkstream);
router.put('/workstreams/:id', workstreamController.updateWorkstream);
router.get('/workstreams', workstreamController.getWorkstreams);
router.get('/workstreams/:id', workstreamController.getWorkstreamById);
router.delete('/workstreams/:id', workstreamController.deleteWorkstream);

// User task routes
router.post('/userTasks', userTaskController.addUserTask);
router.put('/userTasks/:id', userTaskController.updateUserTask);
router.get('/userTasks', userTaskController.getUserTasks);
router.get('/userTasks/:id', userTaskController.getUserTaskById);
router.delete('/userTasks/:id', userTaskController.deleteUserTask);

export default router;
