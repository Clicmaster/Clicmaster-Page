// ============================================================================
// ALMACÉN EN ARCHIVO JSON — SOLO PARA PRUEBAS EN TU COMPUTADORA
// En Vercel se usa Firestore (ver firestoreStore.ts). Este archivo permite
// probar la página localmente sin conectarse a Firebase.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
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

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  transactions: Transaction[];
  orders: Order[];
  payment_settings: PaymentSettings;
}

const emptyData = (): DatabaseSchema => ({
  users: {},
  transactions: [],
  orders: [],
  payment_settings: structuredClone(DEFAULT_PAYMENT_SETTINGS),
});

function parse(raw: string): DatabaseSchema {
  const parsed = JSON.parse(raw);
  return {
    users: parsed.users || {},
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    payment_settings: parsed.payment_settings || structuredClone(DEFAULT_PAYMENT_SETTINGS),
  };
}

export class JsonFileStore implements DataStore {
  readonly kind = 'archivo' as const;
  private data: DatabaseSchema = emptyData();
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  private load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        this.data = parse(fs.readFileSync(this.filePath, 'utf-8'));
        return;
      } catch (error) {
        const backup = `${this.filePath}.corrupto-${Date.now()}`;
        try {
          fs.copyFileSync(this.filePath, backup);
        } catch {
          // sin copia posible
        }
        console.error(`[CLICMaster] La base de datos local está dañada. Copia guardada en ${backup}.`, error);
      }
    }
    this.data = emptyData();
    try {
      this.save();
    } catch {
      // ya registrado
    }
  }

  /** Escritura atómica: archivo temporal + renombrar. Si falla, se deshace en memoria. */
  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmp, this.filePath);
    } catch (error) {
      console.error('[CLICMaster] ERROR al guardar la base de datos local:', error);
      try {
        if (fs.existsSync(this.filePath)) this.data = parse(fs.readFileSync(this.filePath, 'utf-8'));
      } catch {
        // se mantiene la memoria actual
      }
      throw new UserFacingError('No se pudo guardar la información. Intenta de nuevo en unos minutos.', 503);
    }
  }

  async ping(): Promise<void> {
    // siempre disponible
  }

  // ---------------------------------------------------------------- Usuarios
  async getPublicUser(userId: string): Promise<PublicUser | undefined> {
    const user = this.data.users[userId];
    if (!user || !user.password_hash) return undefined;
    return toPublicUser(user);
  }

  async findUserByUsername(username: string): Promise<StoredUser | undefined> {
    const wanted = username.trim().toLowerCase();
    return Object.values(this.data.users).find((u) => u.username.toLowerCase() === wanted);
  }

  async findUserByEmail(email: string): Promise<StoredUser | undefined> {
    const wanted = normalizeEmail(email);
    return Object.values(this.data.users).find((u) => u.email && normalizeEmail(u.email) === wanted);
  }

  async createUser(params: NewUserParams): Promise<PublicUser> {
    if (await this.findUserByUsername(params.username)) {
      throw new UserFacingError('Ese nombre de usuario ya está en uso.');
    }
    if (await this.findUserByEmail(params.email)) {
      throw new UserFacingError('Ya existe una cuenta con ese correo.');
    }
    const user: StoredUser = {
      id: newId('usr'),
      username: params.username,
      username_lower: params.username.toLowerCase(),
      email: normalizeEmail(params.email),
      roblox_username: params.robloxUsername,
      cliccoins_balance: 0,
      role: params.role,
      avatar: DEFAULT_AVATAR,
      created_at: new Date().toISOString(),
      password_hash: params.passwordHash,
      password_salt: params.passwordSalt,
    };
    this.data.users[user.id] = user;
    this.save();
    return toPublicUser(user);
  }

  // ---------------------------------------------------------------- Recargas
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return sortNewestFirst(this.data.transactions.filter((t) => t.user_id === userId)).slice(0, 200);
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return sortNewestFirst(this.data.transactions.filter((t) => t.estado === 'pendiente'));
  }

  async getPurchaseRequests(limit = 300): Promise<Transaction[]> {
    return sortNewestFirst(this.data.transactions.filter((t) => t.tipo === 'compra_coins')).slice(0, limit);
  }

  async createBuyRequest(params: BuyRequestParams): Promise<Transaction> {
    const user = this.data.users[params.userId];
    if (!user) throw new UserFacingError('Usuario no encontrado.', 404);

    const pkg = getPackage(params.packageId);
    if (!pkg) throw new UserFacingError('El paquete seleccionado no existe.');

    const pendingCount = this.data.transactions.filter(
      (t) => t.user_id === user.id && t.estado === 'pendiente'
    ).length;
    if (pendingCount >= MAX_PENDING_PER_USER) {
      throw new UserFacingError(
        `Ya tienes ${pendingCount} solicitudes en revisión. Espera a que el equipo las revise antes de enviar otra.`
      );
    }

    const normalizedRef = normalizeReference(params.paymentReference);
    const duplicate = this.data.transactions.find(
      (t) =>
        t.tipo === 'compra_coins' &&
        t.metodo_pago === params.paymentMethod &&
        t.estado !== 'rechazado' &&
        normalizeReference(t.referencia_pago) === normalizedRef
    );
    if (duplicate) throw new UserFacingError('Ese número de comprobante ya fue registrado anteriormente.');

    const transaction = buildBuyRequestTransaction(user, pkg, params);
    this.data.transactions.unshift(transaction);
    this.save();
    return transaction;
  }

  async approvePayment(transactionId: string, adminUsername: string): Promise<Transaction> {
    const tx = this.data.transactions.find((t) => t.id === transactionId);
    if (!tx) throw new UserFacingError(`Transacción ${transactionId} no encontrada.`, 404);
    if (tx.tipo !== 'compra_coins') throw new UserFacingError('Solo se pueden aprobar solicitudes de recarga.');
    if (tx.estado !== 'pendiente') {
      throw new UserFacingError(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);
    }
    const user = this.data.users[tx.user_id];
    if (!user) throw new UserFacingError('El usuario de esta transacción ya no existe.');

    user.cliccoins_balance += tx.cantidad_coins;
    tx.estado = 'completado';
    tx.reviewed_at = new Date().toISOString();
    tx.reviewed_by = adminUsername;
    this.save();
    return tx;
  }

  async rejectPayment(transactionId: string, reason: string, adminUsername: string): Promise<Transaction> {
    const tx = this.data.transactions.find((t) => t.id === transactionId);
    if (!tx) throw new UserFacingError(`Transacción ${transactionId} no encontrada.`, 404);
    if (tx.tipo !== 'compra_coins') throw new UserFacingError('Solo se pueden rechazar solicitudes de recarga.');
    if (tx.estado !== 'pendiente') {
      throw new UserFacingError(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);
    }
    tx.estado = 'rechazado';
    tx.rejection_reason = reason;
    tx.reviewed_at = new Date().toISOString();
    tx.reviewed_by = adminUsername;
    this.save();
    return tx;
  }

  // ------------------------------------------------------- Tienda y pedidos
  async processShopPurchase(
    params: ShopPurchaseParams
  ): Promise<{ newBalance: number; transaction: Transaction; order: Order }> {
    const user = this.data.users[params.userId];
    if (!user) throw new UserFacingError('Usuario no encontrado.', 404);
    const cost = params.item.costCoins;
    if (!Number.isInteger(cost) || cost <= 0) throw new UserFacingError('El precio del artículo no es válido.');
    if (user.cliccoins_balance < cost) throw insufficientBalance(user.cliccoins_balance, cost);

    user.cliccoins_balance -= cost;
    const { transaction, order } = buildShopRecords(user, params);
    this.data.transactions.unshift(transaction);
    this.data.orders.unshift(order);
    this.save();
    return { newBalance: user.cliccoins_balance, transaction, order };
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return sortNewestFirst(this.data.orders.filter((o) => o.user_id === userId)).slice(0, 200);
  }

  async getOrders(limit = 300): Promise<Order[]> {
    return sortNewestFirst(this.data.orders).slice(0, limit);
  }

  async markOrderDelivered(orderId: string, adminUsername: string, note: string): Promise<Order> {
    const order = this.data.orders.find((o) => o.id === orderId);
    assertOrderPending(order, orderId);
    order.estado = 'entregado';
    order.entregado_at = new Date().toISOString();
    order.entregado_por = adminUsername;
    if (note) order.nota_entrega = note;
    this.save();
    return order;
  }

  async cancelOrder(orderId: string, adminUsername: string, reason: string): Promise<{ order: Order; refund: Transaction }> {
    const order = this.data.orders.find((o) => o.id === orderId);
    assertOrderPending(order, orderId);
    const user = this.data.users[order.user_id];
    if (!user) throw new UserFacingError('El usuario de este pedido ya no existe.');

    const refund = buildRefundTransaction(order, adminUsername, reason);
    user.cliccoins_balance += order.cost_coins;
    order.estado = 'cancelado';
    order.cancelado_at = refund.timestamp;
    order.cancelado_por = adminUsername;
    order.motivo_cancelacion = reason;
    this.data.transactions.unshift(refund);
    this.save();
    return { order, refund };
  }

  // ---------------------------------------------------------- Ajustes de pago
  async getPaymentSettings(): Promise<PaymentSettings> {
    return structuredClone(this.data.payment_settings);
  }

  async savePaymentSettings(settings: PaymentSettings, adminUsername: string): Promise<PaymentSettings> {
    this.data.payment_settings = { ...settings, updated_at: new Date().toISOString(), updated_by: adminUsername };
    this.save();
    return structuredClone(this.data.payment_settings);
  }
}
