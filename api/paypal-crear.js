// api/paypal-crear.js
// POST { paqueteId }  -> crea la orden en PayPal con el precio del SERVIDOR.
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './_lib/firebaseAdmin.js';
import { manejador, usuarioDesdePeticion, leerCuerpo, ErrorUsuario } from './_lib/http.js';
import { buscarPaquete, coinsDePaquete } from './_lib/catalogo.js';
import { crearOrden } from './_lib/paypal.js';

export default manejador(['POST'], async (req) => {
  const usuario = await usuarioDesdePeticion(req);
  const { paqueteId } = leerCuerpo(req);
  const paquete = buscarPaquete(paqueteId);
  if (!paquete) throw new ErrorUsuario('Paquete no válido');

  const orderId = await crearOrden({ paquete, uid: usuario.uid });

  await db.collection('paypal_ordenes').doc(orderId).set({
    uid: usuario.uid,
    email: usuario.email,
    paqueteId: paquete.id,
    precioUsd: paquete.precioUsd,
    coins: coinsDePaquete(paquete),
    estado: 'creada',
    creada: FieldValue.serverTimestamp(),
  });

  return { orderId };
});
