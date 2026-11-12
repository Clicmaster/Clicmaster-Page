import React, { useEffect, useState } from 'react';
import {
  useClicCoins,
  PaymentMethod,
  CoinPackage,
  YappySolicitud,
  NOMBRES_MEMBRESIAS,
} from '../../context/ClicCoinsContext.tsx';
import {
  Coins,
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ShieldCheck,
  History,
  ShoppingBag,
  LogOut,
  Mail,
  Copy,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PayPalCheckout } from './PayPalCheckout.tsx';

type Aviso = { type: 'success' | 'error' | 'info'; message: string } | null;

// ============================================================================
// Inicio de sesión (se muestra dentro de la billetera si no hay sesión)
// ============================================================================
const LoginPanel: React.FC<{ setAviso: (a: Aviso) => void }> = ({ setAviso }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useClicCoins();
  const [modo, setModo] = useState<'entrar' | 'crear'>('entrar');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const ejecutar = async (fn: () => Promise<{ success: boolean; message: string }>) => {
    setOcupado(true);
    setAviso(null);
    const r = await fn();
    setOcupado(false);
    if (!r.success) setAviso({ type: 'error', message: r.message });
    return r;
  };

  return (
    <div className="max-w-sm mx-auto py-4 space-y-5 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-[#67F23B] flex items-center justify-center text-[#121212] shadow-md">
        <Coins className="w-7 h-7" />
      </div>
      <div>
        <h4 className="text-lg font-black text-neutral-900 dark:text-white">Entra a tu billetera</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Inicia sesión para ver tu saldo, recargar ClicCoins y comprar en la tienda.
        </p>
      </div>

      <button
        disabled={ocupado}
        onClick={() => ejecutar(loginWithGoogle)}
        className="w-full py-3 px-4 rounded-xl bg-white text-neutral-800 border border-neutral-300 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
      >
        <span className="font-black text-base text-[#4285F4]">G</span>
        Continuar con Google
      </button>

      <div className="text-[11px] uppercase tracking-wider text-neutral-400">o con tu correo</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ejecutar(() => (modo === 'entrar' ? loginWithEmail(email, clave) : registerWithEmail(email, clave)));
        }}
        className="space-y-2.5 text-left"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
        />
        <input
          type="password"
          required
          minLength={6}
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Contraseña (mínimo 6 caracteres)"
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
        />
        <button
          type="submit"
          disabled={ocupado}
          className="w-full py-3 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          {modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs">
        <button className="text-neutral-500 hover:underline" onClick={() => setModo(modo === 'entrar' ? 'crear' : 'entrar')}>
          {modo === 'entrar' ? '¿No tienes cuenta? Créala' : '¿Ya tienes cuenta? Entra'}
        </button>
        <button
          className="text-neutral-500 hover:underline"
          onClick={async () => {
            if (!email) return setAviso({ type: 'error', message: 'Escribe tu correo primero.' });
            const r = await resetPassword(email);
            setAviso({ type: r.success ? 'success' : 'error', message: r.message });
          }}
        >
          Olvidé mi contraseña
        </button>
      </div>
      <p className="text-[11px] text-neutral-400">
        Si eres menor de edad, pide a tu padre, madre o tutor que haga las compras contigo.
      </p>
    </div>
  );
};

