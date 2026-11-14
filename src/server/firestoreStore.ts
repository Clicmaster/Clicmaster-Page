// ============================================================================
// BASE DE DATOS REAL: FIRESTORE (Firebase)
// Se usa en Vercel. La conexión usa la clave de servidor guardada en la
// variable FIREBASE_SERVICE_ACCOUNT (nunca se envía a la página).
//
// Colecciones (en producción; en las versiones de prueba llevan "preview_" delante):
//   cm_users          → cuentas (saldo, rol, correo, contraseña cifrada)
//   cm_usernames      → reserva de nombres de usuario (evita duplicados)
//   cm_emails         → reserva de correos (evita duplicados)
//   cm_transactions   → recargas, compras, devoluciones (historial de saldo)
//   cm_payment_refs   → comprobantes ya usados (evita cobrar dos veces el mismo)
//   cm_orders         → pedidos de la tienda (pendiente de entrega / entregado / cancelado)
//   cm_settings       → ajustes de pago (datos de Yappy y PayPal)
//
// Todo cambio de saldo ocurre dentro de una transacción de Firestore: si dos
// operaciones llegan al mismo tiempo, Firestore las ordena y nunca se pierde
// ni se duplica una moneda.
// ============================================================================
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DEFAULT_PAYMENT_SETTINGS } from '../data/paymentSettings.js';
import {
  BuyRequestParams,
  DataStore,
  DEFAULT_AVATAR,
  MAX_PENDING_PER_USER,
  NewUserParams,
  Order,
  PaymentSettings,
  PublicUser,
  ShopPurchaseParams,
  StoredUser,
  Transaction,
  UserFacingError,
  assertOrderPending,
  buildBuyRequestTransaction,
  buildRefundTransaction,
  buildShopRecords,
  getPackage,
  insufficientBalance,
  newId,
  normalizeEmail,
  normalizeReference,
  sortNewestFirst,
  toPublicUser,
} from './types.js';

type CollectionName =
  | 'users'
  | 'usernames'
  | 'emails'
  | 'transactions'
  | 'payment_refs'
  | 'orders'
  | 'settings';

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

/** Evita IDs que Firestore no acepta o que podrían salirse de la colección. */
function safeId(id: string): boolean {
  return !!id && !id.includes('/') && id !== '.' && id !== '..' && id.length <= 200;
}

export class FirestoreStore implements DataStore {
  readonly kind = 'firestore' as const;
  private readonly prefix = collectionPrefix();

  private col(name: CollectionName) {
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
    if (!safeId(userId)) return undefined;
    const snap = await this.col('users').doc(userId).get();
    if (!snap.exists) return undefined;
    const user = snap.data() as StoredUser;
    if (!user.password_hash) return undefined;
    return toPublicUser(user);
  }

  private async userFromIndex(index: 'usernames' | 'emails', key: string): Promise<StoredUser | undefined> {
    if (!safeId(key)) return undefined;
    const indexSnap = await this.col(index).doc(key).get();
    if (!indexSnap.exists) return undefined;
    const userId = indexSnap.data()?.user_id;
    if (!userId) return undefined;
    const userSnap = await this.col('users').doc(userId).get();
    return userSnap.exists ? (userSnap.data() as StoredUser) : undefined;
  }

  async findUserByUsername(username: string): Promise<StoredUser | undefined> {
    return this.userFromIndex('usernames', username.trim().toLowerCase());
  }

  async findUserByEmail(email: string): Promise<StoredUser | undefined> {
    return this.userFromIndex('emails', normalizeEmail(email));
  }

  async createUser(params: NewUserParams): Promise<PublicUser> {
    const lower = params.username.toLowerCase();
    const email = normalizeEmail(params.email);
    if (!safeId(lower) || !safeId(email)) throw new UserFacingError('Usuario o correo no válido.');

    const user: StoredUser = {
      id: newId('usr'),
      username: params.username,
      username_lower: lower,
      email,
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
      const emailRef = this.col('emails').doc(email);
      const [nameSnap, emailSnap] = await Promise.all([t.get(nameRef), t.get(emailRef)]);
      if (nameSnap.exists) throw new UserFacingError('Ese nombre de usuario ya está en uso.');
      if (emailSnap.exists) throw new UserFacingError('Ya existe una cuenta con ese correo.');
      t.create(nameRef, { user_id: user.id, created_at: user.created_at });
      t.create(emailRef, { user_id: user.id, created_at: user.created_at });
      t.create(this.col('users').doc(user.id), clean(user));
    });

