import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'habesha_hotel_jwt_super_secret_key_2026_shms';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'receptionist' | 'housekeeper' | 'accountant' | 'customer' | 'maintenance';
  full_name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.shms_token) {
    // 2. Check HTTP-only cookie
    token = req.cookies.shms_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please sign in again.' });
  }
}

export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.shms_token) {
    token = req.cookies.shms_token;
  }

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    } catch (e) {
      // Ignore invalid token for optional auth
    }
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: [${allowedRoles.join(', ')}], but current role is '${req.user.role}'`
      });
    }

    next();
  };
}
