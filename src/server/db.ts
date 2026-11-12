import fs from 'node:fs';
import path from 'node:path';

export type TransactionTipo = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';
export type PaymentMetodo = 'Yappy' | 'PayPal' | 'Robux' | 'Sistema';
export type TransactionEstado = 'pendiente' | 'completado' | 'rechazado';

export interface User {
  id: string;
  username: string;
  roblox_username: string;
  cliccoins_balance: number;
  role: 'user' | 'admin';
  avatar: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  username: string;
  tipo: TransactionTipo;
  cantidad_coins: number;
  monto_dinero_real: number;
  metodo_pago: PaymentMetodo;
  estado: TransactionEstado;
  referencia_pago: string;
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
  users: Record<string, User>;
  transactions: Transaction[];
  shop_purchases: ShopPurchase[];
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'cliccoins_db.json');

const INITIAL_PACKAGES: CoinPackage[] = [
  {
    id: 'pack-100',
    coins: 100,
    bonus: 0,
    priceUsd: 1.99,
    priceRobux: 80,
    name: 'Pack Básico',
    tag: 'Iniciación',
  },
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
  {
    id: 'pack-1000',
    coins: 1000,
    bonus: 150,
    priceUsd: 14.99,
    priceRobux: 650,
    name: 'Pack Élite',
    tag: 'Recomendado',
  },
  {
    id: 'pack-2500',
    coins: 2500,
    bonus: 500,
    priceUsd: 29.99,
    priceRobux: 1400,
    name: 'Pack Magnate',
    tag: 'Gran Ahorro',
  },
  {
    id: 'pack-5000',
    coins: 5000,
    bonus: 1250,
    priceUsd: 49.99,
    priceRobux: 2500,
    name: 'Pack Imperio',
    tag: 'VIP Máximo',
  },
];

