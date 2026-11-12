// api/_lib/firebaseAdmin.js
// Conexión del SERVIDOR con Firebase (con permisos totales).
// Esta clave nunca va en la página: solo vive en las variables de Vercel.
// Se conecta solo cuando una función la necesita (si falta la configuración,
// la función responde un error claro en vez de caerse).
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function errorConfiguracion(mensaje) {
  const e = new Error(mensaje);
  e.status = 503;
  e.publico = 'ClicCoins aún no está configurado. Intenta más tarde.';
  return e;
}

function leerCuentaDeServicio() {
  const crudo = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  if (!crudo) throw errorConfiguracion('Falta la variable FIREBASE_SERVICE_ACCOUNT en Vercel');
  try {
    // Se acepta el JSON tal cual o codificado en base64
    const texto = crudo.trim().startsWith('{') ? crudo : Buffer.from(crudo, 'base64').toString('utf8');
    const cuenta = JSON.parse(texto);
    if (cuenta.private_key) cuenta.private_key = cuenta.private_key.replace(/\\n/g, '\n');
    return cuenta;
  } catch {
    throw errorConfiguracion('FIREBASE_SERVICE_ACCOUNT no es un JSON válido');
  }
}

let app = null;
function obtenerApp() {
  if (!app) app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(leerCuentaDeServicio()) });
  return app;
}

// Objetos "perezosos": se crean la primera vez que se usan
function perezoso(crear) {
  let instancia = null;
  return new Proxy(
    {},
    {
      get(_obj, prop) {
        if (!instancia) instancia = crear();
        const valor = instancia[prop];
        return typeof valor === 'function' ? valor.bind(instancia) : valor;
      },
    }
  );
}

export const db = perezoso(() => getFirestore(obtenerApp()));
export const adminAuth = perezoso(() => getAuth(obtenerApp()));
