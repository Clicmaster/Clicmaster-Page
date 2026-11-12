// api/clicoins-catalogo.js
// GET: paquetes de recarga, precios de artículos y datos de Yappy.
import { manejador } from './_lib/http.js';
import { PAQUETES_RECARGA, ARTICULOS, YAPPY } from './_lib/catalogo.js';

export default manejador(['GET'], async () => ({
  paquetes: PAQUETES_RECARGA,
  articulos: ARTICULOS,
  yappy: { activo: !!YAPPY.numero, numero: YAPPY.numero, nombre: YAPPY.nombre },
  paypal: { activo: !!process.env.PAYPAL_CLIENT_ID },
}));
