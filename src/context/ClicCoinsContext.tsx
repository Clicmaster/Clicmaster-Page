import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PaymentMethod = 'Yappy' | 'PayPal' | 'Robux' | 'Sistema';
export type TransactionStatus = 'pendiente' | 'completado' | 'rechazado';
export type TransactionType = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';

export interface UserProfile {
  id: string;
  username: string;
  roblox_username: string;
  cliccoins_balance: number;
  role: 'user' | 'admin';
  avatar: string;
  created_at: string;
}

export interface ClicTransaction {
  id: string;
  user_id: string;
  username: string;
  tipo: TransactionType;
  cantidad_coins: number;
  monto_dinero_real: number;
  metodo_pago: PaymentMethod;
  estado: TransactionStatus;
  referencia_pago: string;
  detalles?: string;
  timestamp: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
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

interface ClicCoinsContextType {
  user: UserProfile | null;
  balance: number;
  transactions: ClicTransaction[];
  pendingPayments: ClicTransaction[];
  packages: CoinPackage[];
  loading: boolean;
  isAdmin: boolean;
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;
  refreshBalance: () => Promise<void>;
  fetchPendingPayments: () => Promise<void>;
  buyCoinsRequest: (params: {
    packageId?: string;
    coins: number;
    amountMoney: number;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    detalles?: string;
  }) => Promise<{ success: boolean; message: string; transaction?: ClicTransaction }>;
  simulatePayPalCapture: (orderId: string, coins: number, amountUsd: number) => Promise<{ success: boolean; message: string }>;
  purchaseWithCoins: (itemId: string, itemName: string, costCoins: number) => Promise<{ success: boolean; message: string; newBalance?: number }>;
  approvePayment: (transactionId: string) => Promise<{ success: boolean; message: string }>;
  rejectPayment: (transactionId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  toggleAdminRole: () => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-carlos-01',
  username: 'Carlos_RP',
  roblox_username: 'Rodriguez_Capo',
  cliccoins_balance: 1250,
  role: 'admin',
  avatar: '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp',
  created_at: '2026-10-01T00:00:00.000Z',
};

const DEFAULT_PACKAGES: CoinPackage[] = [
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

const DEFAULT_TRANSACTIONS: ClicTransaction[] = [
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
];

const ClicCoinsContext = createContext<ClicCoinsContextType | undefined>(undefined);

export const ClicCoinsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read local storage initial values if available for offline resilience
  const getInitialUser = (): UserProfile => {
    try {
      const stored = localStorage.getItem('cliccoins_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  };

  const getInitialTransactions = (): ClicTransaction[] => {
    try {
      const stored = localStorage.getItem('cliccoins_transactions');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_TRANSACTIONS;
  };

  const [user, setUser] = useState<UserProfile>(getInitialUser);
  const [balance, setBalance] = useState<number>(user.cliccoins_balance);
  const [transactions, setTransactions] = useState<ClicTransaction[]>(getInitialTransactions);
  const [pendingPayments, setPendingPayments] = useState<ClicTransaction[]>(() =>
    DEFAULT_TRANSACTIONS.filter((t) => t.estado === 'pendiente')
  );
  const [packages, setPackages] = useState<CoinPackage[]>(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletOpen, setWalletOpen] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);

  // Sync state with localStorage
  const persistState = useCallback((updatedUser: UserProfile, updatedTx: ClicTransaction[]) => {
    try {
      localStorage.setItem('cliccoins_user', JSON.stringify(updatedUser));
      localStorage.setItem('cliccoins_transactions', JSON.stringify(updatedTx));
    } catch {
      // ignore
    }
  }, []);

  // 1. Obtener saldo y transacciones con fallback silencioso
  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/user/balance?userId=usr-carlos-01');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.user) {
          setUser(data.user);
          setBalance(data.balance);
          setTransactions(data.transactions || []);
          persistState(data.user, data.transactions || []);
        }
      }
    } catch {
      // Silently maintain local state without logging errors
    }
  }, [persistState]);

