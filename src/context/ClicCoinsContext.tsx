import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firebase, firebaseConfigurado } from '../lib/firebase.ts';
import { llamarApi, idAleatorio } from '../lib/clicoinsApi.ts';
// Precios compartidos con el servidor (un solo lugar para editarlos)
import { PAQUETES_RECARGA, ARTICULOS, precioCoins as precioServidor } from '../../api/_lib/precios.js';

// ============================================================================
// Tipos (se mantienen los nombres que ya usaba la página)
// ============================================================================
export type PaymentMethod = 'Yappy' | 'PayPal' | 'Sistema';
export type TransactionStatus = 'pendiente' | 'completado' | 'rechazado';
export type TransactionType = 'compra_coins' | 'gasto_tienda' | 'bonificacion' | 'reembolso';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
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
  /** positivo = entra, negativo = sale */
  signo: 1 | -1;
  monto_dinero_real: number;
  metodo_pago: PaymentMethod;
  estado: TransactionStatus;
  referencia_pago: string;
  codigo_yappy?: string;
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
  name: string;
  tag?: string;
  popular?: boolean;
}

export interface YappySolicitud {
  solicitudId: string;
  codigo: string;
  estado: string;
  precioUsd: string;
  coins: number;
  paqueteNombre: string;
  yappyNumero: string;
  yappyNombre: string;
}

export interface Pedido {
  id: string;
  email: string;
  articulo: string;
  precioCoins: number;
  robloxUser: string;
  discordUser: string;
  estado: 'por-entregar' | 'entregado';
  creado: number | null;
  entregadoPor: string | null;
}

type Resultado = { success: boolean; message: string };

interface ClicCoinsContextType {
  // Sesión
  configurado: boolean;
  authReady: boolean;
  user: UserProfile | null;
  loginWithGoogle: () => Promise<Resultado>;
  loginWithEmail: (email: string, password: string) => Promise<Resultado>;
  registerWithEmail: (email: string, password: string) => Promise<Resultado>;
  resetPassword: (email: string) => Promise<Resultado>;
  logout: () => Promise<void>;

  // Saldo y datos
  balance: number;
  transactions: ClicTransaction[];
  packages: CoinPackage[];
  membresias: Record<string, number>;
  items: Record<string, { nombre: string; veces: number }>;
  yappyInfo: { activo: boolean; numero: string; nombre: string };
  loading: boolean;
  errorLectura: string | null;

  // Ventanas
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;

  // Recargas
  paypalCreateOrder: (packageId: string) => Promise<string>;
  paypalCapture: (orderId: string) => Promise<Resultado & { pending?: boolean }>;
  yappyStart: (packageId: string) => Promise<YappySolicitud>;
  yappyConfirm: (solicitudId: string, comprobante: string) => Promise<Resultado>;
  yappyCancel: (solicitudId: string) => Promise<Resultado>;

  // Tienda
  priceOf: (itemId: string) => number | null;
  purchaseWithCoins: (
    itemId: string,
    itemName: string,
    costCoins: number,
    extra?: { robloxUser?: string; discordUser?: string }
  ) => Promise<Resultado & { newBalance?: number }>;

  // Admin
  isAdmin: boolean;
  pendingPayments: ClicTransaction[];
  fetchPendingPayments: () => Promise<void>;
  adminListPayments: (estado: 'pendiente' | 'esperando-pago' | 'aprobada' | 'rechazada') => Promise<ClicTransaction[]>;
  approvePayment: (transactionId: string) => Promise<Resultado>;
  rejectPayment: (transactionId: string, reason?: string) => Promise<Resultado>;
  adminListOrders: (estado: 'por-entregar' | 'entregado') => Promise<Pedido[]>;
  adminMarkDelivered: (pedidoId: string) => Promise<Resultado>;
  adminAdjust: (email: string, amount: number, reason: string) => Promise<Resultado>;
  refreshBalance: () => Promise<void>;
}

