import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export type Role = 'admin' | 'manager' | 'viewer';

export interface AuthUser {
  id: number;
  company_id: number | null;
  name: string;
  email: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'drevantix-dev-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('[auth] JWT_SECRET not set; using an insecure development secret');

const findUser = db.prepare<[number], AuthUser>('SELECT id, company_id, name, email, role FROM users WHERE id = ?');

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string | undefined): AuthUser | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number };
    return findUser.get(Number(payload.sub)) ?? null;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const user = verifyToken(header?.startsWith('Bearer ') ? header.slice(7) : undefined);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

/** Company the request is scoped to; null means all companies (platform admins only). */
export function scopeCompany(req: Request): number | null {
  const user = req.user!;
  if (user.role === 'admin') {
    const q = req.query.companyId;
    return q ? Number(q) : null;
  }
  return user.company_id;
}