  // 2. Obtener lista de pagos pendientes con fallback silencioso
  const fetchPendingPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pending-payments');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.pendingPayments)) {
          setPendingPayments(data.pendingPayments);
        }
      }
    } catch {
      // Silently maintain local pending payments
    }
  }, []);

  // 3. Obtener paquetes de coins
  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.packages)) {
          setPackages(data.packages);
        }
      }
    } catch {
      // Fallback to DEFAULT_PACKAGES
    }
  }, []);

  useEffect(() => {
    refreshBalance();
    fetchPendingPayments();
    fetchPackages();

    const interval = setInterval(() => {
      refreshBalance();
      fetchPendingPayments();
    }, 12000);

    return () => clearInterval(interval);
  }, [refreshBalance, fetchPendingPayments, fetchPackages]);

  // 4. Solicitar compra de ClicCoins (Yappy / Robux / PayPal)
  const buyCoinsRequest = async (params: {
    packageId?: string;
    coins: number;
    amountMoney: number;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    detalles?: string;
  }) => {
    setLoading(true);
    const isInstant = params.paymentMethod === 'PayPal';

    // Local fallback transaction
    const localTx: ClicTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      username: user.username,
      tipo: 'compra_coins',
      cantidad_coins: params.coins,
      monto_dinero_real: params.amountMoney,
      metodo_pago: params.paymentMethod,
      estado: isInstant ? 'completado' : 'pendiente',
      referencia_pago: params.paymentReference,
      detalles: params.detalles || `Recarga de ${params.coins} ClicCoins vía ${params.paymentMethod}`,
      timestamp: new Date().toISOString(),
      reviewed_at: isInstant ? new Date().toISOString() : undefined,
      reviewed_by: isInstant ? 'Sistema_PayPal' : undefined,
    };

    try {
      const res = await fetch('/api/coins/buy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...params,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await refreshBalance();
          await fetchPendingPayments();
          return { success: true, message: data.message, transaction: data.transaction };
        }
      }
    } catch {
      // Backend request failed, apply locally for seamless UX
    }

    // Apply local state change
    const updatedTx = [localTx, ...transactions];
    const newBalance = isInstant ? balance + params.coins : balance;
    const updatedUser = { ...user, cliccoins_balance: newBalance };

    setUser(updatedUser);
    setBalance(newBalance);
    setTransactions(updatedTx);
    if (!isInstant) {
      setPendingPayments((prev) => [localTx, ...prev]);
    }
    persistState(updatedUser, updatedTx);
    setLoading(false);

    const msg = isInstant
      ? `¡Pago completado! Se han acreditado ${params.coins.toLocaleString()} ClicCoins a tu cuenta.`
      : `Solicitud registrada. Tu transacción (${localTx.id}) está en revisión por el equipo administrativo.`;

    return { success: true, message: msg, transaction: localTx };
  };

  // 5. Simular captura automática de PayPal Webhook
  const simulatePayPalCapture = async (orderId: string, coins: number, amountUsd: number) => {
    return buyCoinsRequest({
      coins,
      amountMoney: amountUsd,
      paymentMethod: 'PayPal',
      paymentReference: orderId,
      detalles: `Compra instantánea con PayPal Checkout (Orden: ${orderId})`,
    });
  };

  // 6. Comprar artículo de tienda con ClicCoins
  const purchaseWithCoins = async (itemId: string, itemName: string, costCoins: number) => {
    setLoading(true);

    if (balance < costCoins) {
      setLoading(false);
      return {
        success: false,
        message: `Saldo insuficiente. Tienes ${balance.toLocaleString()} ClicCoins y el artículo cuesta ${costCoins.toLocaleString()} ClicCoins.`,
      };
    }

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          itemId,
          itemName,
          costCoins,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await refreshBalance();
          setLoading(false);
          return { success: true, message: data.message, newBalance: data.newBalance };
        }
      }
    } catch {
      // Backend unavailable, perform atomic deduction locally
    }

    const newBal = balance - costCoins;
    const purchaseTx: ClicTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      username: user.username,
      tipo: 'gasto_tienda',
      cantidad_coins: costCoins,
      monto_dinero_real: 0,
      metodo_pago: 'Sistema',
      estado: 'completado',
      referencia_pago: `SHOP-${itemId.toUpperCase()}`,
      detalles: `Compra en tienda: ${itemName}`,
      timestamp: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'Sistema_Tienda_RP',
    };

    const updatedTx = [purchaseTx, ...transactions];
    const updatedUser = { ...user, cliccoins_balance: newBal };

    setUser(updatedUser);
    setBalance(newBal);
    setTransactions(updatedTx);
    persistState(updatedUser, updatedTx);
    setLoading(false);

    return {
      success: true,
      message: `¡Compra exitosa! Has adquirido ${itemName} por ${costCoins.toLocaleString()} ClicCoins.`,
      newBalance: newBal,
    };
  };

  // 7. Aprobar pago pendiente (Admin)
  const approvePayment = async (transactionId: string) => {
    try {
      const res = await fetch(`/api/admin/approve-payment/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: user.username }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await refreshBalance();
          await fetchPendingPayments();
          return { success: true, message: data.message };
        }
      }
    } catch {
      // fallback locally
    }

    // Local approval
    const tx = transactions.find((t) => t.id === transactionId);
    const addedCoins = tx ? tx.cantidad_coins : 500;
    const newBal = balance + addedCoins;
    const updatedTx = transactions.map((t) =>
      t.id === transactionId
        ? { ...t, estado: 'completado' as TransactionStatus, reviewed_at: new Date().toISOString(), reviewed_by: user.username }
        : t
    );
    const updatedUser = { ...user, cliccoins_balance: newBal };

    setUser(updatedUser);
    setBalance(newBal);
    setTransactions(updatedTx);
    setPendingPayments((prev) => prev.filter((t) => t.id !== transactionId));
    persistState(updatedUser, updatedTx);

    return {
      success: true,
      message: `Pago ${transactionId} aprobado con éxito. Se acreditaron ${addedCoins.toLocaleString()} ClicCoins.`,
    };
  };

  // 8. Rechazar pago pendiente (Admin)
  const rejectPayment = async (transactionId: string, reason?: string) => {
    const defaultReason = reason || 'Comprobante no válido o pago no recibido';
    try {
      const res = await fetch(`/api/admin/reject-payment/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername: user.username,
          reason: defaultReason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await refreshBalance();
          await fetchPendingPayments();
          return { success: true, message: data.message };
        }
      }
    } catch {
      // fallback locally
    }

    const updatedTx = transactions.map((t) =>
      t.id === transactionId
        ? {
            ...t,
            estado: 'rechazado' as TransactionStatus,
            rejection_reason: defaultReason,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.username,
          }
        : t
    );

    setTransactions(updatedTx);
    setPendingPayments((prev) => prev.filter((t) => t.id !== transactionId));
    persistState(user, updatedTx);

    return {
      success: true,
      message: `Pago ${transactionId} rechazado. Motivo: ${defaultReason}`,
    };
  };

  // 9. Alternar rol de usuario/admin
  const toggleAdminRole = async () => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await fetch('/api/user/toggle-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: newRole,
        }),
      });
    } catch {
      // ignore
    }

    const updatedUser = { ...user, role: newRole as 'user' | 'admin' };
    setUser(updatedUser);
    persistState(updatedUser, transactions);
  };

  return (
    <ClicCoinsContext.Provider
      value={{
        user,
        balance,
        transactions,
        pendingPayments,
        packages,
        loading,
        isAdmin: user.role === 'admin',
        walletOpen,
        setWalletOpen,
        adminPanelOpen,
        setAdminPanelOpen,
        refreshBalance,
        fetchPendingPayments,
        buyCoinsRequest,
        simulatePayPalCapture,
        purchaseWithCoins,
        approvePayment,
        rejectPayment,
        toggleAdminRole,
      }}
    >
      {children}
    </ClicCoinsContext.Provider>
  );
};

export const useClicCoins = (): ClicCoinsContextType => {
  const context = useContext(ClicCoinsContext);
  if (!context) {
    throw new Error('useClicCoins debe utilizarse dentro de un ClicCoinsProvider');
  }
  return context;
};
