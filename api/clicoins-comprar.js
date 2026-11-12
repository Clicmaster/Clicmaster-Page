// api/clicoins-comprar.js
// POST { articuloId, compraId, robloxUser?, discordUser? }
// Gasta ClicCoins con el precio del SERVIDOR, activa la membresía/beneficio
// y crea un PEDIDO para que el staff entregue el ítem en Roblox/Discord.
// compraId lo genera la página: si hay doble clic, se cobra una sola vez.
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { db } from './_lib/firebaseAdmin.js';
import { manejador, usuarioDesdePeticion, leerCuerpo, ErrorUsuario } from './_lib/http.js';
import { buscarArticulo } from './_lib/catalogo.js';
import { moverCoins } from './_lib/billetera.js';

const DIA_MS = 24 * 60 * 60 * 1000;

function extenderMembresia(actual, dias) {
  const ahora = Date.now();
  const base = actual && actual.toMillis && actual.toMillis() > ahora ? actual.toMillis() : ahora;
  return Timestamp.fromMillis(base + dias * DIA_MS);
}

const texto = (v, max) => String(v || '').trim().slice(0, max);

export default manejador(['POST'], async (req) => {
  const usuario = await usuarioDesdePeticion(req);
  const { articuloId, compraId, robloxUser, discordUser } = leerCuerpo(req);

  const art = buscarArticulo(articuloId);
  if (!art) throw new ErrorUsuario('Este artículo no se puede comprar con ClicCoins');
  if (!compraId || typeof compraId !== 'string' || compraId.length < 8 || compraId.length > 64) {
    throw new ErrorUsuario('Compra inválida');
  }

  const benefRef = db.collection('beneficios').doc(usuario.uid);
  const pedidoRef = db.collection('pedidos').doc(`${usuario.uid}-${compraId}`.replace(/[^a-zA-Z0-9_-]/g, ''));

  const r = await moverCoins({
    uid: usuario.uid,
    monto: -Number(art.precioCoins),
    tipo: 'compra-tienda',
    motivo: `Compra: ${art.nombre}`,
    ref: `${usuario.uid}-${compraId}`,
    detalle: { articuloId: art.id },
    antes: async (tx) => {
      const snap = await tx.get(benefRef);
      const actual = snap.exists ? snap.data() : {};
      if (art.tipo === 'unico' && actual.items && actual.items[art.id]) {
        throw new ErrorUsuario('Ya tienes este artículo');
      }
      return actual;
    },
    despues: (tx, actual) => {
      const ahora = Timestamp.now();
      const cambios = { actualizado: ahora };
      if (art.tipo === 'membresia') {
        const previa = actual && actual.membresias && actual.membresias[art.membresia];
        cambios.membresias = { [art.membresia]: extenderMembresia(previa, art.dias) };
      } else {
        const veces = (actual && actual.items && actual.items[art.id] && actual.items[art.id].veces) || 0;
        cambios.items = { [art.id]: { nombre: art.nombre, desde: ahora, veces: veces + 1 } };
      }
      tx.set(benefRef, cambios, { merge: true });

      tx.set(pedidoRef, {
        uid: usuario.uid,
        email: usuario.email,
        articuloId: art.id,
        articulo: art.nombre,
        precioCoins: art.precioCoins,
        robloxUser: texto(robloxUser, 60),
        discordUser: texto(discordUser, 60),
        estado: 'por-entregar',
        creado: FieldValue.serverTimestamp(),
      });
    },
  });

  return { saldo: r.saldo, duplicado: r.duplicado, articulo: art.nombre, precioCoins: art.precioCoins };
});
