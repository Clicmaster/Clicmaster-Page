import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PACKAGES, type CoinPackage } from '../data/coinPackages.ts';
import type { PaymentSettings } from '../data/paymentSettings.ts';

export type PaymentMethod = 'Yappy' | 'PayPal' | 'Robux' | 'Sistema';
export type RechargeMethod = 'Yappy' | 'PayPal';
export type TransactionStatus = 'pendiente' | 'completado' | 'rechazado';
export type TransactionType = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';
export type { CoinPackage, PaymentSettings };

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
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
  order_id?: string;
  detalles?: string;
  timestamp: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export type OrderStatus = 'pendiente_entrega' | 'entregado' | 'cancelado';

export interface ShippingInfo {
  nombre: string;
  pais: string;
  direccion: string;
  telefono: string;
}

export interface ShopOrder {
  id: string;
  user_id: string;
  username: string;
  roblox_username: string;
  email?: string;
  item_id: string;
  item_name: string;
  item_type: 'membresia' | 'virtual' | 'fisico' | 'pack';
  cost_coins: number;
  estado: OrderStatus;
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

/** Datos de pago que ve el cliente (solo métodos activos). */
export interface PublicPaymentMethods {
  yappy: { available: boolean; phone?: string; holder?: string; instructions?: string };
  paypal: { available: boolean; email?: string; link?: string; instructions?: string };
}

export interface PurchaseExtras {
  opciones?: { talla?: string; color?: string };
  envio?: ShippingInfo;
}

type ActionResult = { success: boolean; message: string };

interface ClicCoinsContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  balance: number;
  transactions: ClicTransaction[];
  orders: ShopOrder[];
  packages: CoinPackage[];
  paymentMethods: PublicPaymentMethods;
  loading: boolean;
  isAdmin: boolean;
  // Ventanas
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  /** Token de invitación de administrador leído del enlace (?invitacion=...) */
  inviteToken: string | null;
  clearInvite: () => void;
  // Cuenta
  login: (identifier: string, password: string) => Promise<ActionResult>;
  register: (params: {
    username: string;
    email: string;
    robloxUsername: string;
    password: string;
    adminCode?: string;
  }) => Promise<ActionResult>;
  checkInvite: (token: string) => Promise<ActionResult & { email?: string }>;
  activateInvite: (params: {
    token: string;
    username: string;
    robloxUsername: string;
    password: string;
  }) => Promise<ActionResult>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
  // ClicCoins
  buyCoinsRequest: (params: {
    packageId: string;
    paymentMethod: RechargeMethod;
    paymentReference: string;
  }) => Promise<ActionResult & { transaction?: ClicTransaction }>;
  purchaseWithCoins: (itemId: string, extras?: PurchaseExtras) => Promise<ActionResult & { order?: ShopOrder }>;
  // Administración
  pendingPayments: ClicTransaction[];
  adminRequests: ClicTransaction[];
  adminOrders: ShopOrder[];
  fetchPendingPayments: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>;
  approvePayment: (transactionId: string) => Promise<ActionResult>;
  rejectPayment: (transactionId: string, reason?: string) => Promise<ActionResult>;
  deliverOrder: (orderId: string, note?: string) => Promise<ActionResult>;
  cancelOrder: (orderId: string, reason: string) => Promise<ActionResult>;
  getAdminPaymentSettings: () => Promise<PaymentSettings | null>;
  saveAdminPaymentSettings: (settings: PaymentSettings) => Promise<ActionResult>;
}

const NO_METHODS: PublicPaymentMethods = { yappy: { available: false }, paypal: { available: false } };

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
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // almacenamiento no disponible
  }
}

/** Lee ?invitacion=... del enlace de activación de administrador. */
function readInviteFromUrl(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('invitacion');
  } catch {
    return null;
  }
}

const NETWORK_ERROR = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

const ClicCoinsContext = createContext<ClicCoinsContextType | undefined>(undefined);

