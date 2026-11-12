// api/_lib/paypal.js
// Conexión con la API de PayPal (Orders v2) desde el servidor.
import { ErrorUsuario } from './http.js';

const BASE =
  (process.env.PAYPAL_ENV || 'sandbox').toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function tokenAcceso() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secreto = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secreto) {
    const e = new Error('Faltan PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET en Vercel');
    e.status = 503;
    e.publico = 'Los pagos con PayPal aún no están activados.';
    throw e;
  }
  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secreto}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('PayPal no aceptó las credenciales: ' + (await r.text()));
  return (await r.json()).access_token;
}

async function llamar(metodo, ruta, cuerpo, extraHeaders = {}) {
  const token = await tokenAcceso();
  const r = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, datos };
}

export async function crearOrden({ paquete, uid }) {
  const { ok, datos } = await llamar(
    'POST',
    '/v2/checkout/orders',
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: paquete.id,
          custom_id: uid,
          description: `CLICMASTER - ${paquete.name} (ClicCoins)`,
          amount: { currency_code: 'USD', value: paquete.precioUsd },
        },
      ],
      application_context: {
        brand_name: 'ClicMaster',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    }
  );
  if (!ok || !datos.id) {
    console.error('[paypal] crear orden', datos);
    throw new ErrorUsuario('No se pudo iniciar el pago con PayPal');
  }
  return datos.id;
}

// Comprueba que un aviso (webhook) realmente viene de PayPal
export async function verificarWebhook(headers, evento) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error('Falta PAYPAL_WEBHOOK_ID en Vercel');
  const { ok, datos } = await llamar('POST', '/v1/notifications/verify-webhook-signature', {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: webhookId,
    webhook_event: evento,
  });
  return ok && datos.verification_status === 'SUCCESS';
}

// Captura (cobra) la orden. Si ya estaba capturada, la consulta.
export async function capturarOrden(orderId) {
  const cap = await llamar('POST', `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, null, {
    'PayPal-Request-Id': `cap-${orderId}`,
  });
  if (cap.ok) return cap.datos;

  const yaCapturada = (cap.datos.details || []).some((d) => d.issue === 'ORDER_ALREADY_CAPTURED');
  if (yaCapturada) {
    const q = await llamar('GET', `/v2/checkout/orders/${encodeURIComponent(orderId)}`);
    if (q.ok) return q.datos;
  }
  console.error('[paypal] capturar', cap.datos);
  const rechazo = (cap.datos.details || []).some((d) => d.issue === 'INSTRUMENT_DECLINED');
  throw new ErrorUsuario(
    rechazo ? 'PayPal rechazó el método de pago, prueba con otro' : 'No se pudo completar el pago'
  );
}
