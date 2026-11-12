// api/_lib/billetera.js
// Función central: suma o resta ClicCoins de forma segura.
//  - Todo ocurre dentro de una transacción de Firestore (no hay saldos a medias).
//  - Cada movimiento queda registrado en wallets/{uid}/movimientos.
//  - Si se repite el mismo pago (mismo "ref"), NO se acredita dos veces.
//  - El saldo nunca puede quedar negativo.
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebaseAdmin.js';
import { ErrorUsuario } from './http.js';

const TIPOS = ['recarga-paypal', 'recarga-yappy', 'compra-tienda', 'ajuste-admin'];

function limpiarRef(ref) {
  return String(ref).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
}

/**
 * @param {object} p
 * @param {string} p.uid      Usuario
 * @param {number} p.monto    Positivo suma, negativo resta (entero)
 * @param {string} p.tipo     Uno de TIPOS
 * @param {string} p.motivo   Texto que verá el usuario en su historial
 * @param {string} [p.ref]    Id único del pago/compra (evita duplicados)
 * @param {object} [p.detalle] Datos extra que se guardan con el movimiento
 * @param {(tx)=>Promise<any>} [p.antes]  Lecturas extra dentro de la transacción (puede lanzar error)
 * @param {(tx, ctx, saldo)=>void} [p.despues] Escrituras extra dentro de la misma transacción
 */
export async function moverCoins({ uid, monto, tipo, motivo, ref, detalle, antes, despues }) {
  if (!uid) throw new ErrorUsuario('Usuario inválido');
  if (!Number.isInteger(monto) || monto === 0) throw new ErrorUsuario('Monto inválido');
  if (!TIPOS.includes(tipo)) throw new Error('Tipo de movimiento desconocido: ' + tipo);

  const walletRef = db.collection('wallets').doc(uid);
  const movRef = ref
    ? walletRef.collection('movimientos').doc(`${tipo}_${limpiarRef(ref)}`)
    : walletRef.collection('movimientos').doc();

  return db.runTransaction(async (tx) => {
    // --- Lecturas (Firestore exige leer todo antes de escribir) ---
    const walletSnap = await tx.get(walletRef);
    const movSnap = ref ? await tx.get(movRef) : null;
    const saldoActual = walletSnap.exists ? Number(walletSnap.data().balance || 0) : 0;

    if (movSnap && movSnap.exists) {
      // Este pago ya se había acreditado: no se repite
      return { saldo: saldoActual, duplicado: true };
    }

    const contexto = antes ? await antes(tx) : undefined;

    const nuevoSaldo = saldoActual + monto;
    if (nuevoSaldo < 0) throw new ErrorUsuario('No tienes suficientes ClicCoins');

    // --- Escrituras ---
    tx.set(
      walletRef,
      { balance: nuevoSaldo, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    tx.set(movRef, {
      monto,
      tipo,
      motivo: motivo || '',
      ref: ref ? String(ref) : null,
      saldoDespues: nuevoSaldo,
      detalle: detalle || null,
      fecha: FieldValue.serverTimestamp(),
    });
    if (despues) despues(tx, contexto, nuevoSaldo);

    return { saldo: nuevoSaldo, duplicado: false };
  });
}

export async function saldoDe(uid) {
  const snap = await db.collection('wallets').doc(uid).get();
  return snap.exists ? Number(snap.data().balance || 0) : 0;
}
