// api/_lib/firebaseAdmin.js
// Conexión del SERVIDOR con Firebase (con permisos totales).
// Esta clave nunca va en la página: solo vive en las variables de Vercel.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function leerCuentaDeServicio() {
  const crudo = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  if (!crudo) throw new Error('Falta la variable FIREBASE_SERVICE_ACCOUNT en Vercel');
  // Se acepta el JSON tal cual o codificado en base64
  const texto = crudo.trim().startsWith('{')
    ? crudo
    : Buffer.from(crudo, 'base64').toString('utf8');
  const cuenta = JSON.parse(texto);
  if (cuenta.private_key) cuenta.private_key = cuenta.private_key.replace(/\\n/g, '\n');
  return cuenta;
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(leerCuentaDeServicio()) });

export const db = getFirestore(app);
export const adminAuth = getAuth(app);
