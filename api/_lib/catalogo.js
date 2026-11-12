// api/_lib/catalogo.js
// Catálogo del servidor. Los PRECIOS se cambian en api/_lib/precios.js
import { PAQUETES_RECARGA, ARTICULOS } from './precios.js';

export { PAQUETES_RECARGA, ARTICULOS };

// Datos de Yappy que verá el usuario para pagar (se configuran en Vercel)
export const YAPPY = {
  numero: process.env.YAPPY_NUMERO || '',
  nombre: process.env.YAPPY_NOMBRE || 'CLICMASTER',
  maxPendientesPorUsuario: 3,
};

export function buscarPaquete(id) {
  return PAQUETES_RECARGA.find((p) => p.id === id) || null;
}

export function coinsDePaquete(p) {
  return Number(p.coins) + Number(p.bonus || 0);
}

export function buscarArticulo(id) {
  const a = ARTICULOS[id];
  return a ? { id, ...a } : null;
}
