import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db, PublicUser } from './db.ts';

// ============================================================================
// CLAVE SECRETA PARA FIRMAR LAS SESIONES
// Se configura con la variable de entorno SESSION_SECRET (mínimo 32 caracteres).
// Si no existe, se genera una aleatoria al arrancar: es segura, pero todos los
// usuarios tendrán que volver a iniciar sesión cada vez que el servidor reinicie.
// ============================================================================
const SESSION_SECRET: string = (() => {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  console.warn(
    '[CLICMaster] AVISO: SESSION_SECRET no está configurada (o tiene menos de 32 caracteres). ' +
      'Se usará una clave temporal; las sesiones se cerrarán al reiniciar el servidor.'
  );
  return crypto.randomBytes(48).toString('hex');
})();

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

// ============================================================================
// CONTRASEÑAS (cifrado scrypt con sal aleatoria por usuario)
// ============================================================================
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, 'hex');
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}

/** Compara dos textos sin filtrar información por el tiempo de respuesta. */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// ============================================================================
// TOKENS DE SESIÓN FIRMADOS (formato: userId.expiración.firma)
// ============================================================================
function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `${Buffer.from(userId).toString('base64url')}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userPart, expiresPart, signature] = parts;
  const payload = `${userPart}.${expiresPart}`;
  if (!safeEqual(sign(payload), signature)) return null;
  const expires = Number(expiresPart);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  try {
    return Buffer.from(userPart, 'base64url').toString('utf-8');
  } catch {
    return null;
  }
}

// ============================================================================
// MIDDLEWARES: exigir sesión iniciada y exigir rol de administrador
// ============================================================================
export interface AuthedRequest extends Request {
  user?: PublicUser;
}

function getTokenFromRequest(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = getTokenFromRequest(req);
  const userId = token ? readSessionToken(token) : null;
  const user = userId ? db.getPublicUser(userId) : undefined;

  if (!user) {
    res.status(401).json({ success: false, message: 'Debes iniciar sesión para continuar.' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'No tienes permisos de administrador.' });
      return;
    }
    next();
  });
}

// ============================================================================
// LIMITADOR DE INTENTOS (evita adivinar contraseñas o llenar de solicitudes)
// ============================================================================
const attempts = new Map<string, number[]>();

/**
 * Devuelve true si la acción está permitida. Cuenta los intentos de cada
 * "clave" (IP, usuario, etc.) dentro de una ventana de tiempo.
 */
export function rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= maxAttempts) {
    attempts.set(key, recent);
    return false;
  }
  recent.push(now);
  attempts.set(key, recent);
  return true;
}

// Limpieza periódica para que el mapa no crezca sin control
setInterval(() => {
  const now = Date.now();
  for (const [key, list] of attempts) {
    const recent = list.filter((t) => now - t < 60 * 60 * 1000);
    if (recent.length === 0) attempts.delete(key);
    else attempts.set(key, recent);
  }
}, 10 * 60 * 1000).unref();
