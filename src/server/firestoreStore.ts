// ============================================================================
// BASE DE DATOS REAL: FIRESTORE (Firebase)
// Se usa en Vercel. La conexión usa la clave de servidor guardada en la
// variable FIREBASE_SERVICE_ACCOUNT (nunca se envía a la página).
//
// Colecciones (en producción; en las versiones de prueba llevan "preview_" delante):
//   cm_users          → cuentas (saldo, rol, contraseña cifrada)
//   cm_usernames      → reserva de nombres de usuario (evita duplicados)
//   cm_transactions   → recargas, compras y movimientos
//   cm_payment_refs   → comprobantes ya usados (evita cobrar dos veces el mismo)
//   cm_shop_purchases → artículos comprados en la tienda
//
// Todo cambio de saldo ocurre dentro de una transacción de Firestore: si dos
// operaciones llegan al mismo tiempo, Firestore las ordena y nunca se pierde
// ni se duplica una moneda.
// ============================================================================
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  BuyRequestParams,
  DataStore,
  DEFAULT_AVATAR,
  MAX_PENDING_PER_USER,
  PublicUser,
  ShopPurchase,
  ShopPurchaseParams,
  StoredUser,
  Transaction,
  UserFacingError,
  buildBuyRequestTransaction,
  buildShopRecords,
  getPackage,
  insufficientBalance,
  newId,
  normalizeReference,
  sortNewestFirst,
  toPublicUser,
} from './types.js';

/** Prefijo de las colecciones: producción usa "cm_", las pruebas "preview_cm_" o "dev_cm_". */
function collectionPrefix(): string {
  if (process.env.FIRESTORE_COLLECTION_PREFIX !== undefined) return process.env.FIRESTORE_COLLECTION_PREFIX;
  const env = process.env.VERCEL_ENV;
  if (env === 'production') return 'cm_';
  if (env === 'preview') return 'preview_cm_';
  return 'dev_cm_';
}

function readServiceAccount(): Record<string, any> {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  if (!raw) {
    throw new UserFacingError('La base de datos no está configurada (falta FIREBASE_SERVICE_ACCOUNT).', 503);
  }
  try {
    // Se acepta el JSON tal cual o codificado en base64
    const text = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const account = JSON.parse(text);
    if (typeof account.private_key === 'string') {
      account.private_key = account.private_key.replace(/\\n/g, '\n');
    }
    if (!account.project_id || !account.client_email || !account.private_key) {
      throw new Error('faltan campos');
    }
    return account;
  } catch {
    console.error('[CLICMaster] FIREBASE_SERVICE_ACCOUNT no es una clave de servicio válida.');
    throw new UserFacingError('La base de datos no está configurada correctamente.', 503);
  }
}

let firestoreInstance: any = null;

function getDb(): any {
  if (firestoreInstance) return firestoreInstance;
  const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(readServiceAccount() as any) });
  const db = getFirestore(app);
  try {
    // Permite guardar objetos con campos opcionales vacíos
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // ya configurado en esta instancia
  }
  firestoreInstance = db;
  return db;
}

