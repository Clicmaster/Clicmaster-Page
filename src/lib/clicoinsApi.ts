// src/lib/clicoinsApi.ts
// Llamadas a las funciones del servidor (carpeta api/) con el token de la sesión.
import { firebase } from './firebase.ts';

export async function llamarApi<T = any>(ruta: string, cuerpo?: unknown, metodo: 'GET' | 'POST' = 'POST'): Promise<T> {
  const fb = firebase();
  const usuario = fb?.auth.currentUser;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (usuario) headers.Authorization = `Bearer ${await usuario.getIdToken()}`;

  let r: Response;
  try {
    r = await fetch(`/api/${ruta}`, {
      method: metodo,
      headers,
      body: metodo === 'GET' ? undefined : JSON.stringify(cuerpo ?? {}),
    });
  } catch {
    throw new Error('No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.');
  }
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || 'Algo salió mal, intenta de nuevo');
  return datos as T;
}

export function idAleatorio(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Carga el script oficial de PayPal una sola vez
declare global {
  interface Window {
    paypal?: any;
  }
}
let promesaPaypal: Promise<any> | null = null;

export function cargarPaypal(): Promise<any> {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (promesaPaypal) return promesaPaypal;
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
  if (!clientId) return Promise.reject(new Error('PayPal aún no está configurado (falta VITE_PAYPAL_CLIENT_ID).'));
  promesaPaypal = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&locale=es_ES`;
    s.onload = () => resolve(window.paypal);
    s.onerror = () => {
      promesaPaypal = null;
      reject(new Error('No se pudo cargar PayPal. Desactiva el bloqueador de anuncios e intenta de nuevo.'));
    };
    document.head.appendChild(s);
  });
  return promesaPaypal;
}
