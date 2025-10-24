import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces/userInterfaces';
import userModel from '../models/userModel';

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Access denied. No token provided.',
        body: {}
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123@321');
  
    let user: IUser | null = null;
    if(decoded && typeof decoded === 'object' && 'id' in decoded) {
      user = await userModel.findOne({
        _id: decoded?.id,
        isDeleted: false,
      });
      if(!user) {
        res.status(401).json({
          success: false,
          code: 401,
          message: 'Invalid token.',
          body: {}
        });
        return;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Invalid token.',
      body: {}
    });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        error: 'Access denied. Admin privileges required.'
      });
      return;
    }
    next();
  } catch (error) {
    res.status(403).json({
      error: 'Access denied.'
    });
  }
};