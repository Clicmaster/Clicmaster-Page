// api/paypal-capturar.js
// POST { orderId } -> cobra la orden aprobada y acredita las ClicCoins.
import { manejador, usuarioDesdePeticion, leerCuerpo, ErrorUsuario } from './_lib/http.js';
import { capturarOrden } from './_lib/paypal.js';
import { acreditarOrdenPaypal, primeraCaptura } from './_lib/recargas.js';
import { db } from './_lib/firebaseAdmin.js';

export default manejador(['POST'], async (req) => {
  const usuario = await usuarioDesdePeticion(req);
  const { orderId } = leerCuerpo(req);
  if (!orderId || typeof orderId !== 'string' || !/^[A-Z0-9]{5,40}$/i.test(orderId)) {
    throw new ErrorUsuario('Orden inválida');
  }

  // Comprobar que la orden la creó este usuario ANTES de cobrar
  const snap = await db.collection('paypal_ordenes').doc(orderId).get();
  if (!snap.exists || snap.data().uid !== usuario.uid) throw new ErrorUsuario('Orden no encontrada', 404);

  const orden = await capturarOrden(orderId);
  const captura = primeraCaptura(orden);
  if (!captura) throw new ErrorUsuario('PayPal no confirmó el cobro');

  const r = await acreditarOrdenPaypal({ orderId, captura, uidEsperado: usuario.uid });
  if (r.pendiente) {
    return {
      pendiente: true,
      mensaje: 'PayPal está revisando el pago. Tus ClicCoins llegarán en cuanto lo confirme.',
    };
  }
  return { saldo: r.saldo, coins: r.coins };
});
