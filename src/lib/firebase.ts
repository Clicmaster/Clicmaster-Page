// src/lib/firebase.ts
// Conexión de la PÁGINA con Firebase: inicio de sesión y lectura de los datos propios.
// La página nunca escribe saldos: eso solo lo hace el servidor (carpeta api/).
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** true cuando las variables VITE_FIREBASE_* están puestas */
export const firebaseConfigurado = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function firebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (!firebaseConfigurado) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app: app!, auth: auth!, db: db! };
}
