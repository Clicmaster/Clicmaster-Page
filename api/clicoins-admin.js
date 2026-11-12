// api/clicoins-admin.js
// Panel de administración. Solo pueden usarlo los correos de ADMIN_EMAILS (en Vercel).
//
// POST { accion: 'yo' }                                   -> ¿soy admin?
// POST { accion: 'yappy-listar', estado? }                -> lista solicitudes (por defecto 'pendiente')
// POST { accion: 'yappy-aprobar', solicitudId }           -> acredita las ClicCoins
// POST { accion: 'yappy-rechazar', solicitudId, motivo }  -> rechaza la solicitud
// POST { accion: 'pedidos-listar', estado? }              -> compras por entregar ('por-entregar' | 'entregado')
// POST { accion: 'pedido-entregado', pedidoId }           -> marcar como entregado
// POST { accion: 'buscar-usuario', email }                -> uid y saldo
// POST { accion: 'ajustar', email | uid, monto, motivo }  -> dar o quitar monedas a mano
import { FieldValue } from 'firebase-admin/firestore';
import { db, adminAuth } from './_lib/firebaseAdmin.js';
import { manejador, usuarioDesdePeticion, esAdmin, leerCuerpo, ErrorUsuario } from './_lib/http.js';
import { moverCoins, saldoDe } from './_lib/billetera.js';

const COL = 'yappy_solicitudes';
const ESTADOS = ['esperando-pago', 'pendiente', 'aprobada', 'rechazada', 'cancelada'];

function aMillis(t) {
  return t && t.toMillis ? t.toMillis() : null;
}

async function uidDesde({ uid, email }) {
  if (uid) return String(uid);
  if (!email) throw new ErrorUsuario('Falta el correo del usuario');
  try {
    return (await adminAuth.getUserByEmail(String(email).trim())).uid;
  } catch {
    throw new ErrorUsuario('No existe un usuario con ese correo', 404);
  }
}

export default manejador(['POST'], async (req) => {
  const admin = await usuarioDesdePeticion(req);
  const cuerpo = leerCuerpo(req);

  if (cuerpo.accion === 'yo') {
    const resultado = esAdmin(admin);
    console.log('[clicoins] admin?', { email: admin.email, verificado: admin.emailVerificado, admin: resultado });
    return { admin: resultado, email: admin.email, verificado: admin.emailVerificado };
  }
  if (!esAdmin(admin)) throw new ErrorUsuario('No autorizado', 403);

  switch (cuerpo.accion) {
    case 'yappy-listar': {
      const estado = ESTADOS.includes(cuerpo.estado) ? cuerpo.estado : 'pendiente';
      const snap = await db.collection(COL).where('estado', '==', estado).limit(200).get();
      const solicitudes = snap.docs
        .map((d) => {
          const x = d.data();
          return {
            id: d.id,
            email: x.email,
            uid: x.uid,
            paqueteNombre: x.paqueteNombre,
            coins: x.coins,
            precioUsd: x.precioUsd,
            codigo: x.codigo,
            comprobante: x.comprobante,
            estado: x.estado,
            creada: aMillis(x.creada),
            confirmada: aMillis(x.confirmada),
            motivoRechazo: x.motivoRechazo || null,
          };
        })
        .sort((a, b) => (a.confirmada || a.creada || 0) - (b.confirmada || b.creada || 0));
      return { solicitudes };
    }

    case 'yappy-aprobar': {
      const ref = db.collection(COL).doc(String(cuerpo.solicitudId || ''));
      const previa = await ref.get();
      if (!previa.exists) throw new ErrorUsuario('Solicitud no encontrada', 404);
      const s = previa.data();

      const r = await moverCoins({
        uid: s.uid,
        monto: Number(s.coins),
        tipo: 'recarga-yappy',
        motivo: `Recarga Yappy: ${s.paqueteNombre}`,
        ref: ref.id,
        detalle: { codigo: s.codigo, comprobante: s.comprobante, precioUsd: s.precioUsd },
        antes: async (tx) => {
          const actual = await tx.get(ref);
          const est = actual.data().estado;
          if (!['pendiente', 'esperando-pago'].includes(est)) {
            throw new ErrorUsuario(`Esta solicitud ya está ${est}`);
          }
        },
        despues: (tx) => {
          tx.update(ref, {
            estado: 'aprobada',
            revisadaPor: admin.email,
            revisada: FieldValue.serverTimestamp(),
          });
        },
      });
      return { saldoUsuario: r.saldo, duplicado: r.duplicado };
    }

    case 'yappy-rechazar': {
      const ref = db.collection(COL).doc(String(cuerpo.solicitudId || ''));
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new ErrorUsuario('Solicitud no encontrada', 404);
        const est = snap.data().estado;
        if (!['pendiente', 'esperando-pago'].includes(est)) {
          throw new ErrorUsuario(`Esta solicitud ya está ${est}`);
        }
        tx.update(ref, {
          estado: 'rechazada',
          motivoRechazo: String(cuerpo.motivo || 'Pago no encontrado').slice(0, 200),
          revisadaPor: admin.email,
          revisada: FieldValue.serverTimestamp(),
        });
      });
      return { estado: 'rechazada' };
    }

    case 'pedidos-listar': {
      const estado = cuerpo.estado === 'entregado' ? 'entregado' : 'por-entregar';
      const snap = await db.collection('pedidos').where('estado', '==', estado).limit(200).get();
      const pedidos = snap.docs
        .map((d) => {
          const x = d.data();
          return {
            id: d.id,
            email: x.email,
            articulo: x.articulo,
            precioCoins: x.precioCoins,
            robloxUser: x.robloxUser,
            discordUser: x.discordUser,
            estado: x.estado,
            creado: aMillis(x.creado),
            entregadoPor: x.entregadoPor || null,
          };
        })
        .sort((a, b) => (a.creado || 0) - (b.creado || 0));
      return { pedidos };
    }

    case 'pedido-entregado': {
      const ref = db.collection('pedidos').doc(String(cuerpo.pedidoId || ''));
      const snap = await ref.get();
      if (!snap.exists) throw new ErrorUsuario('Pedido no encontrado', 404);
      await ref.update({
        estado: 'entregado',
        entregadoPor: admin.email,
        entregado: FieldValue.serverTimestamp(),
      });
      return { estado: 'entregado' };
    }

    case 'buscar-usuario': {
      const uid = await uidDesde(cuerpo);
      return { uid, saldo: await saldoDe(uid) };
    }

    case 'ajustar': {
      const uid = await uidDesde(cuerpo);
      const monto = Number(cuerpo.monto);
      if (!Number.isInteger(monto) || monto === 0) throw new ErrorUsuario('El monto debe ser un número entero');
      const r = await moverCoins({
        uid,
        monto,
        tipo: 'ajuste-admin',
        motivo: String(cuerpo.motivo || 'Ajuste manual').slice(0, 200),
        detalle: { admin: admin.email },
      });
      console.log('[clicoins] ajuste admin', { por: admin.email, uid, monto, saldo: r.saldo });
      return { uid, saldo: r.saldo };
    }

    default:
      throw new ErrorUsuario('Acción no válida');
  }
});
