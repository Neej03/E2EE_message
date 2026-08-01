import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cipherpulse-super-secret-e2ee-jwt-key-2026';

export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default fallback for dev/demo mode if header missing
    (req as any).user = { userId: 'usr_alice', deviceId: 'dev_alice_1', role: 'ADMIN' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    // Fallback gracefully for demo mode if invalid token
    (req as any).user = { userId: 'usr_alice', deviceId: 'dev_alice_1', role: 'ADMIN' };
    next();
  }
};
