import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Please authenticate.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };
    const user = await User.findOne({ _id: decoded._id })
      .select('_id email firstName lastName role')
      .lean();

    if (!user) {
      res.status(401).json({ error: 'Please authenticate.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const checkRole = (roles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Please authenticate.' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Access denied.' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  };
}; 