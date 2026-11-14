// ============================================================================
// ELECCIÓN DE LA BASE DE DATOS
// - Si existe FIREBASE_SERVICE_ACCOUNT → Firestore (la base de datos real).
// - En Vercel sin esa clave → error claro (nunca se usa un archivo, porque
//   en Vercel los archivos se borran y se perderían saldos).
// - En tu computadora sin clave → archivo data/cliccoins_db.json (solo pruebas).
// ============================================================================
import path from 'node:path';
import { DataStore, UserFacingError } from './types.js';
import { JsonFileStore } from './jsonStore.js';
import { FirestoreStore } from './firestoreStore.js';

export * from './types.js';

let store: DataStore | null = null;

function createStore(): DataStore {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return new FirestoreStore();
  }
  if (process.env.VERCEL) {
    throw new UserFacingError('La base de datos no está configurada (falta FIREBASE_SERVICE_ACCOUNT).', 503);
  }
  const filePath = path.resolve(process.cwd(), process.env.DB_PATH || path.join('data', 'cliccoins_db.json'));
  console.warn(`[CLICMaster] Usando base de datos LOCAL de pruebas en ${filePath}`);
  return new JsonFileStore(filePath);
}

/** Devuelve la base de datos activa (se crea la primera vez que se usa). */
export function getStore(): DataStore {
  if (!store) store = createStore();
  return store;
}
