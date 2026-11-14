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
  moneda?: 'USD' | 'ROBUX' | 'NINGUNA';
  metodo_pago: PaymentMethod;
  estado: TransactionStatus;
  referencia_pago: string;
  package_id?: string;
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

type ActionResult = { success: boolean; message: string };

interface ClicCoinsContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  balance: number;
  transactions: ClicTransaction[];
  /** Solo para administradores: solicitudes pendientes de todos los usuarios. */
  pendingPayments: ClicTransaction[];
  /** Solo para administradores: todas las solicitudes de recarga recientes. */
  adminRequests: ClicTransaction[];
  packages: CoinPackage[];
  loading: boolean;
  isAdmin: boolean;
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  login: (username: string, password: string) => Promise<ActionResult>;
  register: (params: {
    username: string;
    robloxUsername: string;
    password: string;
    adminCode?: string;
  }) => Promise<ActionResult>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
  fetchPendingPayments: () => Promise<void>;
  buyCoinsRequest: (params: {
    packageId: string;
    paymentMethod: 'Yappy' | 'Robux';
    paymentReference: string;
  }) => Promise<ActionResult & { transaction?: ClicTransaction }>;
  purchaseWithCoins: (itemId: string) => Promise<ActionResult & { newBalance?: number }>;
  approvePayment: (transactionId: string) => Promise<ActionResult>;
  rejectPayment: (transactionId: string, reason?: string) => Promise<ActionResult>;
}

// Paquetes que se muestran mientras carga la información del servidor.
// (Solo para mostrar: el precio real lo decide siempre el servidor.)
const DEFAULT_PACKAGES: CoinPackage[] = [
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

// En el navegador solo se guarda el "pase" de sesión, nunca el saldo.
const TOKEN_KEY = 'clicmaster_session';
const OLD_KEYS = ['cliccoins_user', 'cliccoins_transactions'];

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    // Borrar datos falsos que guardaba la versión anterior
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // almacenamiento no disponible
  }
}

const NETWORK_ERROR = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

const ClicCoinsContext = createContext<ClicCoinsContextType | undefined>(undefined);

