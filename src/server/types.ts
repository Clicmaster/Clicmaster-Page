// ============================================================================
// TIPOS Y REGLAS COMUNES DE LA ECONOMÍA CLICCOINS
// Los usan las dos formas de guardar datos: Firestore (producción) y el
// archivo JSON (solo para pruebas en tu computadora).
//
// Cómo funciona ClicCoins:
//   1) RECARGAR: el usuario paga por Yappy o PayPal y envía su comprobante.
//      Queda "pendiente" hasta que un administrador lo verifica y lo aprueba.
//   2) COMPRAR: todo en la página se paga SOLO con ClicCoins. Cada compra
//      crea un PEDIDO que el staff entrega (en Roblox o por envío físico)
//      y marca como "entregado". Si no se puede entregar, se cancela y
//      las ClicCoins se devuelven automáticamente.
// ============================================================================
import crypto from 'node:crypto';
import { PACKAGES, type CoinPackage } from '../data/coinPackages.js';
import type { CatalogItemType, CoinShopEntry } from '../data/coinShopCatalog.js';
import type { PaymentSettings } from '../data/paymentSettings.js';

export { PACKAGES };
export type { CoinPackage, PaymentSettings };

export type TransactionTipo = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';
/** "Robux" solo existe por registros antiguos; ya no se aceptan recargas con Robux. */
export type PaymentMetodo = 'Yappy' | 'PayPal' | 'Robux' | 'Sistema';
export type RechargeMethod = 'Yappy' | 'PayPal';
export type TransactionEstado = 'pendiente' | 'completado' | 'rechazado';
export type Moneda = 'USD' | 'ROBUX' | 'NINGUNA';

/** Usuario tal como se guarda (incluye la contraseña cifrada). Nunca se envía al navegador. */
export interface StoredUser {
  id: string;
  username: string;
  username_lower?: string;
  email?: string;
  roblox_username: string;
  cliccoins_balance: number;
  role: 'user' | 'admin';
  avatar: string;
  created_at: string;
  password_hash?: string;
  password_salt?: string;
}

/** Usuario seguro para enviar al navegador (sin contraseña). */
export type PublicUser = Omit<StoredUser, 'password_hash' | 'password_salt' | 'username_lower'>;

export interface Transaction {
  id: string;
  user_id: string;
  username: string;
  tipo: TransactionTipo;
  cantidad_coins: number;
  /** Monto pagado. Se interpreta según "moneda". */
  monto_dinero_real: number;
  moneda?: Moneda;
  metodo_pago: PaymentMetodo;
  estado: TransactionEstado;
  referencia_pago: string;
  package_id?: string;
  order_id?: string;
  detalles?: string;
  timestamp: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export type OrderEstado = 'pendiente_entrega' | 'entregado' | 'cancelado';

export interface ShippingInfo {
  nombre: string;
  pais: string;
  direccion: string;
  telefono: string;
}

/** Pedido: se crea con cada compra en la tienda y el staff lo entrega. */
export interface Order {
  id: string;
  user_id: string;
  username: string;
  roblox_username: string;
  email?: string;
  item_id: string;
  item_name: string;
  item_type: CatalogItemType;
  cost_coins: number;
  estado: OrderEstado;
  opciones?: { talla?: string; color?: string };
  envio?: ShippingInfo;
  transaction_id: string;
  timestamp: string;
  entregado_at?: string;
  entregado_por?: string;
  nota_entrega?: string;
  cancelado_at?: string;
  cancelado_por?: string;
  motivo_cancelacion?: string;
}

export interface BuyRequestParams {
  userId: string;
  packageId: string;
  paymentMethod: RechargeMethod;
  paymentReference: string;
}

export interface ShopPurchaseParams {
  userId: string;
  item: CoinShopEntry;
  opciones?: { talla?: string; color?: string };
  envio?: ShippingInfo;
}

export interface NewUserParams {
  username: string;
  email: string;
  robloxUsername: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'user' | 'admin';
}

/** Operaciones que debe ofrecer cualquier forma de guardar datos. */
export interface DataStore {
  readonly kind: 'firestore' | 'archivo';
  ping(): Promise<void>;

  // Usuarios
  getPublicUser(userId: string): Promise<PublicUser | undefined>;
  findUserByUsername(username: string): Promise<StoredUser | undefined>;
  findUserByEmail(email: string): Promise<StoredUser | undefined>;
  createUser(params: NewUserParams): Promise<PublicUser>;

  // Recargas
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  getPurchaseRequests(limit?: number): Promise<Transaction[]>;
  createBuyRequest(params: BuyRequestParams): Promise<Transaction>;
  approvePayment(transactionId: string, adminUsername: string): Promise<Transaction>;
  rejectPayment(transactionId: string, reason: string, adminUsername: string): Promise<Transaction>;

