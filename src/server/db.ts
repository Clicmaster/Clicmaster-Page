import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export type TransactionTipo = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';
export type PaymentMetodo = 'Yappy' | 'PayPal' | 'Robux' | 'Sistema';
export type TransactionEstado = 'pendiente' | 'completado' | 'rechazado';
export type Moneda = 'USD' | 'ROBUX' | 'NINGUNA';

/** Usuario tal como se guarda (incluye la contraseña cifrada). Nunca se envía al navegador. */
export interface StoredUser {
  id: string;
  username: string;
  roblox_username: string;
  cliccoins_balance: number;
  role: 'user' | 'admin';
  avatar: string;
  created_at: string;
  password_hash?: string;
  password_salt?: string;
}

/** Usuario seguro para enviar al navegador (sin contraseña). */
export type PublicUser = Omit<StoredUser, 'password_hash' | 'password_salt'>;

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

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  transactions: Transaction[];
  shop_purchases: ShopPurchase[];
}

// La ubicación del archivo se puede cambiar con la variable DB_PATH
// (por ejemplo, para apuntar a un disco persistente en el hosting).
const DB_PATH = path.resolve(process.cwd(), process.env.DB_PATH || path.join('data', 'cliccoins_db.json'));

const DEFAULT_AVATAR = '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp';

// Máximo de solicitudes de recarga "en revisión" que puede tener un usuario a la vez
const MAX_PENDING_PER_USER = 3;

