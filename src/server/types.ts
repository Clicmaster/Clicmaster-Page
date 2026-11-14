// ============================================================================
// TIPOS Y REGLAS COMUNES DE LA ECONOMÍA CLICCOINS
// Los usan las dos formas de guardar datos: Firestore (producción) y el
// archivo JSON (solo para pruebas en tu computadora).
// ============================================================================
import crypto from 'node:crypto';

export type TransactionTipo = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';
export type PaymentMetodo = 'Yappy' | 'PayPal' | 'Robux' | 'Sistema';
export type TransactionEstado = 'pendiente' | 'completado' | 'rechazado';
export type Moneda = 'USD' | 'ROBUX' | 'NINGUNA';

/** Usuario tal como se guarda (incluye la contraseña cifrada). Nunca se envía al navegador. */
export interface StoredUser {
  id: string;
  username: string;
  username_lower?: string;
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
  /** Monto pagado. Se interpreta según "moneda" (dólares o Robux). */
  monto_dinero_real: number;
  moneda?: Moneda;
  metodo_pago: PaymentMetodo;
  estado: TransactionEstado;
  referencia_pago: string;
  package_id?: string;
  detalles?: string;
  timestamp: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export interface ShopPurchase {
  id: string;
  user_id: string;
  username: string;
  item_id: string;
  item_name: string;
  cost_coins: number;
  timestamp: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  priceUsd: number;
  priceRobux: number;
  name: string;
  tag?: string;
  popular?: boolean;
}

export interface BuyRequestParams {
  userId: string;
  packageId: string;
  paymentMethod: 'Yappy' | 'Robux';
  paymentReference: string;
}

export interface ShopPurchaseParams {
  userId: string;
  itemId: string;
  itemName: string;
  costCoins: number;
}

/** Operaciones que debe ofrecer cualquier forma de guardar datos. */
export interface DataStore {
  readonly kind: 'firestore' | 'archivo';
  getPublicUser(userId: string): Promise<PublicUser | undefined>;
  findUserByUsername(username: string): Promise<StoredUser | undefined>;
  createUser(params: {
    username: string;
    robloxUsername: string;
    passwordHash: string;
    passwordSalt: string;
    role: 'user' | 'admin';
  }): Promise<PublicUser>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  getPurchaseRequests(limit?: number): Promise<Transaction[]>;
  createBuyRequest(params: BuyRequestParams): Promise<Transaction>;
  approvePayment(transactionId: string, adminUsername: string): Promise<Transaction>;
  rejectPayment(transactionId: string, reason: string, adminUsername: string): Promise<Transaction>;
  processShopPurchase(
    params: ShopPurchaseParams
  ): Promise<{ newBalance: number; transaction: Transaction; purchase: ShopPurchase }>;
  /** Comprueba que la base de datos responde (para /api/health). */
  ping(): Promise<void>;
}

// ------------------------------------------------------------------ Reglas
export const DEFAULT_AVATAR = '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp';

/** Máximo de solicitudes de recarga "en revisión" que puede tener un usuario a la vez. */
export const MAX_PENDING_PER_USER = 3;

export const PACKAGES: CoinPackage[] = [
  { id: 'pack-100', coins: 100, bonus: 0, priceUsd: 1.99, priceRobux: 80, name: 'Pack Básico', tag: 'Iniciación' },
  {
    id: 'pack-500',
    coins: 500,
    bonus: 50,
    priceUsd: 7.99,
    priceRobux: 350,
    name: 'Pack Ciudadano',
    tag: 'Popular',
    popular: true,
  },
  { id: 'pack-1000', coins: 1000, bonus: 150, priceUsd: 14.99, priceRobux: 650, name: 'Pack Élite', tag: 'Recomendado' },
  { id: 'pack-2500', coins: 2500, bonus: 500, priceUsd: 29.99, priceRobux: 1400, name: 'Pack Magnate', tag: 'Gran Ahorro' },
  { id: 'pack-5000', coins: 5000, bonus: 1250, priceUsd: 49.99, priceRobux: 2500, name: 'Pack Imperio', tag: 'VIP Máximo' },
];

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

export function toPublicUser(user: StoredUser): PublicUser {
  const { password_hash: _h, password_salt: _s, username_lower: _l, ...publicUser } = user;
  return publicUser;
}

export function sortNewestFirst<T extends { timestamp: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Arma la transacción de una solicitud de recarga (precio y monedas según el paquete). */
export function buildBuyRequestTransaction(user: StoredUser, pkg: CoinPackage, params: BuyRequestParams): Transaction {
  const isRobux = params.paymentMethod === 'Robux';
  return {
    id: newId('tx'),
    user_id: user.id,
    username: user.username,
    tipo: 'compra_coins',
    cantidad_coins: pkg.coins + pkg.bonus,
    monto_dinero_real: isRobux ? pkg.priceRobux : pkg.priceUsd,
    moneda: isRobux ? 'ROBUX' : 'USD',
    metodo_pago: params.paymentMethod,
    estado: 'pendiente',
    referencia_pago: params.paymentReference,
    package_id: pkg.id,
    detalles: isRobux
      ? `${pkg.name}: ${pkg.priceRobux} Robux por Gamepass (Roblox @${user.roblox_username})`
      : `${pkg.name}: $${pkg.priceUsd} USD por Yappy`,
    timestamp: new Date().toISOString(),
  };
}

/** Arma los registros de una compra en la tienda. */
export function buildShopRecords(user: StoredUser, params: ShopPurchaseParams): {
  transaction: Transaction;
  purchase: ShopPurchase;
} {
  const now = new Date().toISOString();
  return {
    transaction: {
      id: newId('tx'),
      user_id: user.id,
      username: user.username,
      tipo: 'gasto_tienda',
      cantidad_coins: params.costCoins,
      monto_dinero_real: 0,
      moneda: 'NINGUNA',
      metodo_pago: 'Sistema',
      estado: 'completado',
      referencia_pago: `SHOP-${params.itemId.toUpperCase()}`,
      detalles: `Compra en tienda: ${params.itemName}`,
      timestamp: now,
      reviewed_at: now,
      reviewed_by: 'Sistema_Tienda_RP',
    },
    purchase: {
      id: newId('sp'),
      user_id: user.id,
      username: user.username,
      item_id: params.itemId,
      item_name: params.itemName,
      cost_coins: params.costCoins,
      timestamp: now,
    },
  };
}

export function insufficientBalance(balance: number, cost: number): UserFacingError {
  return new UserFacingError(`Saldo insuficiente. Tienes ${balance} ClicCoins y el artículo cuesta ${cost} ClicCoins.`);
}
