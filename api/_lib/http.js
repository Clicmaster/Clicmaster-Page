// api/_lib/http.js
// Utilidades comunes: leer el usuario que hace la petición y responder errores.
import { adminAuth } from './firebaseAdmin.js';

export class ErrorUsuario extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

// Comprueba el token de inicio de sesión de Firebase que manda la página
export async function usuarioDesdePeticion(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new ErrorUsuario('Inicia sesión para continuar', 401);
  try {
    const u = await adminAuth.verifyIdToken(token);
    return { uid: u.uid, email: u.email || '', emailVerificado: !!u.email_verified, claims: u };
  } catch (e) {
    if (e && e.publico) throw e; // falta configuración en el servidor
    throw new ErrorUsuario('Tu sesión expiró, vuelve a iniciar sesión', 401);
  }
}

// Administradores: correos en ADMIN_EMAILS (separados por coma) o claim admin=true
export function esAdmin(usuario) {
  if (usuario.claims && usuario.claims.admin === true) return true;
  const lista = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  return usuario.emailVerificado && lista.includes(usuario.email.toLowerCase());
}

export function leerCuerpo(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

// Envuelve cada función para manejar método y errores de forma uniforme
export function manejador(metodos, fn) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!metodos.includes(req.method)) {
      return res.status(405).json({ error: 'Método no permitido' });
    }
    try {
      const resultado = await fn(req, res);
      if (!res.headersSent) res.status(200).json({ ok: true, ...resultado });
    } catch (e) {
      const status = e instanceof ErrorUsuario ? e.status : e && e.publico ? e.status || 503 : 500;
      if (!(e instanceof ErrorUsuario)) console.error('[clicoins]', e);
      const mensaje = e instanceof ErrorUsuario ? e.message : e && e.publico ? e.publico : 'Error interno, intenta de nuevo';
      if (!res.headersSent) res.status(status).json({ error: mensaje });
    }
  };
}