  // Tienda y pedidos
  processShopPurchase(params: ShopPurchaseParams): Promise<{ newBalance: number; transaction: Transaction; order: Order }>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrders(limit?: number): Promise<Order[]>;
  markOrderDelivered(orderId: string, adminUsername: string, note: string): Promise<Order>;
  cancelOrder(orderId: string, adminUsername: string, reason: string): Promise<{ order: Order; refund: Transaction }>;

  // Ajustes de pago
  getPaymentSettings(): Promise<PaymentSettings>;
  savePaymentSettings(settings: PaymentSettings, adminUsername: string): Promise<PaymentSettings>;
}

// ------------------------------------------------------------------ Reglas
export const DEFAULT_AVATAR = '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp';

/** Máximo de solicitudes de recarga "en revisión" que puede tener un usuario a la vez. */
export const MAX_PENDING_PER_USER = 3;

export function getPackage(packageId: string): CoinPackage | undefined {
  return PACKAGES.find((p) => p.id === packageId);
}

/** Error con mensaje apto para mostrar al usuario. */
export class UserFacingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/** Normaliza una referencia de pago para detectar duplicados ("yp-123 " = "YP123"). */
export function normalizeReference(ref: string): string {
  return ref.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: StoredUser): PublicUser {
  const { password_hash: _h, password_salt: _s, username_lower: _l, ...publicUser } = user;
  return publicUser;
}

export function sortNewestFirst<T extends { timestamp: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Arma la transacción de una solicitud de recarga (precio y monedas según el paquete). */
export function buildBuyRequestTransaction(user: StoredUser, pkg: CoinPackage, params: BuyRequestParams): Transaction {
  return {
    id: newId('tx'),
    user_id: user.id,
    username: user.username,
    tipo: 'compra_coins',
    cantidad_coins: pkg.coins + pkg.bonus,
    monto_dinero_real: pkg.priceUsd,
    moneda: 'USD',
    metodo_pago: params.paymentMethod,
    estado: 'pendiente',
    referencia_pago: params.paymentReference,
    package_id: pkg.id,
    detalles: `${pkg.name}: $${pkg.priceUsd} USD por ${params.paymentMethod}`,
    timestamp: new Date().toISOString(),
  };
}

/** Arma el movimiento de saldo y el pedido de una compra en la tienda. */
export function buildShopRecords(user: StoredUser, params: ShopPurchaseParams): { transaction: Transaction; order: Order } {
  const now = new Date().toISOString();
  const orderId = newId('ped');
  const transaction: Transaction = {
    id: newId('tx'),
    user_id: user.id,
    username: user.username,
    tipo: 'gasto_tienda',
    cantidad_coins: params.item.costCoins,
    monto_dinero_real: 0,
    moneda: 'NINGUNA',
    metodo_pago: 'Sistema',
    estado: 'completado',
    referencia_pago: orderId,
    order_id: orderId,
    detalles: `Compra en tienda: ${params.item.name}`,
    timestamp: now,
    reviewed_at: now,
    reviewed_by: 'Sistema_Tienda',
  };
  const order: Order = {
    id: orderId,
    user_id: user.id,
    username: user.username,
    roblox_username: user.roblox_username,
    email: user.email,
    item_id: params.item.id,
    item_name: params.item.name,
    item_type: params.item.type,
    cost_coins: params.item.costCoins,
    estado: 'pendiente_entrega',
    opciones: params.opciones,
    envio: params.envio,
    transaction_id: transaction.id,
    timestamp: now,
  };
  return { transaction, order };
}

/** Arma el movimiento de devolución cuando se cancela un pedido. */
export function buildRefundTransaction(order: Order, adminUsername: string, reason: string): Transaction {
  const now = new Date().toISOString();
  return {
    id: newId('tx'),
    user_id: order.user_id,
    username: order.username,
    tipo: 'reembolso',
    cantidad_coins: order.cost_coins,
    monto_dinero_real: 0,
    moneda: 'NINGUNA',
    metodo_pago: 'Sistema',
    estado: 'completado',
    referencia_pago: order.id,
    order_id: order.id,
    detalles: `Devolución por pedido cancelado: ${order.item_name}. Motivo: ${reason}`,
    timestamp: now,
    reviewed_at: now,
    reviewed_by: adminUsername,
  };
}

export function insufficientBalance(balance: number, cost: number): UserFacingError {
  return new UserFacingError(`Saldo insuficiente. Tienes ${balance} ClicCoins y el artículo cuesta ${cost} ClicCoins.`);
}

/** Comprueba que un pedido se pueda marcar como entregado o cancelar. */
export function assertOrderPending(order: Order | undefined, orderId: string): asserts order is Order {
  if (!order) throw new UserFacingError(`Pedido ${orderId} no encontrado.`, 404);
  if (order.estado !== 'pendiente_entrega') {
    const estado = order.estado === 'entregado' ? 'entregado' : 'cancelado';
    throw new UserFacingError(`El pedido ${orderId} ya está ${estado}.`);
  }
}