export const ClicCoinsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<ClicTransaction[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [pendingPayments, setPendingPayments] = useState<ClicTransaction[]>([]);
  const [adminRequests, setAdminRequests] = useState<ClicTransaction[]>([]);
  const [adminOrders, setAdminOrders] = useState<ShopOrder[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>(PACKAGES);
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentMethods>(NO_METHODS);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletOpen, setWalletOpenState] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);
  const [inviteToken, setInviteToken] = useState<string | null>(readInviteFromUrl);
  const [authOpen, setAuthOpen] = useState<boolean>(() => !!readInviteFromUrl());

  const isAdmin = user?.role === 'admin';

  const clearSession = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setTransactions([]);
    setOrders([]);
    setPendingPayments([]);
    setAdminRequests([]);
    setAdminOrders([]);
    setAdminPanelOpen(false);
  }, []);

  const clearInvite = useCallback(() => {
    setInviteToken(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('invitacion');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // sin acceso al historial
    }
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
      if (res.status === 401 && token) clearSession();
      return { ok: res.ok, status: res.status, data };
    },
    [token, clearSession]
  );

  /** Ejecuta una acción POST/PUT y devuelve un resultado uniforme. */
  const action = useCallback(
    async (url: string, method: 'POST' | 'PUT', body: unknown, fallback: string) => {
      try {
        const { ok, data } = await api(url, { method, body: JSON.stringify(body ?? {}) });
        return { ok: !!(ok && data?.success), data, message: data?.message || (ok ? '' : fallback) };
      } catch {
        return { ok: false, data: null, message: NETWORK_ERROR };
      }
    },
    [api]
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

  // ------------------------------------------------------------- Lecturas
  const refreshBalance = useCallback(async () => {
    if (!token) return;
    try {
      const [balanceRes, ordersRes] = await Promise.all([api('/api/user/balance'), api('/api/user/orders')]);
      if (balanceRes.ok && balanceRes.data?.success && balanceRes.data.user) {
        setUser(balanceRes.data.user);
        setTransactions(Array.isArray(balanceRes.data.transactions) ? balanceRes.data.transactions : []);
      }
      if (ordersRes.ok && Array.isArray(ordersRes.data?.orders)) setOrders(ordersRes.data.orders);
    } catch {
      // Sin conexión: se mantiene lo último que respondió el servidor
    }
  }, [api, token]);

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

  const fetchAdminOrders = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const { ok, data } = await api('/api/admin/orders');
      if (ok && Array.isArray(data?.orders)) setAdminOrders(data.orders);
    } catch {
      // sin conexión
    }
  }, [api, token, isAdmin]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const res = await fetch('/api/payment-settings');
      const data = res.ok ? await res.json() : null;
      if (data?.success && data.methods) setPaymentMethods(data.methods);
    } catch {
      // se muestran como no disponibles
    }
  }, []);

  // Datos públicos: paquetes y métodos de pago
  useEffect(() => {
    fetch('/api/packages')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.packages)) setPackages(data.packages);
      })
      .catch(() => {
        // se muestran los paquetes oficiales incluidos en la página
      });
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Al abrir la billetera, actualizar métodos de pago (por si el admin los cambió)
  useEffect(() => {
    if (walletOpen) fetchPaymentMethods();
  }, [walletOpen, fetchPaymentMethods]);

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
    fetchAdminOrders();
    const interval = setInterval(() => {
      fetchPendingPayments();
      fetchAdminOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, fetchPendingPayments, fetchAdminOrders]);

  // ------------------------------------------------------------- Sesión
  const startSession = (newToken: string, newUser: UserProfile) => {
    writeToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const sessionAction = async (url: string, body: unknown, fallback: string, welcome: (u: UserProfile) => string) => {
    setLoading(true);
    try {
      const { ok, data } = await api(url, { method: 'POST', body: JSON.stringify(body) });
      if (ok && data?.success && data.token) {
        startSession(data.token, data.user);
        return { success: true, message: welcome(data.user) };
      }
      return { success: false, message: data?.message || fallback };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    } finally {
      setLoading(false);
    }
  };

  const login = (identifier: string, password: string) =>
    sessionAction('/api/auth/login', { username: identifier, password }, 'No se pudo iniciar sesión.', (u) => `¡Bienvenido, ${u.username}!`);

  const register = (params: { username: string; email: string; robloxUsername: string; password: string; adminCode?: string }) =>
    sessionAction('/api/auth/register', params, 'No se pudo crear la cuenta.', (u) => `¡Cuenta creada! Bienvenido, ${u.username}.`);

  const activateInvite = async (params: { token: string; username: string; robloxUsername: string; password: string }) => {
    const res = await sessionAction(
      '/api/auth/activate-invite',
      params,
      'No se pudo activar la cuenta.',
      (u) => `¡Cuenta de administrador activada! Bienvenido, ${u.username}.`
    );
    if (res.success) clearInvite();
    return res;
  };

  const checkInvite = async (inviteTok: string) => {
    try {
      const res = await fetch(`/api/auth/invite?token=${encodeURIComponent(inviteTok)}`);
      const data = await res.json();
      return { success: !!data?.success, message: data?.message || '', email: data?.email };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    }
  };

  const logout = () => {
    clearSession();
    setWalletOpenState(false);
  };

  // ------------------------------------------------------------- ClicCoins
  const buyCoinsRequest = async (params: { packageId: string; paymentMethod: RechargeMethod; paymentReference: string }) => {
    if (!token) {
      setAuthOpen(true);
      return { success: false, message: 'Inicia sesión para recargar ClicCoins.' };
    }
    setLoading(true);
    const r = await action('/api/coins/buy-request', 'POST', params, 'No se pudo registrar la solicitud.');
    if (r.ok) await refreshBalance();
    setLoading(false);
    return { success: r.ok, message: r.message, transaction: r.data?.transaction };
  };

  const purchaseWithCoins = async (itemId: string, extras: PurchaseExtras = {}) => {
    if (!token) {
      setAuthOpen(true);
      return { success: false, message: 'Inicia sesión para comprar con ClicCoins.' };
    }
    setLoading(true);
    const r = await action('/api/shop/purchase', 'POST', { itemId, ...extras }, 'No se pudo completar la compra.');
    if (r.ok) await refreshBalance();
    setLoading(false);
    return { success: r.ok, message: r.message, order: r.data?.order };
  };

  // ------------------------------------------------------------- Administración
  const approvePayment = async (transactionId: string) => {
    const r = await action(`/api/admin/approve-payment/${encodeURIComponent(transactionId)}`, 'POST', {}, 'No se pudo aprobar el pago.');
    await Promise.all([fetchPendingPayments(), refreshBalance()]);
    return { success: r.ok, message: r.message };
  };

  const rejectPayment = async (transactionId: string, reason?: string) => {
    const r = await action(`/api/admin/reject-payment/${encodeURIComponent(transactionId)}`, 'POST', { reason: reason || '' }, 'No se pudo rechazar el pago.');
    await fetchPendingPayments();
    return { success: r.ok, message: r.message };
  };

  const deliverOrder = async (orderId: string, note?: string) => {
    const r = await action(`/api/admin/orders/${encodeURIComponent(orderId)}/deliver`, 'POST', { note: note || '' }, 'No se pudo marcar como entregado.');
    await fetchAdminOrders();
    return { success: r.ok, message: r.message };
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    const r = await action(`/api/admin/orders/${encodeURIComponent(orderId)}/cancel`, 'POST', { reason }, 'No se pudo cancelar el pedido.');
    await Promise.all([fetchAdminOrders(), refreshBalance()]);
    return { success: r.ok, message: r.message };
  };

  const getAdminPaymentSettings = async (): Promise<PaymentSettings | null> => {
    try {
      const { ok, data } = await api('/api/admin/payment-settings');
      return ok && data?.settings ? data.settings : null;
    } catch {
      return null;
    }
  };

  const saveAdminPaymentSettings = async (settings: PaymentSettings) => {
    const r = await action('/api/admin/payment-settings', 'PUT', settings, 'No se pudo guardar la configuración.');
    if (r.ok) await fetchPaymentMethods();
    return { success: r.ok, message: r.message };
  };

  return (
    <ClicCoinsContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        balance: user?.cliccoins_balance ?? 0,
        transactions,
        orders,
        packages,
        paymentMethods,
        loading,
        isAdmin,
        walletOpen,
        setWalletOpen,
        adminPanelOpen: adminPanelOpen && isAdmin,
        setAdminPanelOpen,
        authOpen,
        setAuthOpen,
        inviteToken,
        clearInvite,
        login,
        register,
        checkInvite,
        activateInvite,
        logout,
        refreshBalance,
        buyCoinsRequest,
        purchaseWithCoins,
        pendingPayments,
        adminRequests,
        adminOrders,
        fetchPendingPayments,
        fetchAdminOrders,
        approvePayment,
        rejectPayment,
        deliverOrder,
        cancelOrder,
        getAdminPaymentSettings,
        saveAdminPaymentSettings,
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
