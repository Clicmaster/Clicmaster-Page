// api/paypal-webhook.js
// PayPal avisa aquí cuando un cobro se completa. Sirve de respaldo:
// si el usuario cerró la página justo después de pagar, igual recibe sus ClicCoins.
// (Se configura en developer.paypal.com > tu app > Webhooks > evento PAYMENT.CAPTURE.COMPLETED)
import { manejador, leerCuerpo, ErrorUsuario } from './_lib/http.js';
import { verificarWebhook } from './_lib/paypal.js';
import { acreditarOrdenPaypal } from './_lib/recargas.js';

export default manejador(['POST'], async (req) => {
  const evento = leerCuerpo(req);
  const valido = await verificarWebhook(req.headers, evento);
  if (!valido) throw new ErrorUsuario('Firma inválida', 401);

  if (evento.event_type !== 'PAYMENT.CAPTURE.COMPLETED') return { ignorado: evento.event_type };

  const captura = evento.resource || {};
  const orderId =
    captura.supplementary_data &&
    captura.supplementary_data.related_ids &&
    captura.supplementary_data.related_ids.order_id;
  if (!orderId) return { ignorado: 'sin order_id' };

  try {
    const r = await acreditarOrdenPaypal({ orderId, captura });
    return { acreditado: !r.pendiente, duplicado: !!r.duplicado };
  } catch (e) {
    // Orden que no es de ClicCoins (por ejemplo, otro producto): se responde OK para que PayPal no reintente
    if (e instanceof ErrorUsuario && e.status === 404) return { ignorado: 'orden ajena' };
    throw e;
  }
});