/** Quita campos vacíos antes de guardar (Firestore no acepta "undefined"). */
function clean<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export class FirestoreStore implements DataStore {
  readonly kind = 'firestore' as const;
  private readonly prefix = collectionPrefix();

  private col(name: 'users' | 'usernames' | 'transactions' | 'payment_refs' | 'shop_purchases') {
    return getDb().collection(`${this.prefix}${name}`);
  }

  private refKey(method: string, reference: string): string {
    return `${method}_${normalizeReference(reference)}`;
  }

  async ping(): Promise<void> {
    await this.col('users').limit(1).get();
  }

  // ---------------------------------------------------------------- Usuarios
  async getPublicUser(userId: string): Promise<PublicUser | undefined> {
    if (!userId || userId.includes('/')) return undefined;
    const snap = await this.col('users').doc(userId).get();
    if (!snap.exists) return undefined;
    const user = snap.data() as StoredUser;
    if (!user.password_hash) return undefined;
    return toPublicUser(user);
  }

  async findUserByUsername(username: string): Promise<StoredUser | undefined> {
    const lower = username.trim().toLowerCase();
    if (!lower || lower.includes('/')) return undefined;
    const nameSnap = await this.col('usernames').doc(lower).get();
    if (!nameSnap.exists) return undefined;
    const userId = nameSnap.data()?.user_id;
    if (!userId) return undefined;
    const userSnap = await this.col('users').doc(userId).get();
    return userSnap.exists ? (userSnap.data() as StoredUser) : undefined;
  }

  async createUser(params: {
    username: string;
    robloxUsername: string;
    passwordHash: string;
    passwordSalt: string;
    role: 'user' | 'admin';
  }): Promise<PublicUser> {
    const lower = params.username.toLowerCase();
    const user: StoredUser = {
      id: newId('usr'),
      username: params.username,
      username_lower: lower,
      roblox_username: params.robloxUsername,
      cliccoins_balance: 0,
      role: params.role,
      avatar: DEFAULT_AVATAR,
      created_at: new Date().toISOString(),
      password_hash: params.passwordHash,
      password_salt: params.passwordSalt,
    };

    await getDb().runTransaction(async (t: any) => {
      const nameRef = this.col('usernames').doc(lower);
      const nameSnap = await t.get(nameRef);
      if (nameSnap.exists) throw new UserFacingError('Ese nombre de usuario ya está en uso.');
      t.create(nameRef, { user_id: user.id, created_at: user.created_at });
      t.create(this.col('users').doc(user.id), clean(user));
    });

    return toPublicUser(user);
  }

  // ----------------------------------------------------------- Transacciones
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const snap = await this.col('transactions').where('user_id', '==', userId).limit(500).get();
    return sortNewestFirst<Transaction>(snap.docs.map((d: any) => d.data() as Transaction)).slice(0, 200);
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    const snap = await this.col('transactions').where('estado', '==', 'pendiente').limit(500).get();
    return sortNewestFirst<Transaction>(snap.docs.map((d: any) => d.data() as Transaction));
  }

  async getPurchaseRequests(limit = 300): Promise<Transaction[]> {
    const snap = await this.col('transactions').where('tipo', '==', 'compra_coins').limit(2000).get();
    return sortNewestFirst<Transaction>(snap.docs.map((d: any) => d.data() as Transaction)).slice(0, limit);
  }

  async createBuyRequest(params: BuyRequestParams): Promise<Transaction> {
    const pkg = getPackage(params.packageId);
    if (!pkg) throw new UserFacingError('El paquete seleccionado no existe.');

    const db = getDb();
    return db.runTransaction(async (t: any) => {
      // 1) Lecturas (Firestore exige leer todo antes de escribir)
      const userRef = this.col('users').doc(params.userId);
      const refRef = this.col('payment_refs').doc(this.refKey(params.paymentMethod, params.paymentReference));
      const pendingQuery = this.col('transactions')
        .where('user_id', '==', params.userId)
        .where('estado', '==', 'pendiente');

      const [userSnap, refSnap, pendingSnap] = await Promise.all([t.get(userRef), t.get(refRef), t.get(pendingQuery)]);

      if (!userSnap.exists) throw new UserFacingError('Usuario no encontrado.', 404);
      if (refSnap.exists) throw new UserFacingError('Ese número de comprobante ya fue registrado anteriormente.');
      if (pendingSnap.size >= MAX_PENDING_PER_USER) {
        throw new UserFacingError(
          `Ya tienes ${pendingSnap.size} solicitudes en revisión. Espera a que el equipo las revise antes de enviar otra.`
        );
      }

      // 2) Escrituras
      const user = userSnap.data() as StoredUser;
      const transaction = buildBuyRequestTransaction(user, pkg, params);
      t.create(refRef, { transaction_id: transaction.id, user_id: user.id, created_at: transaction.timestamp });
      t.create(this.col('transactions').doc(transaction.id), clean(transaction));
      return transaction;
    });
  }

  async approvePayment(transactionId: string, adminUsername: string): Promise<Transaction> {
    if (!transactionId || transactionId.includes('/')) throw new UserFacingError('Transacción no válida.');
    const db = getDb();
    return db.runTransaction(async (t: any) => {
      const txRef = this.col('transactions').doc(transactionId);
      const txSnap = await t.get(txRef);
      if (!txSnap.exists) throw new UserFacingError(`Transacción ${transactionId} no encontrada.`, 404);
      const tx = txSnap.data() as Transaction;
      if (tx.tipo !== 'compra_coins') throw new UserFacingError('Solo se pueden aprobar solicitudes de recarga.');
      if (tx.estado !== 'pendiente') {
        throw new UserFacingError(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);
      }

      // Las monedas van al usuario que PAGÓ (no al administrador)
      const userRef = this.col('users').doc(tx.user_id);
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) throw new UserFacingError('El usuario de esta transacción ya no existe.');
      const user = userSnap.data() as StoredUser;

      const reviewed_at = new Date().toISOString();
      t.update(userRef, { cliccoins_balance: (user.cliccoins_balance || 0) + tx.cantidad_coins });
      t.update(txRef, { estado: 'completado', reviewed_at, reviewed_by: adminUsername });
      return { ...tx, estado: 'completado', reviewed_at, reviewed_by: adminUsername } as Transaction;
    });
  }

  async rejectPayment(transactionId: string, reason: string, adminUsername: string): Promise<Transaction> {
    if (!transactionId || transactionId.includes('/')) throw new UserFacingError('Transacción no válida.');
    const db = getDb();
    return db.runTransaction(async (t: any) => {
      const txRef = this.col('transactions').doc(transactionId);
      const txSnap = await t.get(txRef);
      if (!txSnap.exists) throw new UserFacingError(`Transacción ${transactionId} no encontrada.`, 404);
      const tx = txSnap.data() as Transaction;
      if (tx.tipo !== 'compra_coins') throw new UserFacingError('Solo se pueden rechazar solicitudes de recarga.');
      if (tx.estado !== 'pendiente') {
        throw new UserFacingError(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);
      }

      const reviewed_at = new Date().toISOString();
      t.update(txRef, { estado: 'rechazado', rejection_reason: reason, reviewed_at, reviewed_by: adminUsername });
      // Libera el comprobante para que el usuario pueda corregir y reenviar
      t.delete(this.col('payment_refs').doc(this.refKey(tx.metodo_pago, tx.referencia_pago)));
      return {
        ...tx,
        estado: 'rechazado',
        rejection_reason: reason,
        reviewed_at,
        reviewed_by: adminUsername,
      } as Transaction;
    });
  }

  // ------------------------------------------------------------------ Tienda
  async processShopPurchase(
    params: ShopPurchaseParams
  ): Promise<{ newBalance: number; transaction: Transaction; purchase: ShopPurchase }> {
    if (!Number.isInteger(params.costCoins) || params.costCoins <= 0) {
      throw new UserFacingError('El precio del artículo no es válido.');
    }
    const db = getDb();
    return db.runTransaction(async (t: any) => {
      const userRef = this.col('users').doc(params.userId);
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) throw new UserFacingError('Usuario no encontrado.', 404);
      const user = userSnap.data() as StoredUser;
      const balance = user.cliccoins_balance || 0;
      if (balance < params.costCoins) throw insufficientBalance(balance, params.costCoins);

      const newBalance = balance - params.costCoins;
      const { transaction, purchase } = buildShopRecords(user, params);
      t.update(userRef, { cliccoins_balance: newBalance });
      t.create(this.col('transactions').doc(transaction.id), clean(transaction));
      t.create(this.col('shop_purchases').doc(purchase.id), clean(purchase));
      return { newBalance, transaction, purchase };
    });
  }
}