const PACKAGES: CoinPackage[] = [
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

// La base de datos arranca VACÍA: sin usuarios ni saldos de demostración.
const emptyData = (): DatabaseSchema => ({ users: {}, transactions: [], shop_purchases: [] });

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/** Normaliza una referencia de pago para detectar duplicados ("yp-123 " = "YP123"). */
function normalizeReference(ref: string): string {
  return ref.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function toPublicUser(user: StoredUser): PublicUser {
  const { password_hash: _h, password_salt: _s, ...publicUser } = user;
  return publicUser;
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_PATH)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        return {
          users: parsed.users || {},
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          shop_purchases: Array.isArray(parsed.shop_purchases) ? parsed.shop_purchases : [],
        };
      } catch (error) {
        // Si el archivo está dañado NO lo sobrescribimos: guardamos una copia y avisamos.
        const backup = `${DB_PATH}.corrupto-${Date.now()}`;
        try {
          fs.copyFileSync(DB_PATH, backup);
        } catch {
          // sin copia posible
        }
        console.error(`[CLICMaster] La base de datos está dañada. Copia guardada en ${backup}.`, error);
      }
    }

    const fresh = emptyData();
    this.data = fresh;
    try {
      this.save();
    } catch {
      // El error ya quedó registrado en la consola; el servidor sigue funcionando.
    }
    return this.data;
  }

  /**
   * Guarda de forma segura: primero escribe un archivo temporal y luego lo
   * renombra. Así, si el servidor se apaga a mitad, el archivo original no se daña.
   * Los errores se registran en la consola en vez de ocultarse.
   */
  private save(): void {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${DB_PATH}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_PATH);
    } catch (error) {
      console.error('[CLICMaster] ERROR al guardar la base de datos:', error);
      // Deshacemos el cambio en memoria volviendo a leer lo último guardado,
      // para que nunca se acrediten o descuenten monedas que no quedaron guardadas.
      try {
        if (fs.existsSync(DB_PATH)) {
          const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
          this.data = {
            users: parsed.users || {},
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
            shop_purchases: Array.isArray(parsed.shop_purchases) ? parsed.shop_purchases : [],
          };
        }
      } catch {
        // si tampoco se puede leer, se mantiene la memoria actual
      }
      throw new Error('No se pudo guardar la información. Intenta de nuevo en unos minutos.');
    }
  }

  // ------------------------------------------------------------------ Paquetes
  public getPackages(): CoinPackage[] {
    return PACKAGES;
  }

  public getPackage(packageId: string): CoinPackage | undefined {
    return PACKAGES.find((p) => p.id === packageId);
  }

  // ------------------------------------------------------------------ Usuarios
  public getPublicUser(userId: string): PublicUser | undefined {
    const user = this.data.users[userId];
    // Usuarios sin contraseña (de la demo anterior) no pueden usarse
    if (!user || !user.password_hash) return undefined;
    return toPublicUser(user);
  }

  public findUserByUsername(username: string): StoredUser | undefined {
    const wanted = username.trim().toLowerCase();
    return Object.values(this.data.users).find((u) => u.username.toLowerCase() === wanted);
  }

  public createUser(params: {
    username: string;
    robloxUsername: string;
    passwordHash: string;
    passwordSalt: string;
    role: 'user' | 'admin';
  }): PublicUser {
    if (this.findUserByUsername(params.username)) {
      throw new Error('Ese nombre de usuario ya está en uso.');
    }

    const user: StoredUser = {
      id: newId('usr'),
      username: params.username.trim(),
      roblox_username: params.robloxUsername.trim(),
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

  // ------------------------------------------------------------ Transacciones
  private sortNewestFirst(list: Transaction[]): Transaction[] {
    return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getUserTransactions(userId: string): Transaction[] {
    return this.sortNewestFirst(this.data.transactions.filter((t) => t.user_id === userId));
  }

  public getPendingTransactions(): Transaction[] {
    return this.sortNewestFirst(this.data.transactions.filter((t) => t.estado === 'pendiente'));
  }

  /** Solicitudes de recarga de todos los usuarios (para el panel de administración). */
  public getPurchaseRequests(limit = 300): Transaction[] {
    return this.sortNewestFirst(this.data.transactions.filter((t) => t.tipo === 'compra_coins')).slice(0, limit);
  }

  /**
   * Registra una solicitud de recarga. El servidor calcula las monedas y el precio
   * a partir del paquete: lo que mande el navegador sobre montos se ignora.
   * Siempre queda "pendiente" hasta que un administrador la apruebe.
   */
  public createBuyRequest(params: {
    userId: string;
    packageId: string;
    paymentMethod: 'Yappy' | 'Robux';
    paymentReference: string;
  }): Transaction {
    const user = this.data.users[params.userId];
    if (!user) throw new Error('Usuario no encontrado.');

    const pkg = this.getPackage(params.packageId);
    if (!pkg) throw new Error('El paquete seleccionado no existe.');

    const pendingCount = this.data.transactions.filter(
      (t) => t.user_id === user.id && t.estado === 'pendiente'
    ).length;
    if (pendingCount >= MAX_PENDING_PER_USER) {
      throw new Error(
        `Ya tienes ${pendingCount} solicitudes en revisión. Espera a que el equipo las revise antes de enviar otra.`
      );
    }

    const normalizedRef = normalizeReference(params.paymentReference);
    const duplicate = this.data.transactions.find(
      (t) =>
        t.metodo_pago === params.paymentMethod &&
        t.estado !== 'rechazado' &&
        normalizeReference(t.referencia_pago) === normalizedRef
    );
    if (duplicate) {
      throw new Error('Ese número de comprobante ya fue registrado anteriormente.');
    }

    const isRobux = params.paymentMethod === 'Robux';
    const totalCoins = pkg.coins + pkg.bonus;

    const transaction: Transaction = {
      id: newId('tx'),
      user_id: user.id,
      username: user.username,
      tipo: 'compra_coins',
      cantidad_coins: totalCoins,
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

    this.data.transactions.unshift(transaction);
    this.save();
    return transaction;
  }

  public approvePayment(transactionId: string, adminUsername: string): Transaction {
    const tx = this.data.transactions.find((t) => t.id === transactionId);
    if (!tx) throw new Error(`Transacción ${transactionId} no encontrada.`);
    if (tx.tipo !== 'compra_coins') throw new Error('Solo se pueden aprobar solicitudes de recarga.');
    if (tx.estado !== 'pendiente') throw new Error(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);

    // Las monedas van al usuario que PAGÓ (no al administrador que aprueba)
    const user = this.data.users[tx.user_id];
    if (!user) throw new Error(`El usuario de esta transacción ya no existe.`);

    user.cliccoins_balance += tx.cantidad_coins;
    tx.estado = 'completado';
    tx.reviewed_at = new Date().toISOString();
    tx.reviewed_by = adminUsername;

    this.save();
    return tx;
  }

  public rejectPayment(transactionId: string, reason: string, adminUsername: string): Transaction {
    const tx = this.data.transactions.find((t) => t.id === transactionId);
    if (!tx) throw new Error(`Transacción ${transactionId} no encontrada.`);
    if (tx.tipo !== 'compra_coins') throw new Error('Solo se pueden rechazar solicitudes de recarga.');
    if (tx.estado !== 'pendiente') throw new Error(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);

    tx.estado = 'rechazado';
    tx.rejection_reason = reason;
    tx.reviewed_at = new Date().toISOString();
    tx.reviewed_by = adminUsername;

    this.save();
    return tx;
  }

  // ------------------------------------------------------------------- Tienda
  public processShopPurchase(params: {
    userId: string;
    itemId: string;
    itemName: string;
    costCoins: number;
  }): { newBalance: number; transaction: Transaction; purchase: ShopPurchase } {
    const user = this.data.users[params.userId];
    if (!user) throw new Error('Usuario no encontrado.');

    if (!Number.isInteger(params.costCoins) || params.costCoins <= 0) {
      throw new Error('El precio del artículo no es válido.');
    }

    if (user.cliccoins_balance < params.costCoins) {
      throw new Error(
        `Saldo insuficiente. Tienes ${user.cliccoins_balance} ClicCoins y el artículo cuesta ${params.costCoins} ClicCoins.`
      );
    }

    user.cliccoins_balance -= params.costCoins;
    const now = new Date().toISOString();

    const transaction: Transaction = {
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
    };

    const purchase: ShopPurchase = {
      id: newId('sp'),
      user_id: user.id,
      username: user.username,
      item_id: params.itemId,
      item_name: params.itemName,
      cost_coins: params.costCoins,
      timestamp: now,
    };

    this.data.transactions.unshift(transaction);
    this.data.shop_purchases.unshift(purchase);
    this.save();

    return { newBalance: user.cliccoins_balance, transaction, purchase };
  }
}

export const db = new DatabaseService();