// ============================================================================
// Utilidades
// ============================================================================
const PAQUETES_LOCALES: CoinPackage[] = PAQUETES_RECARGA.map((p: any) => ({
  id: p.id,
  coins: p.coins,
  bonus: p.bonus || 0,
  priceUsd: Number(p.precioUsd),
  name: p.name,
  tag: p.tag,
  popular: p.popular,
}));

const aIso = (t: any): string => {
  const ms = t && typeof t.toMillis === 'function' ? t.toMillis() : typeof t === 'number' ? t : Date.now();
  return new Date(ms).toISOString();
};

const mensajeAuth = (e: any): string => {
  const c = String(e?.code || '');
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found'))
    return 'Correo o contraseña incorrectos.';
  if (c.includes('email-already-in-use')) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (c.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (c.includes('invalid-email')) return 'El correo no es válido.';
  if (c.includes('popup-closed') || c.includes('cancelled-popup')) return 'Se cerró la ventana de Google.';
  if (c.includes('popup-blocked')) return 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes.';
  if (c.includes('unauthorized-domain')) return 'Este dominio no está autorizado en Firebase (Authentication > Dominios autorizados).';
  if (c.includes('too-many-requests')) return 'Demasiados intentos. Espera unos minutos.';
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
};

function movimientoATransaccion(id: string, m: any, user: UserProfile): ClicTransaction {
  const monto = Number(m.monto || 0);
  const tipoMov = String(m.tipo || '');
  const tipo: TransactionType = tipoMov.startsWith('recarga')
    ? 'compra_coins'
    : tipoMov === 'compra-tienda'
    ? 'gasto_tienda'
    : monto > 0
    ? 'bonificacion'
    : 'reembolso';
  return {
    id,
    user_id: user.id,
    username: user.username,
    tipo,
    cantidad_coins: Math.abs(monto),
    signo: monto >= 0 ? 1 : -1,
    monto_dinero_real: Number(m.detalle?.precioUsd || 0),
    metodo_pago: tipoMov === 'recarga-paypal' ? 'PayPal' : tipoMov === 'recarga-yappy' ? 'Yappy' : 'Sistema',
    estado: 'completado',
    referencia_pago: m.detalle?.codigo || m.ref || id,
    detalles: m.motivo || '',
    timestamp: aIso(m.fecha),
  };
}

function solicitudATransaccion(s: any, fallbackUser?: UserProfile | null): ClicTransaction {
  const rechazada = s.estado === 'rechazada';
  return {
    id: s.id,
    user_id: s.uid || fallbackUser?.id || '',
    username: s.email || fallbackUser?.username || '',
    tipo: 'compra_coins',
    cantidad_coins: Number(s.coins || 0),
    signo: 1,
    monto_dinero_real: Number(s.precioUsd || 0),
    metodo_pago: 'Yappy',
    estado: s.estado === 'aprobada' ? 'completado' : rechazada ? 'rechazado' : 'pendiente',
    referencia_pago: s.comprobante || 'Sin comprobante todavía',
    codigo_yappy: s.codigo,
    detalles:
      s.estado === 'esperando-pago'
        ? `Recarga Yappy ${s.paqueteNombre} · esperando tu pago`
        : `Recarga Yappy ${s.paqueteNombre}`,
    timestamp: aIso(s.confirmada || s.creada),
    reviewed_by: s.revisadaPor,
    rejection_reason: s.motivoRechazo || undefined,
  };
}

// ============================================================================
// Proveedor
// ============================================================================
const ClicCoinsContext = createContext<ClicCoinsContextType | undefined>(undefined);

export const ClicCoinsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigurado);
  const [balance, setBalance] = useState(0);
  const [movimientos, setMovimientos] = useState<ClicTransaction[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [beneficios, setBeneficios] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<ClicTransaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>(PAQUETES_LOCALES);
  const [yappyInfo, setYappyInfo] = useState({ activo: false, numero: '', nombre: 'CLICMASTER' });
  const [loading, setLoading] = useState(false);
  const [errorLectura, setErrorLectura] = useState<string | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // --- Sesión ---
  useEffect(() => {
    const fb = firebase();
    if (!fb) return;
    return onAuthStateChanged(fb.auth, (u) => {
      setFbUser(u);
      setAuthReady(true);
    });
  }, []);

  const user: UserProfile | null = useMemo(() => {
    if (!fbUser) return null;
    const nombre = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Ciudadano');
    return {
      id: fbUser.uid,
      username: nombre,
      email: fbUser.email || '',
      roblox_username: '',
      cliccoins_balance: balance,
      role: isAdmin ? 'admin' : 'user',
      avatar: fbUser.photoURL || '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp',
      created_at: fbUser.metadata.creationTime || '',
    };
  }, [fbUser, balance, isAdmin]);

  // --- Catálogo del servidor (paquetes y datos de Yappy) ---
  useEffect(() => {
    llamarApi<any>('clicoins-catalogo', undefined, 'GET')
      .then((c) => {
        if (Array.isArray(c.paquetes)) {
          setPackages(
            c.paquetes.map((p: any) => ({
              id: p.id,
              coins: p.coins,
              bonus: p.bonus || 0,
              priceUsd: Number(p.precioUsd),
              name: p.name,
              tag: p.tag,
              popular: p.popular,
            }))
          );
        }
        if (c.yappy) setYappyInfo(c.yappy);
      })
      .catch(() => {
        /* se usan los paquetes locales */
      });
  }, []);

  // --- Datos en vivo del usuario ---
  useEffect(() => {
    const fb = firebase();
    if (!fb || !fbUser) {
      setBalance(0);
      setMovimientos([]);
      setSolicitudes([]);
      setBeneficios({});
      return;
    }
    const uid = fbUser.uid;
    const alFallar = (que: string) => (e: any) => {
      console.error(`[ClicCoins] No se pudo leer ${que}:`, e?.code || e);
      setErrorLectura(
        e?.code === 'permission-denied'
          ? 'Firebase bloqueó la lectura de tu billetera. Revisa que las reglas de Firestore estén publicadas.'
          : `No se pudo leer ${que} (${e?.code || 'error'}).`
      );
    };
    const perfil = { id: uid, username: fbUser.displayName || fbUser.email || '' } as UserProfile;
    const quitar = [
      onSnapshot(doc(fb.db, 'wallets', uid), (s) => { setErrorLectura(null); setBalance(s.exists() ? Number(s.data().balance || 0) : 0); }, alFallar('tu saldo')),
      onSnapshot(
        query(collection(fb.db, 'wallets', uid, 'movimientos'), orderBy('fecha', 'desc'), limit(50)),
        (s) => setMovimientos(s.docs.map((d) => movimientoATransaccion(d.id, d.data(), perfil))),
        alFallar('tu historial')
      ),
      onSnapshot(query(collection(fb.db, 'yappy_solicitudes'), where('uid', '==', uid)), (s) =>
        setSolicitudes(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
        alFallar('tus recargas Yappy')
      ),
      onSnapshot(doc(fb.db, 'beneficios', uid), (s) => setBeneficios(s.exists() ? s.data() : {}), alFallar('tus beneficios')),
    ];
    return () => quitar.forEach((f) => f());
  }, [fbUser]);

  // --- ¿Es administrador? ---
  useEffect(() => {
    if (!fbUser) {
      setIsAdmin(false);
      return;
    }
    llamarApi<{ admin: boolean }>('clicoins-admin', { accion: 'yo' })
      .then((r) => setIsAdmin(!!r.admin))
      .catch(() => setIsAdmin(false));
  }, [fbUser]);

  // Historial: movimientos reales + recargas Yappy aún no aprobadas
  const transactions: ClicTransaction[] = useMemo(() => {
    const abiertas = solicitudes
      .filter((s) => ['esperando-pago', 'pendiente', 'rechazada'].includes(s.estado))
      .map((s) => solicitudATransaccion(s, user));
    return [...abiertas, ...movimientos].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [solicitudes, movimientos, user]);

  const membresias = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries<any>(beneficios.membresias || {})) {
      out[k] = v && typeof v.toMillis === 'function' ? v.toMillis() : 0;
    }
    return out;
  }, [beneficios]);

  const items = useMemo(() => beneficios.items || {}, [beneficios]);

  // --- Sesión: acciones ---
  const conAuth = async (fn: () => Promise<unknown>, ok: string): Promise<Resultado> => {
    if (!firebaseConfigurado) return { success: false, message: 'El inicio de sesión aún no está configurado.' };
    try {
      await fn();
      return { success: true, message: ok };
    } catch (e) {
      return { success: false, message: mensajeAuth(e) };
    }
  };
  const loginWithGoogle = () => conAuth(() => signInWithPopup(firebase()!.auth, new GoogleAuthProvider()), '¡Bienvenido!');
  const loginWithEmail = (email: string, password: string) =>
    conAuth(() => signInWithEmailAndPassword(firebase()!.auth, email.trim(), password), '¡Bienvenido!');
  const registerWithEmail = (email: string, password: string) =>
    conAuth(() => createUserWithEmailAndPassword(firebase()!.auth, email.trim(), password), '¡Cuenta creada!');
  const resetPassword = (email: string) =>
    conAuth(() => sendPasswordResetEmail(firebase()!.auth, email.trim()), 'Te enviamos un correo para cambiar tu contraseña.');
  const logout = async () => {
    const fb = firebase();
    if (fb) await signOut(fb.auth);
  };

  // --- Recargas ---
  const paypalCreateOrder = async (packageId: string) => {
    const r = await llamarApi<{ orderId: string }>('paypal-crear', { paqueteId: packageId });
    return r.orderId;
  };

  const paypalCapture = async (orderId: string) => {
    try {
      const r = await llamarApi<any>('paypal-capturar', { orderId });
      if (r.pendiente) return { success: true, pending: true, message: r.mensaje };
      return {
        success: true,
        message: `¡Pago completado! Se acreditaron ${Number(r.coins).toLocaleString()} ClicCoins a tu cuenta.`,
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const yappyStart = (packageId: string) =>
    llamarApi<YappySolicitud>('yappy-solicitud', { accion: 'iniciar', paqueteId: packageId });

  const yappyConfirm = async (solicitudId: string, comprobante: string) => {
    try {
      const r = await llamarApi<any>('yappy-solicitud', { accion: 'confirmar', solicitudId, comprobante });
      return { success: true, message: r.mensaje };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const yappyCancel = async (solicitudId: string) => {
    try {
      await llamarApi('yappy-solicitud', { accion: 'cancelar', solicitudId });
      return { success: true, message: 'Recarga cancelada.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // --- Tienda ---
  const priceOf = useCallback((itemId: string) => precioServidor(itemId) as number | null, []);

  const purchaseWithCoins = async (
    itemId: string,
    itemName: string,
    _costCoins: number,
    extra?: { robloxUser?: string; discordUser?: string }
  ) => {
    if (!fbUser) {
      setWalletOpen(true);
      return { success: false, message: 'Inicia sesión para comprar con ClicCoins.' };
    }
    const precio = precioServidor(itemId);
    if (precio === null) {
      return { success: false, message: `${itemName} no está disponible para comprar con ClicCoins.` };
    }
    if (balance < precio) {
      return {
        success: false,
        message: `Saldo insuficiente. Tienes ${balance.toLocaleString()} ClicCoins y el artículo cuesta ${precio.toLocaleString()} ClicCoins.`,
      };
    }
    setLoading(true);
    try {
      const r = await llamarApi<any>('clicoins-comprar', {
        articuloId: itemId,
        compraId: idAleatorio(),
        robloxUser: extra?.robloxUser,
        discordUser: extra?.discordUser,
      });
      return {
        success: true,
        message: `¡Compra exitosa! Adquiriste ${r.articulo} por ${Number(r.precioCoins).toLocaleString()} ClicCoins. El staff lo entregará en tu cuenta.`,
        newBalance: r.saldo,
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  // --- Admin ---
  const adminListPayments = async (estado: 'pendiente' | 'esperando-pago' | 'aprobada' | 'rechazada') => {
    const r = await llamarApi<any>('clicoins-admin', { accion: 'yappy-listar', estado });
    return (r.solicitudes || []).map((s: any) => solicitudATransaccion(s));
  };

  const fetchPendingPayments = useCallback(async () => {
    if (!isAdmin) {
      setPendingPayments([]);
      return;
    }
    try {
      const r = await llamarApi<any>('clicoins-admin', { accion: 'yappy-listar', estado: 'pendiente' });
      setPendingPayments((r.solicitudes || []).map((s: any) => solicitudATransaccion(s)));
    } catch {
      /* se reintenta en el próximo ciclo */
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPendingPayments();
    if (!isAdmin) return;
    const t = setInterval(fetchPendingPayments, 30000);
    return () => clearInterval(t);
  }, [isAdmin, fetchPendingPayments]);

  const accionAdmin = async (cuerpo: any, ok: string): Promise<Resultado> => {
    try {
      const r = await llamarApi<any>('clicoins-admin', cuerpo);
      await fetchPendingPayments();
      return { success: true, message: typeof ok === 'string' ? ok : r.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const approvePayment = (id: string) => accionAdmin({ accion: 'yappy-aprobar', solicitudId: id }, 'Pago aprobado y ClicCoins acreditadas.');
  const rejectPayment = (id: string, reason?: string) =>
    accionAdmin({ accion: 'yappy-rechazar', solicitudId: id, motivo: reason || 'Pago no encontrado' }, 'Solicitud rechazada.');

  const adminListOrders = async (estado: 'por-entregar' | 'entregado') => {
    const r = await llamarApi<any>('clicoins-admin', { accion: 'pedidos-listar', estado });
    return r.pedidos as Pedido[];
  };
  const adminMarkDelivered = (pedidoId: string) =>
    accionAdmin({ accion: 'pedido-entregado', pedidoId }, 'Pedido marcado como entregado.');
  const adminAdjust = async (email: string, amount: number, reason: string) => {
    try {
      const r = await llamarApi<any>('clicoins-admin', { accion: 'ajustar', email, monto: amount, motivo: reason });
      return { success: true, message: `Listo. Nuevo saldo de ${email}: ${Number(r.saldo).toLocaleString()} ClicCoins.` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // El saldo se actualiza solo (en vivo); se deja por compatibilidad
  const refreshBalance = async () => {};

  return (
    <ClicCoinsContext.Provider
      value={{
        configurado: firebaseConfigurado,
        authReady,
        user,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        balance,
        transactions,
        packages,
        membresias,
        items,
        yappyInfo,
        loading,
        errorLectura,
        walletOpen,
        setWalletOpen,
        adminPanelOpen,
        setAdminPanelOpen,
        paypalCreateOrder,
        paypalCapture,
        yappyStart,
        yappyConfirm,
        yappyCancel,
        priceOf,
        purchaseWithCoins,
        isAdmin,
        pendingPayments,
        fetchPendingPayments,
        adminListPayments,
        approvePayment,
        rejectPayment,
        adminListOrders,
        adminMarkDelivered,
        adminAdjust,
        refreshBalance,
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

// Nombres legibles de las membresías (para "Mi cuenta")
export const NOMBRES_MEMBRESIAS: Record<string, string> = Object.fromEntries(
  Object.values(ARTICULOS as Record<string, any>)
    .filter((a) => a.tipo === 'membresia')
    .map((a) => [a.membresia, a.nombre.replace(/\s*\(.*\)\s*$/, '')])
);
