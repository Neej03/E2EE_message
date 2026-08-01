import { Request, Response, NextFunction } from 'express';

// Authentication disabled: Automatically attaches active user session to all requests
export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = { userId: 'usr_alice', deviceId: 'dev_alice_1', role: 'ADMIN' };
  next();
};