export const ClicCoinsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<ClicTransaction[]>([]);
  const [pendingPayments, setPendingPayments] = useState<ClicTransaction[]>([]);
  const [adminRequests, setAdminRequests] = useState<ClicTransaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletOpen, setWalletOpenState] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState<boolean>(false);

  const isAdmin = user?.role === 'admin';

  const clearSession = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setTransactions([]);
    setPendingPayments([]);
    setAdminRequests([]);
    setAdminPanelOpen(false);
  }, []);

  /** Llama a la API enviando el pase de sesión. Si la sesión venció, la cierra. */
  const api = useCallback(
    async (url: string, options: RequestInit = {}): Promise<{ ok: boolean; status: number; data: any }> => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers as any) } });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (res.status === 401 && token) {
        clearSession();
      }
      return { ok: res.ok, status: res.status, data };
    },
    [token, clearSession]
  );

  // Abrir la billetera exige haber iniciado sesión
  const setWalletOpen = useCallback(
    (open: boolean) => {
      if (open && !token) {
        setAuthOpen(true);
        return;
      }
      setWalletOpenState(open);
    },
    [token]
  );

  // 1. Saldo e historial del usuario conectado
  const refreshBalance = useCallback(async () => {
    if (!token) return;
    try {
      const { ok, data } = await api('/api/user/balance');
      if (ok && data?.success && data.user) {
        setUser(data.user);
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      }
    } catch {
      // Sin conexión: se mantiene lo último que respondió el servidor (no se inventa nada)
    }
  }, [api, token]);

  // 2. Solicitudes de recarga (solo administradores)
  const fetchPendingPayments = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const { ok, data } = await api('/api/admin/pending-payments');
      if (ok && data?.success) {
        setPendingPayments(Array.isArray(data.pendingPayments) ? data.pendingPayments : []);
        setAdminRequests(Array.isArray(data.requests) ? data.requests : []);
      }
    } catch {
      // sin conexión
    }
  }, [api, token, isAdmin]);

  // 3. Paquetes de ClicCoins (públicos)
  useEffect(() => {
    fetch('/api/packages')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.packages)) setPackages(data.packages);
      })
      .catch(() => {
        // se muestran los paquetes por defecto
      });
  }, []);

  // Actualización periódica mientras haya sesión
  useEffect(() => {
    if (!token) return;
    refreshBalance();
    const interval = setInterval(refreshBalance, 15000);
    return () => clearInterval(interval);
  }, [token, refreshBalance]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchPendingPayments();
    const interval = setInterval(fetchPendingPayments, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, fetchPendingPayments]);

  // ------------------------------------------------------------- Sesión
  const startSession = (newToken: string, newUser: UserProfile) => {
    writeToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (username: string, password: string): Promise<ActionResult> => {
    setLoading(true);
    try {
      const { ok, data } = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (ok && data?.success && data.token) {
        startSession(data.token, data.user);
        return { success: true, message: `¡Bienvenido, ${data.user.username}!` };
      }
      return { success: false, message: data?.message || 'No se pudo iniciar sesión.' };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: {
    username: string;
    robloxUsername: string;
    password: string;
    adminCode?: string;
  }): Promise<ActionResult> => {
    setLoading(true);
    try {
      const { ok, data } = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (ok && data?.success && data.token) {
        startSession(data.token, data.user);
        return { success: true, message: `¡Cuenta creada! Bienvenido, ${data.user.username}.` };
      }
      return { success: false, message: data?.message || 'No se pudo crear la cuenta.' };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setWalletOpenState(false);
  };

  // ---------------------------------------------------- Recargar ClicCoins
  const buyCoinsRequest = async (params: {
    packageId: string;
    paymentMethod: 'Yappy' | 'Robux';
    paymentReference: string;
  }) => {
    if (!token) {
      setAuthOpen(true);
      return { success: false, message: 'Inicia sesión para recargar ClicCoins.' };
    }
    setLoading(true);
    try {
      const { ok, data } = await api('/api/coins/buy-request', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (ok && data?.success) {
        await refreshBalance();
        return { success: true, message: data.message, transaction: data.transaction };
      }
      return { success: false, message: data?.message || 'No se pudo registrar la solicitud.' };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------- Comprar en la tienda
  const purchaseWithCoins = async (itemId: string) => {
    if (!token) {
      setAuthOpen(true);
      return { success: false, message: 'Inicia sesión para comprar con ClicCoins.' };
    }
    setLoading(true);
    try {
      const { ok, data } = await api('/api/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ itemId }),
      });
      if (ok && data?.success) {
        await refreshBalance();
        return { success: true, message: data.message, newBalance: data.newBalance };
      }
      return { success: false, message: data?.message || 'No se pudo completar la compra.' };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------- Acciones de administrador
  const approvePayment = async (transactionId: string): Promise<ActionResult> => {
    try {
      const { ok, data } = await api(`/api/admin/approve-payment/${encodeURIComponent(transactionId)}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      await fetchPendingPayments();
      await refreshBalance();
      return { success: !!(ok && data?.success), message: data?.message || 'No se pudo aprobar el pago.' };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    }
  };

  const rejectPayment = async (transactionId: string, reason?: string): Promise<ActionResult> => {
    try {
      const { ok, data } = await api(`/api/admin/reject-payment/${encodeURIComponent(transactionId)}`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || '' }),
      });
      await fetchPendingPayments();
      return { success: !!(ok && data?.success), message: data?.message || 'No se pudo rechazar el pago.' };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    }
  };

  return (
    <ClicCoinsContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        balance: user?.cliccoins_balance ?? 0,
        transactions,
        pendingPayments,
        adminRequests,
        packages,
        loading,
        isAdmin,
        walletOpen,
        setWalletOpen,
        adminPanelOpen: adminPanelOpen && isAdmin,
        setAdminPanelOpen,
        authOpen,
        setAuthOpen,
        login,
        register,
        logout,
        refreshBalance,
        fetchPendingPayments,
        buyCoinsRequest,
        purchaseWithCoins,
        approvePayment,
        rejectPayment,
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