    return toPublicUser(user);
  }

  // ---------------------------------------------------------------- Recargas
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
    if (!safeId(params.userId)) throw new UserFacingError('Usuario no encontrado.', 404);

    return getDb().runTransaction(async (t: any) => {
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
    if (!safeId(transactionId)) throw new UserFacingError('Transacción no válida.');
    return getDb().runTransaction(async (t: any) => {
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
    if (!safeId(transactionId)) throw new UserFacingError('Transacción no válida.');
    return getDb().runTransaction(async (t: any) => {
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
      return { ...tx, estado: 'rechazado', rejection_reason: reason, reviewed_at, reviewed_by: adminUsername } as Transaction;
    });
  }

  // ------------------------------------------------------- Tienda y pedidos
  async processShopPurchase(
    params: ShopPurchaseParams
  ): Promise<{ newBalance: number; transaction: Transaction; order: Order }> {
    const cost = params.item.costCoins;
    if (!Number.isInteger(cost) || cost <= 0) throw new UserFacingError('El precio del artículo no es válido.');
    if (!safeId(params.userId)) throw new UserFacingError('Usuario no encontrado.', 404);

    return getDb().runTransaction(async (t: any) => {
      const userRef = this.col('users').doc(params.userId);
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) throw new UserFacingError('Usuario no encontrado.', 404);
      const user = userSnap.data() as StoredUser;
      const balance = user.cliccoins_balance || 0;
      if (balance < cost) throw insufficientBalance(balance, cost);

      const newBalance = balance - cost;
      const { transaction, order } = buildShopRecords(user, params);
      t.update(userRef, { cliccoins_balance: newBalance });
      t.create(this.col('transactions').doc(transaction.id), clean(transaction));
      t.create(this.col('orders').doc(order.id), clean(order));
      return { newBalance, transaction, order };
    });
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const snap = await this.col('orders').where('user_id', '==', userId).limit(500).get();
    return sortNewestFirst<Order>(snap.docs.map((d: any) => d.data() as Order)).slice(0, 200);
  }

  async getOrders(limit = 300): Promise<Order[]> {
    const snap = await this.col('orders').orderBy('timestamp', 'desc').limit(limit).get();
    return snap.docs.map((d: any) => d.data() as Order);
  }

  async markOrderDelivered(orderId: string, adminUsername: string, note: string): Promise<Order> {
    if (!safeId(orderId)) throw new UserFacingError('Pedido no válido.');
    return getDb().runTransaction(async (t: any) => {
      const ref = this.col('orders').doc(orderId);
      const snap = await t.get(ref);
      const order = snap.exists ? (snap.data() as Order) : undefined;
      assertOrderPending(order, orderId);
      const update = clean({
        estado: 'entregado' as const,
        entregado_at: new Date().toISOString(),
        entregado_por: adminUsername,
        nota_entrega: note || undefined,
      });
      t.update(ref, update);
      return { ...order, ...update } as Order;
    });
  }

  async cancelOrder(orderId: string, adminUsername: string, reason: string): Promise<{ order: Order; refund: Transaction }> {
    if (!safeId(orderId)) throw new UserFacingError('Pedido no válido.');
    return getDb().runTransaction(async (t: any) => {
      const ref = this.col('orders').doc(orderId);
      const snap = await t.get(ref);
      const order = snap.exists ? (snap.data() as Order) : undefined;
      assertOrderPending(order, orderId);

      const userRef = this.col('users').doc(order.user_id);
      const userSnap = await t.get(userRef);
      if (!userSnap.exists) throw new UserFacingError('El usuario de este pedido ya no existe.');
      const user = userSnap.data() as StoredUser;

      // Devolver las ClicCoins y registrar la devolución en el historial
      const refund = buildRefundTransaction(order, adminUsername, reason);
      const update = {
        estado: 'cancelado' as const,
        cancelado_at: refund.timestamp,
        cancelado_por: adminUsername,
        motivo_cancelacion: reason,
      };
      t.update(userRef, { cliccoins_balance: (user.cliccoins_balance || 0) + order.cost_coins });
      t.update(ref, update);
      t.create(this.col('transactions').doc(refund.id), clean(refund));
      return { order: { ...order, ...update } as Order, refund };
    });
  }

  // ---------------------------------------------------------- Ajustes de pago
  async getPaymentSettings(): Promise<PaymentSettings> {
    const snap = await this.col('settings').doc('payments').get();
    if (!snap.exists) return structuredClone(DEFAULT_PAYMENT_SETTINGS);
    const data = snap.data() as Partial<PaymentSettings>;
    return {
      yappy: { ...DEFAULT_PAYMENT_SETTINGS.yappy, ...(data.yappy || {}) },
      paypal: { ...DEFAULT_PAYMENT_SETTINGS.paypal, ...(data.paypal || {}) },
      updated_at: data.updated_at,
      updated_by: data.updated_by,
    };
  }

  async savePaymentSettings(settings: PaymentSettings, adminUsername: string): Promise<PaymentSettings> {
    const toSave: PaymentSettings = {
      yappy: settings.yappy,
      paypal: settings.paypal,
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    };
    await this.col('settings').doc('payments').set(toSave);
    return toSave;
  }
}