const INITIAL_DATA: DatabaseSchema = {
  users: {
    'usr-carlos-01': {
      id: 'usr-carlos-01',
      username: 'Carlos_RP',
      roblox_username: 'Rodriguez_Capo',
      cliccoins_balance: 1250,
      role: 'admin',
      avatar: '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    'usr-valentina-02': {
      id: 'usr-valentina-02',
      username: 'Doc_Valentina',
      roblox_username: 'Valentina_SAMUR',
      cliccoins_balance: 350,
      role: 'user',
      avatar: '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    'usr-pilot-03': {
      id: 'usr-pilot-03',
      username: 'PilotSky_RP',
      roblox_username: 'AeroPilot_Latam',
      cliccoins_balance: 100,
      role: 'user',
      avatar: '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  },
  transactions: [
    {
      id: 'tx_init_01',
      user_id: 'usr-carlos-01',
      username: 'Carlos_RP',
      tipo: 'bonificacion',
      cantidad_coins: 500,
      monto_dinero_real: 0,
      metodo_pago: 'Sistema',
      estado: 'completado',
      referencia_pago: 'BONUS_BIENVENIDA_2026',
      detalles: 'Bono de bienvenida de temporada CLICMaster 2026',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'tx_init_02',
      user_id: 'usr-carlos-01',
      username: 'Carlos_RP',
      tipo: 'compra_coins',
      cantidad_coins: 1000,
      monto_dinero_real: 14.99,
      metodo_pago: 'PayPal',
      estado: 'completado',
      referencia_pago: 'PAYPAL-ORD-8829104-CAPTURED',
      detalles: 'Compra instantánea Pack Élite (1,000 Coins + 150 Bonus)',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'tx_init_03',
      user_id: 'usr-carlos-01',
      username: 'Carlos_RP',
      tipo: 'gasto_tienda',
      cantidad_coins: 250,
      monto_dinero_real: 0,
      metodo_pago: 'Sistema',
      estado: 'completado',
      referencia_pago: 'PURCHASE-UNIFORME-RPD',
      detalles: 'Compra de Uniforme Táctico Policía (RPD)',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    // Transacciones pendientes iniciales para demostración del Panel Admin
    {
      id: 'tx_pend_01',
      user_id: 'usr-valentina-02',
      username: 'Doc_Valentina',
      tipo: 'compra_coins',
      cantidad_coins: 500,
      monto_dinero_real: 7.99,
      metodo_pago: 'Yappy',
      estado: 'pendiente',
      referencia_pago: 'YP-9402847',
      detalles: 'Pago móvil Yappy a CLICMASTER LATAM INC - Tel: +507 6829-4411',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: 'tx_pend_02',
      user_id: 'usr-pilot-03',
      username: 'PilotSky_RP',
      tipo: 'compra_coins',
      cantidad_coins: 1000,
      monto_dinero_real: 650,
      metodo_pago: 'Robux',
      estado: 'pendiente',
      referencia_pago: 'RBX-DEV-993817',
      detalles: 'Gamepass Comprado en Roblox Game: CLICMaster RP Oficial',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    },
  ],
  shop_purchases: [
    {
      id: 'sp_init_01',
      user_id: 'usr-carlos-01',
      username: 'Carlos_RP',
      item_id: 'v-uniforme-policia',
      item_name: 'Uniforme Táctico Policía (RPD)',
      cost_coins: 250,
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
};

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // Fallback to initial data if file is corrupted
    }

    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Silently handle filesystem write error
    }
  }

  public getPackages(): CoinPackage[] {
    return INITIAL_PACKAGES;
  }

  public getUser(userId: string): User | undefined {
    return this.data.users[userId];
  }

  public getDefaultUser(): User {
    // Current primary user for simulation
    return this.data.users['usr-carlos-01'];
  }

  public getAllUsers(): User[] {
    return Object.values(this.data.users);
  }

  public getUserTransactions(userId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getPendingTransactions(): Transaction[] {
    return this.data.transactions
      .filter((t) => t.estado === 'pendiente')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAllTransactions(): Transaction[] {
    return [...this.data.transactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public createBuyRequest(params: {
    userId: string;
    packageId?: string;
    coins: number;
    amountMoney: number;
    paymentMethod: PaymentMetodo;
    paymentReference: string;
    detalles?: string;
    autoComplete?: boolean;
  }): Transaction {
    const user = this.getUser(params.userId);
    if (!user) {
      throw new Error(`Usuario con ID ${params.userId} no encontrado.`);
    }

    const isAutoCompleted = params.autoComplete || params.paymentMethod === 'PayPal';

    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      username: user.username,
      tipo: 'compra_coins',
      cantidad_coins: params.coins,
      monto_dinero_real: params.amountMoney,
      metodo_pago: params.paymentMethod,
      estado: isAutoCompleted ? 'completado' : 'pendiente',
      referencia_pago: params.paymentReference,
      detalles: params.detalles || `Recarga de ${params.coins} ClicCoins vía ${params.paymentMethod}`,
      timestamp: new Date().toISOString(),
    };

    if (isAutoCompleted) {
      user.cliccoins_balance += params.coins;
      transaction.reviewed_at = new Date().toISOString();
      transaction.reviewed_by = 'Sistema_PayPal_Webhook';
    }

    this.data.transactions.unshift(transaction);
    this.saveData(this.data);
    return transaction;
  }

  public approvePayment(transactionId: string, adminUsername = 'Admin_Master'): Transaction {
    const tx = this.data.transactions.find((t) => t.id === transactionId);
    if (!tx) {
      throw new Error(`Transacción ${transactionId} no encontrada.`);
    }

    if (tx.estado !== 'pendiente') {
      throw new Error(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);
    }

    const user = this.data.users[tx.user_id];
    if (!user) {
      throw new Error(`Usuario ${tx.user_id} asociado a la transacción no existe.`);
    }

    // Acreditación atómica de ClicCoins
    user.cliccoins_balance += tx.cantidad_coins;
    tx.estado = 'completado';
    tx.reviewed_at = new Date().toISOString();
    tx.reviewed_by = adminUsername;

    this.saveData(this.data);
    return tx;
  }

  public rejectPayment(
    transactionId: string,
    reason = 'Comprobante no válido o pago no recibido',
    adminUsername = 'Admin_Master'
  ): Transaction {
    const tx = this.data.transactions.find((t) => t.id === transactionId);
    if (!tx) {
      throw new Error(`Transacción ${transactionId} no encontrada.`);
    }

    if (tx.estado !== 'pendiente') {
      throw new Error(`La transacción ${transactionId} ya tiene estado "${tx.estado}".`);
    }

    tx.estado = 'rechazado';
    tx.rejection_reason = reason;
    tx.reviewed_at = new Date().toISOString();
    tx.reviewed_by = adminUsername;

    this.saveData(this.data);
    return tx;
  }

  public processShopPurchase(params: {
    userId: string;
    itemId: string;
    itemName: string;
    costCoins: number;
  }): { success: boolean; newBalance: number; transaction: Transaction; purchase: ShopPurchase } {
    const user = this.data.users[params.userId];
    if (!user) {
      throw new Error(`Usuario ${params.userId} no encontrado.`);
    }

    if (params.costCoins <= 0) {
      throw new Error('El costo del artículo debe ser un número entero mayor a 0.');
    }

    // Verificación estricta de saldo en el servidor para evitar manipulaciones de cliente
    if (user.cliccoins_balance < params.costCoins) {
      throw new Error(
        `Saldo insuficiente. Tienes ${user.cliccoins_balance} ClicCoins y el artículo cuesta ${params.costCoins} ClicCoins.`
      );
    }

    // Descuento atómico
    user.cliccoins_balance -= params.costCoins;

    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      username: user.username,
      tipo: 'gasto_tienda',
      cantidad_coins: params.costCoins,
      monto_dinero_real: 0,
      metodo_pago: 'Sistema',
      estado: 'completado',
      referencia_pago: `SHOP-${params.itemId.toUpperCase()}`,
      detalles: `Compra en tienda: ${params.itemName}`,
      timestamp: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'Sistema_Tienda_RP',
    };

    const purchase: ShopPurchase = {
      id: `sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      username: user.username,
      item_id: params.itemId,
      item_name: params.itemName,
      cost_coins: params.costCoins,
      timestamp: new Date().toISOString(),
    };

    this.data.transactions.unshift(transaction);
    this.data.shop_purchases.unshift(purchase);
    this.saveData(this.data);

    return {
      success: true,
      newBalance: user.cliccoins_balance,
      transaction,
      purchase,
    };
  }

  public switchUserRole(userId: string, newRole: 'user' | 'admin'): User {
    const user = this.data.users[userId];
    if (!user) {
      throw new Error(`Usuario ${userId} no encontrado.`);
    }
    user.role = newRole;
    this.saveData(this.data);
    return user;
  }
}

export const db = new DatabaseService();
