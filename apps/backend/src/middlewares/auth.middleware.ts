import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.utils';
import { AuthRequest } from '../types/auth.types';
import { prisma } from '../db/prisma';


export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { status: true, tokenVersion: true } });
    if (!user || user.status !== "approved" || !Number.isInteger(payload.tokenVersion) || user.tokenVersion !== payload.tokenVersion) {
      res.status(403).json({ error: "Account unavailable or not approved" });
      return;
    }
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}


export function optionalAuthentication(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Token invalid but continue anyway
  }
  next();
}

/**
 * Middleware to verify admin access
 * Must be used after authenticateToken middleware
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
