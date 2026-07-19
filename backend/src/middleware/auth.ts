import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gym_erp_token';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'super_admin' | 'manager' | 'coach' | 'client';
    entityId?: string;
  };
}

/**
 * Validates JWT access token in header
 */
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({
          status: 403,
          message: 'Access Forbidden. Invalid or expired token.',
          errors: { auth: ['Token validation failed'] }
        });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        entityId: decoded.entityId
      };
      
      next();
    });
  } else {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized access. Authentication token required.',
    });
  }
};

/**
 * Role clearance guard middleware
 */
export const requireRoles = (allowedRoles: ('super_admin' | 'manager' | 'coach' | 'client')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        message: `Clearance Forbidden. Requiring role clearance of: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
