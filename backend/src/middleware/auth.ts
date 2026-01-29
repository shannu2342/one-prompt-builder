import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage, User } from '../storage/inMemoryStorage';

export interface AuthRequest extends Request {
  user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Not authorized, no token provided' });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { id: string };

      // Get user from in-memory storage
      const user = storage.findUserById(decoded.id);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error in authentication' });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `User role '${req.user.role}' is not authorized to access this route` });
      return;
    }

    next();
  };
};
