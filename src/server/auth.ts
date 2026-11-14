import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { getStore, PublicUser, UserFacingError } from './db.js';

// ============================================================================
// CLAVE SECRETA PARA FIRMAR LAS SESIONES
// Se configura con la variable de entorno SESSION_SECRET (mínimo 32 caracteres).
// Si no existe, se genera una aleatoria al arrancar: es segura, pero todos los
// usuarios tendrán que volver a iniciar sesión cada vez que el servidor reinicie.
// ============================================================================
const SESSION_SECRET: string = (() => {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env.VERCEL) {
    // En Vercel hay varias copias del servidor: una clave temporal haría que las
    // sesiones fallen al azar. Mejor no iniciar sesiones hasta configurarla.
    console.error('[CLICMaster] FALTA SESSION_SECRET en Vercel: el inicio de sesión está desactivado.');
    return '';
  }
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
  if (!SESSION_SECRET) {
    throw new UserFacingError('El inicio de sesión no está configurado todavía. Intenta más tarde.', 503);
  }
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
  if (!SESSION_SECRET || !safeEqual(sign(payload), signature)) return null;
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

async function loadUser(req: AuthedRequest): Promise<PublicUser | undefined> {
  const token = getTokenFromRequest(req);
  const userId = token ? readSessionToken(token) : null;
  return userId ? getStore().getPublicUser(userId) : undefined;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  loadUser(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ success: false, message: 'Debes iniciar sesión para continuar.' });
        return;
      }
      req.user = user;
      next();
    })
    .catch(next);
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  loadUser(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ success: false, message: 'Debes iniciar sesión para continuar.' });
        return;
      }
      if (user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'No tienes permisos de administrador.' });
        return;
      }
      req.user = user;
      next();
    })
    .catch(next);
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

// ============================================================================
// INVITACIONES DE ADMINISTRADOR (enlace de activación)
// Un enlace firmado que permite crear UNA cuenta de administrador para un
// correo concreto. La persona invitada elige su propia contraseña, así nadie
// más la conoce. Caduca y no se puede reutilizar (el correo queda registrado).
// ============================================================================
export interface InvitePayload {
  email: string;
  role: 'admin';
  expires: number;
}

export function createInviteToken(email: string, hoursValid = 72): string {
  const payload: InvitePayload = { email: email.trim().toLowerCase(), role: 'admin', expires: Date.now() + hoursValid * 3600_000 };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(`invite:${body}`)}`;
}

export function readInviteToken(token: string): InvitePayload | null {
  if (!SESSION_SECRET || typeof token !== 'string') return null;
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra !== undefined) return null;
  if (!safeEqual(sign(`invite:${body}`), signature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as InvitePayload;
    if (payload.role !== 'admin' || typeof payload.email !== 'string') return null;
    if (!Number.isFinite(payload.expires) || payload.expires < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