// ============================================================================
// Pago con Yappy (código único + comprobante + revisión del admin)
// ============================================================================
const YappyCheckout: React.FC<{ pkg: CoinPackage; total: number; setAviso: (a: Aviso) => void; onDone: () => void }> = ({
  pkg,
  total,
  setAviso,
  onDone,
}) => {
  const { yappyInfo, yappyStart, yappyConfirm, yappyCancel } = useClicCoins();
  const [sol, setSol] = useState<YappySolicitud | null>(null);
  const [comprobante, setComprobante] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    setSol(null);
    setComprobante('');
  }, [pkg.id]);

  if (!yappyInfo.activo) {
    return (
      <p className="text-sm text-neutral-500 text-center py-4">
        Los pagos con Yappy estarán disponibles muy pronto. Por ahora puedes recargar con PayPal.
      </p>
    );
  }

  const generar = async () => {
    setOcupado(true);
    setAviso(null);
    try {
      setSol(await yappyStart(pkg.id));
    } catch (e: any) {
      setAviso({ type: 'error', message: e.message });
    }
    setOcupado(false);
  };

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sol) return;
    setOcupado(true);
    const r = await yappyConfirm(sol.solicitudId, comprobante);
    setOcupado(false);
    if (r.success) {
      setAviso({
        type: 'info',
        message: `¡Recibido! Tu pago Yappy (código ${sol.codigo}) quedó "En revisión". Cuando lo confirmemos verás tus ClicCoins.`,
      });
      setSol(null);
      setComprobante('');
      onDone();
    } else setAviso({ type: 'error', message: r.message });
  };

  if (!sol) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5">
          <p>
            Recibirás <strong className="text-neutral-900 dark:text-white">{total.toLocaleString()} ClicCoins</strong> por{' '}
            <strong className="text-neutral-900 dark:text-white">${pkg.priceUsd.toFixed(2)} USD</strong>.
          </p>
          <p>Primero genera tu código de pago. Lo escribirás en el mensaje del Yappy para que podamos identificarlo.</p>
        </div>
        <button
          onClick={generar}
          disabled={ocupado}
          className="w-full py-3.5 px-6 rounded-xl bg-[#00B4D8] hover:bg-[#0096b4] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
        >
          <QrCode className="w-4 h-4" />
          {ocupado ? 'Generando…' : 'Generar código de pago Yappy'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={confirmar} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="p-4 rounded-xl bg-[#00B4D8]/10 border border-[#00B4D8]/30 flex-1 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#007799] dark:text-[#00B4D8]">
            Datos para enviar Yappy
          </span>
          <div className="text-sm font-extrabold text-neutral-900 dark:text-white">{sol.yappyNombre}</div>
          <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
            Teléfono: <strong>{sol.yappyNumero}</strong>
          </div>
          <div className="text-xs font-bold text-[#00B4D8]">Monto exacto: ${sol.precioUsd} USD</div>
          <div className="pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Escribe en el mensaje:</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(sol.codigo)}
              className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#121212] text-[#67F23B] font-mono font-black text-lg tracking-wider"
              title="Copiar código"
            >
              {sol.codigo}
              <Copy className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5 justify-center flex flex-col">
          <p>1. Abre tu app de Banco General o Yappy.</p>
          <p>
            2. Envía <strong>${sol.precioUsd} USD</strong> al <strong>{sol.yappyNumero}</strong>.
          </p>
          <p>
            3. En el mensaje/descripción escribe <strong>{sol.codigo}</strong>.
          </p>
          <p>4. Copia el número de comprobante y pégalo abajo.</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
          Número de comprobante de Yappy *
        </label>
        <input
          type="text"
          required
          minLength={4}
          value={comprobante}
          onChange={(e) => setComprobante(e.target.value)}
          placeholder="Ej: 849201"
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      <button
        type="submit"
        disabled={ocupado || comprobante.trim().length < 4}
        className="w-full py-3.5 px-6 rounded-xl bg-[#00B4D8] hover:bg-[#0096b4] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
      >
        <CheckCircle2 className="w-4 h-4" />
        {ocupado ? 'Enviando…' : 'Ya pagué: enviar a revisión'}
      </button>

      <div className="flex items-center justify-between text-[11px] text-neutral-400">
        <span>⏱ Un administrador revisa los pagos Yappy, normalmente el mismo día.</span>
        <button
          type="button"
          className="underline hover:text-red-500"
          onClick={async () => {
            const r = await yappyCancel(sol.solicitudId);
            setAviso({ type: r.success ? 'info' : 'error', message: r.message });
            if (r.success) setSol(null);
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// Billetera
// ============================================================================
export const ClicCoinsWalletModal: React.FC = () => {
  const {
    configurado,
    authReady,
    user,
    logout,
    balance,
    transactions,
    packages,
    membresias,
    items,
    walletOpen,
    setWalletOpen,
    setAdminPanelOpen,
    isAdmin,
    errorLectura,
  } = useClicCoins();

  const [activeTab, setActiveTab] = useState<'comprar' | 'historial' | 'cuenta'>('comprar');
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PayPal');
  const [notification, setNotification] = useState<Aviso>(null);

  useEffect(() => {
    if (packages.length > 0 && (!selectedPackage || !packages.find((p) => p.id === selectedPackage.id))) {
      setSelectedPackage(packages.find((p) => p.popular) || packages[0]);
    }
  }, [packages, selectedPackage]);

  if (!walletOpen) return null;

  const currentPkg = selectedPackage || packages[0];
  const totalCoinsInPkg = currentPkg ? currentPkg.coins + currentPkg.bonus : 0;

  const onPaypalResult = (r: { type: 'success' | 'error' | 'info'; message: string }) => {
    setNotification(r);
    if (r.type === 'success') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveTab('historial');
    }
  };

  const ahora = Date.now();
  const membresiasActivas = Object.entries(membresias).filter(([, hasta]) => hasta > ahora);
  const listaItems = Object.entries(items);

  const tabBtn = (id: 'comprar' | 'historial' | 'cuenta', icon: React.ReactNode, label: string) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setNotification(null);
      }}
      className={`py-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 flex items-center gap-2 transition-colors ${
        activeTab === id
          ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#151518] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Barra superior */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-[#67F23B] flex items-center justify-center text-[#121212] shadow-md">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">Billetera ClicCoins</h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#67F23B]/15 text-[#1e780d] dark:text-[#67F23B] border border-[#67F23B]/30">
                  Economía Oficial
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user ? user.email : 'Moneda virtual del servidor CLICMaster Roleplay'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-right">
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">Saldo:</span>
                <span className="text-base font-black tabular-nums text-amber-500">{balance.toLocaleString()} 🪙</span>
              </div>
            )}
            <button
              onClick={() => setWalletOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {user && (
          <div className="px-6 border-b border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0 bg-white dark:bg-[#151518] overflow-x-auto">
            {tabBtn('comprar', <CreditCard className="w-4 h-4" />, 'Comprar ClicCoins')}
            {tabBtn('historial', <History className="w-4 h-4" />, `Historial (${transactions.length})`)}
            {tabBtn('cuenta', <ShieldCheck className="w-4 h-4" />, isAdmin ? 'Mi Cuenta & Admin' : 'Mi Cuenta')}
          </div>
        )}

        {user && errorLectura && (
          <div className="mx-6 mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shrink-0 bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1">{errorLectura}</p>
          </div>
        )}

        {notification && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shrink-0 ${
              notification.type === 'success'
                ? 'bg-[#67F23B]/15 text-[#135708] dark:text-[#67F23B] border border-[#67F23B]/30'
                : notification.type === 'error'
                ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
                : 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-5 h-5 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 shrink-0" />
            )}
            <p className="flex-1">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!configurado ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm font-bold">La billetera ClicCoins se está activando.</p>
              <p className="text-xs">Vuelve pronto para recargar y comprar.</p>
            </div>
          ) : !authReady ? (
            <p className="text-center text-sm text-neutral-500 py-12">Cargando…</p>
          ) : !user ? (
            <LoginPanel setAviso={setNotification} />
          ) : (
            <>
              {/* ===================== COMPRAR ===================== */}
              {activeTab === 'comprar' && currentPkg && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        Paso 1: Selecciona tu Paquete de ClicCoins
                      </h4>
                      <span className="text-[11px] text-neutral-400">Precios en USD</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {packages.map((pkg) => {
                        const isSelected = currentPkg.id === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 text-center flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#67F23B] ring-2 ring-[#67F23B]/30 bg-[#67F23B]/5 dark:bg-[#67F23B]/10 shadow-md'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                            }`}
                          >
                            {pkg.tag && (
                              <span
                                className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                                  pkg.popular ? 'bg-[#67F23B] text-[#121212]' : 'bg-neutral-900 text-white dark:bg-neutral-700'
                                }`}
                              >
                                {pkg.tag}
                              </span>
                            )}
                            <div className="pt-1">
                              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{pkg.name}</span>
                              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums mt-0.5">
                                {pkg.coins.toLocaleString()}
                              </div>
                              {pkg.bonus > 0 ? (
                                <span className="inline-block text-[10px] font-extrabold text-[#1a6e0c] dark:text-[#67F23B] bg-[#67F23B]/10 px-1.5 py-0.5 rounded-md mt-1">
                                  +{pkg.bonus} Bono
                                </span>
                              ) : (
                                <span className="inline-block text-[10px] text-neutral-400 mt-1">Sin bono</span>
                              )}
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
                              <div className="text-sm font-black text-neutral-900 dark:text-white">${pkg.priceUsd.toFixed(2)} USD</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                      Paso 2: Elige tu Método de Pago
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setSelectedMethod('PayPal')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 ${
                          selectedMethod === 'PayPal'
                            ? 'border-[#0070BA] ring-2 ring-[#0070BA]/25 bg-[#0070BA]/5 dark:bg-[#0070BA]/10'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#0070BA]/15 text-[#0070BA] font-black text-sm flex items-center justify-center shrink-0">
                          PP
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-neutral-900 dark:text-white">PayPal / Tarjeta</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-[#0070BA] text-white">Automático</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 truncate">Acreditación al instante</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedMethod('Yappy')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 ${
                          selectedMethod === 'Yappy'
                            ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/25 bg-[#00B4D8]/5 dark:bg-[#00B4D8]/10'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/15 text-[#00B4D8] font-black text-sm flex items-center justify-center shrink-0">
                          YP
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-neutral-900 dark:text-white">Yappy</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-[#00B4D8] text-white">Validación</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 truncate">Pago móvil Panamá</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                    {selectedMethod === 'PayPal' ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                          <div>
                            <h5 className="text-sm font-black text-neutral-900 dark:text-white">Pago con PayPal o tarjeta</h5>
                            <p className="text-xs text-neutral-500">
                              Recibirás{' '}
                              <strong className="text-neutral-900 dark:text-white">{totalCoinsInPkg.toLocaleString()} ClicCoins</strong>{' '}
                              por <strong className="text-neutral-900 dark:text-white">${currentPkg.priceUsd.toFixed(2)} USD</strong>.
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-neutral-400">Total a pagar</span>
                            <div className="text-2xl font-black text-[#0070BA]">${currentPkg.priceUsd.toFixed(2)} USD</div>
                          </div>
                        </div>
                        <PayPalCheckout packageId={currentPkg.id} onResult={onPaypalResult} />
                        <p className="text-[11px] text-neutral-400 text-center">
                          🔒 Pago procesado por PayPal. Tus ClicCoins se acreditan en cuanto PayPal confirma el cobro.
                        </p>
                      </div>
                    ) : (
                      <YappyCheckout
                        pkg={currentPkg}
                        total={totalCoinsInPkg}
                        setAviso={setNotification}
                        onDone={() => setActiveTab('historial')}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ===================== HISTORIAL ===================== */}
              {activeTab === 'historial' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Tus Movimientos
                    </h4>
                    <span className="text-xs text-neutral-400">{transactions.length} registros</span>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 space-y-2">
                      <History className="w-8 h-8 mx-auto opacity-50" />
                      <p className="text-sm">Aún no tienes movimientos en ClicCoins.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {transactions.map((tx) => {
                        const isPositive = tx.signo > 0;
                        return (
                          <div
                            key={tx.id}
                            className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  tx.tipo === 'compra_coins'
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : tx.tipo === 'gasto_tienda'
                                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {tx.tipo === 'compra_coins' ? (
                                  <Coins className="w-4 h-4" />
                                ) : tx.tipo === 'gasto_tienda' ? (
                                  <ShoppingBag className="w-4 h-4" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-extrabold text-neutral-900 dark:text-white">{tx.detalles || tx.tipo}</span>
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                                      tx.estado === 'completado'
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                        : tx.estado === 'pendiente'
                                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/20'
                                        : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20'
                                    }`}
                                  >
                                    {tx.estado === 'completado' ? 'Completado' : tx.estado === 'pendiente' ? 'En Revisión' : 'Rechazado'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono">
                                  {tx.codigo_yappy && <span>Código: {tx.codigo_yappy}</span>}
                                  <span>Método: {tx.metodo_pago}</span>
                                  <span>
                                    {new Date(tx.timestamp).toLocaleDateString('es-PA', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {tx.rejection_reason && (
                                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">Motivo: {tx.rejection_reason}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={`text-base font-black tabular-nums ${
                                  isPositive ? 'text-emerald-600 dark:text-[#67F23B]' : 'text-neutral-900 dark:text-white'
                                }`}
                              >
                                {isPositive ? '+' : '-'}
                                {tx.cantidad_coins.toLocaleString()} ClicCoins
                              </span>
                              {tx.monto_dinero_real > 0 && (
                                <div className="text-[10px] text-neutral-400">${tx.monto_dinero_real.toFixed(2)} USD</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ===================== CUENTA ===================== */}
              {activeTab === 'cuenta' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-950 border border-neutral-800"
                        />
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-neutral-900 dark:text-white truncate">{user.username}</h4>
                          <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <h5 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      Mis membresías y artículos
                    </h5>
                    {membresiasActivas.length === 0 && listaItems.length === 0 ? (
                      <p className="text-xs text-neutral-500">Todavía no has comprado nada en la tienda.</p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {membresiasActivas.map(([id, hasta]) => (
                          <li key={id} className="flex justify-between gap-3">
                            <span className="font-bold text-neutral-900 dark:text-white">{NOMBRES_MEMBRESIAS[id] || id}</span>
                            <span className="text-xs text-emerald-600 dark:text-[#67F23B]">
                              activa hasta {new Date(hasta).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </li>
                        ))}
                        {listaItems.map(([id, it]) => (
                          <li key={id} className="flex justify-between gap-3">
                            <span className="font-bold text-neutral-900 dark:text-white">{it.nombre}</span>
                            {it.veces > 1 && <span className="text-xs text-neutral-500">x{it.veces}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#67F23B]" />
                          <h5 className="text-sm font-black">Panel de Administración</h5>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Aprueba recargas Yappy, entrega pedidos y ajusta saldos.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setWalletOpen(false);
                          setAdminPanelOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#67F23B] text-[#121212] font-black text-xs hover:bg-[#52db28] transition-colors shrink-0"
                      >
                        Abrir Panel Admin
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
