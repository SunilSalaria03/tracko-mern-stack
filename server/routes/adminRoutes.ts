import { Router, Request, Response, NextFunction } from 'express';
import * as employeeController from '../controllers/employeeController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Protected routes
router.use(authMiddleware);

router.get('/employees', employeeController.getEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.put('/employees/:id', employeeController.updateEmployee);

export default router;
