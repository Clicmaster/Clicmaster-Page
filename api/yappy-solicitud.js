// api/yappy-solicitud.js
// Recarga por Yappy (pago a un número). Como un Yappy personal no avisa a la página,
// el flujo es: el usuario pide un código -> paga escribiendo el código en el mensaje ->
// confirma con el número de comprobante -> un administrador revisa y aprueba.
//
// POST { accion: 'iniciar',   paqueteId }
// POST { accion: 'confirmar', solicitudId, comprobante }
// POST { accion: 'cancelar',  solicitudId }
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './_lib/firebaseAdmin.js';
import { manejador, usuarioDesdePeticion, leerCuerpo, ErrorUsuario } from './_lib/http.js';
import { buscarPaquete, coinsDePaquete, YAPPY } from './_lib/catalogo.js';

const COL = 'yappy_solicitudes';
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I para evitar confusiones

function nuevoCodigo() {
  const bytes = crypto.randomBytes(6);
  let c = '';
  for (const b of bytes) c += LETRAS[b % LETRAS.length];
  return 'CM-' + c;
}

async function leerPropia(uid, solicitudId) {
  if (!solicitudId || typeof solicitudId !== 'string') throw new ErrorUsuario('Solicitud inválida');
  const ref = db.collection(COL).doc(solicitudId);
  const snap = await ref.get();
  if (!snap.exists || snap.data().uid !== uid) throw new ErrorUsuario('Solicitud no encontrada', 404);
  return { ref, datos: snap.data() };
}

export default manejador(['POST'], async (req) => {
  const usuario = await usuarioDesdePeticion(req);
  const cuerpo = leerCuerpo(req);

  if (cuerpo.accion === 'iniciar') {
    if (!YAPPY.numero) throw new ErrorUsuario('Los pagos con Yappy aún no están activados', 503);
    const paquete = buscarPaquete(cuerpo.paqueteId);
    if (!paquete) throw new ErrorUsuario('Paquete no válido');

    const abiertas = await db
      .collection(COL)
      .where('uid', '==', usuario.uid)
      .where('estado', 'in', ['esperando-pago', 'pendiente'])
      .get();

    // Si ya tiene una esperando pago del mismo paquete, se reutiliza
    const misma = abiertas.docs.find(
      (d) => d.data().estado === 'esperando-pago' && d.data().paqueteId === paquete.id
    );
    if (misma) return { solicitudId: misma.id, ...vista(misma.data()) };

    if (abiertas.size >= YAPPY.maxPendientesPorUsuario) {
      throw new ErrorUsuario('Tienes varias recargas Yappy sin terminar. Espera a que se revisen o cancela alguna.');
    }

    const datos = {
      uid: usuario.uid,
      email: usuario.email,
      paqueteId: paquete.id,
      paqueteNombre: paquete.name,
      coins: coinsDePaquete(paquete),
      precioUsd: paquete.precioUsd,
      codigo: nuevoCodigo(),
      comprobante: null,
      estado: 'esperando-pago',
      creada: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COL).add(datos);
    return { solicitudId: ref.id, ...vista(datos) };
  }

  if (cuerpo.accion === 'confirmar') {
    const { ref, datos } = await leerPropia(usuario.uid, cuerpo.solicitudId);
    if (datos.estado !== 'esperando-pago') throw new ErrorUsuario('Esta solicitud ya fue enviada');
    const comprobante = String(cuerpo.comprobante || '').trim().slice(0, 60);
    if (comprobante.length < 4) throw new ErrorUsuario('Escribe el número de comprobante de Yappy');
    await ref.update({
      estado: 'pendiente',
      comprobante,
      confirmada: FieldValue.serverTimestamp(),
    });
    return { estado: 'pendiente', mensaje: 'Recibimos tu pago. Un administrador lo revisará pronto.' };
  }

  if (cuerpo.accion === 'cancelar') {
    const { ref, datos } = await leerPropia(usuario.uid, cuerpo.solicitudId);
    if (datos.estado !== 'esperando-pago') {
      throw new ErrorUsuario('Solo puedes cancelar si aún no confirmaste el pago');
    }
    await ref.update({ estado: 'cancelada', cancelada: FieldValue.serverTimestamp() });
    return { estado: 'cancelada' };
  }

  throw new ErrorUsuario('Acción no válida');
});

function vista(d) {
  return {
    codigo: d.codigo,
    estado: d.estado,
    precioUsd: d.precioUsd,
    coins: d.coins,
    paqueteNombre: d.paqueteNombre,
    yappyNumero: YAPPY.numero,
    yappyNombre: YAPPY.nombre,
  };
}
