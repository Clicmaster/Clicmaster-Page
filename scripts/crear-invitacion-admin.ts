// ============================================================================
// CREAR UN ENLACE DE ACTIVACIÓN DE ADMINISTRADOR
// Uso (con SESSION_SECRET igual a la de Vercel):
//   SESSION_SECRET="..." npx tsx scripts/crear-invitacion-admin.ts correo@ejemplo.com
// Devuelve un enlace que caduca en 72 horas. La persona lo abre, elige su
// usuario y su propia contraseña, y su cuenta queda creada como administrador.
// (Otra opción más sencilla: registrarse con el código ADMIN_INVITE_CODE.)
// ============================================================================
import { createInviteToken } from '../src/server/auth.js';

const email = process.argv[2];
const site = process.env.SITE_URL || 'https://clicmaster.vercel.app';
if (!email || !email.includes('@')) {
  console.error('Escribe el correo: npx tsx scripts/crear-invitacion-admin.ts correo@ejemplo.com');
  process.exit(1);
}
console.log(`${site}/?invitacion=${encodeURIComponent(createInviteToken(email))}`);
