// api/_lib/recargas.js
// Acredita una orden de PayPal ya cobrada. Lo usan "paypal-capturar" y "paypal-webhook".
// Como el ref es el id de la orden, aunque ambos lleguen, se acredita UNA sola vez.
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebaseAdmin.js';
import { buscarPaquete, coinsDePaquete } from './catalogo.js';
import { moverCoins } from './billetera.js';
import { ErrorUsuario } from './http.js';

export async function acreditarOrdenPaypal({ orderId, captura, uidEsperado }) {
  const ordenRef = db.collection('paypal_ordenes').doc(orderId);
  const ordenSnap = await ordenRef.get();
  if (!ordenSnap.exists) throw new ErrorUsuario('Orden desconocida', 404);
  const orden = ordenSnap.data();

  if (uidEsperado && orden.uid !== uidEsperado) throw new ErrorUsuario('Esta orden no es tuya', 403);

  const paquete = buscarPaquete(orden.paqueteId);
  if (!paquete) throw new Error('Paquete de la orden ya no existe: ' + orden.paqueteId);

  // Validar lo que PayPal dice que cobró
  const estado = captura.status;
  const valor = captura.amount && captura.amount.value;
  const moneda = captura.amount && captura.amount.currency_code;
  if (captura.custom_id && captura.custom_id !== orden.uid) {
    throw new Error('custom_id no coincide con la orden ' + orderId);
  }
  if (moneda !== 'USD' || Number(valor) !== Number(paquete.precioUsd)) {
    await ordenRef.set({ estado: 'monto-incorrecto', captura: { estado, valor, moneda } }, { merge: true });
    throw new Error(`Monto inesperado en orden ${orderId}: ${valor} ${moneda}`);
  }
  if (estado !== 'COMPLETED') {
    await ordenRef.set({ estado: 'pendiente-paypal', actualizado: FieldValue.serverTimestamp() }, { merge: true });
    return { pendiente: true };
  }

  const r = await moverCoins({
    uid: orden.uid,
    monto: coinsDePaquete(paquete),
    tipo: 'recarga-paypal',
    motivo: `Recarga PayPal: ${paquete.name}`,
    ref: orderId,
    detalle: { paqueteId: paquete.id, precioUsd: paquete.precioUsd, capturaId: captura.id || null },
    despues: (tx) => {
      tx.set(
        ordenRef,
        { estado: 'acreditada', capturaId: captura.id || null, acreditada: FieldValue.serverTimestamp() },
        { merge: true }
      );
    },
  });
  return { saldo: r.saldo, coins: coinsDePaquete(paquete), duplicado: r.duplicado };
}

// Saca la primera captura de una respuesta de orden de PayPal
export function primeraCaptura(orden) {
  const pu = (orden.purchase_units || [])[0] || {};
  const cap = ((pu.payments || {}).captures || [])[0];
  if (!cap) return null;
  return { ...cap, custom_id: cap.custom_id || pu.custom_id };
}
