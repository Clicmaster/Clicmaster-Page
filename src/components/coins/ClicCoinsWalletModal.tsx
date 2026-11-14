import React, { useState } from 'react';
import { useClicCoins, CoinPackage } from '../../context/ClicCoinsContext.tsx';
import {
  Coins,
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  History,
  ShoppingBag,
  LogOut,
} from 'lucide-react';

export const ClicCoinsWalletModal: React.FC = () => {
  const {
    user,
    balance,
    transactions,
    packages,
    walletOpen,
    setWalletOpen,
    setAdminPanelOpen,
    buyCoinsRequest,
    isAdmin,
    logout,
  } = useClicCoins();

  const [activeTab, setActiveTab] = useState<'comprar' | 'historial' | 'cuenta'>('comprar');
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'Yappy' | 'Robux'>('Yappy');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null
  );

  // Set default package once loaded
  React.useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      const popular = packages.find((p) => p.popular) || packages[1];
      setSelectedPackage(popular);
    }
  }, [packages, selectedPackage]);

  if (!walletOpen) return null;

  const currentPkg = selectedPackage || packages[1] || {
    id: 'pack-500',
    coins: 500,
    bonus: 50,
    priceUsd: 7.99,
    priceRobux: 350,
    name: 'Pack Ciudadano',
  };

  const totalCoinsInPkg = currentPkg.coins + currentPkg.bonus;

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      setNotification({
        type: 'error',
        message: 'Debes ingresar el número de comprobante o referencia de pago.',
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await buyCoinsRequest({
        packageId: currentPkg.id,
        paymentMethod: selectedMethod,
        paymentReference: referenceNumber.trim(),
      });

      if (res.success) {
        const sentReference = referenceNumber.trim();
        setReferenceNumber('');
        setNotification({
          type: 'info',
          message: `¡Solicitud registrada! La transacción con referencia ${sentReference} quedó "En Revisión". Recibirás tus ClicCoins cuando un administrador confirme el pago.`,
        });
        setActiveTab('historial');
      } else {
        setNotification({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error al enviar solicitud' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#151518] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-[#67F23B] flex items-center justify-center text-[#121212] shadow-md">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                  Billetera ClicCoins
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#67F23B]/15 text-[#1e780d] dark:text-[#67F23B] border border-[#67F23B]/30">
                  Economía Oficial
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Moneda virtual del servidor CLICMaster Roleplay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Balance Card */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-right">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">Saldo:</span>
              <span className="text-base font-black text-neutral-900 dark:text-white tabular-nums text-amber-500">
                {balance.toLocaleString()} 🪙
              </span>
            </div>

            <button
              onClick={() => setWalletOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0 bg-white dark:bg-[#151518]">
          <button
            onClick={() => {
              setActiveTab('comprar');
              setNotification(null);
            }}
            className={`py-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'comprar'
                ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Comprar ClicCoins</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('historial');
              setNotification(null);
            }}
            className={`py-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'historial'
                ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial ({transactions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('cuenta');
              setNotification(null);
            }}
            className={`py-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'cuenta'
                ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAdmin ? 'Mi Cuenta & Admin' : 'Mi Cuenta'}</span>
          </button>
        </div>

        {/* Notification Banner */}
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

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: COMPRAR CLICCOINS */}
          {/* ========================================================= */}
          {activeTab === 'comprar' && (
            <div className="space-y-6">
              {/* Step 1: Elegir Paquete */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Paso 1: Selecciona tu Paquete de ClicCoins
                  </h4>
                  <span className="text-[11px] text-neutral-400">Entrega garantizada</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
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
                            className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              pkg.popular
                                ? 'bg-[#67F23B] text-[#121212]'
                                : 'bg-neutral-900 text-white dark:bg-neutral-700'
                            }`}
                          >
                            {pkg.tag}
                          </span>
                        )}

                        <div className="pt-1">
                          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                            {pkg.name}
                          </span>
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
                          <div className="text-sm font-black text-neutral-900 dark:text-white">
                            ${pkg.priceUsd} USD
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400">
                            {pkg.priceRobux} Robux
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Método de Pago */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                  Paso 2: Elige tu Método de Pago
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PayPal: desactivado hasta conectar la verificación real con PayPal */}
                  <div
                    aria-disabled="true"
                    title="PayPal estará disponible próximamente"
                    className="p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 opacity-50 cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0070BA]/15 text-[#0070BA] font-black text-sm flex items-center justify-center shrink-0">
                      PP
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-neutral-900 dark:text-white">PayPal</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-neutral-500 text-white">
                          Próximamente
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">Aún no disponible</p>
                    </div>
                  </div>

                  {/* Yappy (Semicontrolada) */}
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
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-[#00B4D8] text-white">
                          Validación
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">Pago móvil Panamá / Latam</p>
                    </div>
                  </div>

                  {/* Robux (Semicontrolada) */}
                  <div
                    onClick={() => setSelectedMethod('Robux')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 ${
                      selectedMethod === 'Robux'
                        ? 'border-neutral-800 dark:border-neutral-400 ring-2 ring-neutral-400/25 bg-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#121212] font-black text-sm flex items-center justify-center shrink-0">
                      R$
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-neutral-900 dark:text-white">Robux</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-neutral-700 text-white">
                          Gamepass
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">Canje oficial en Roblox</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Checkout Action Form */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                {selectedMethod === 'Yappy' && (
                  <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                      {/* Merchant Box */}
                      <div className="p-4 rounded-xl bg-[#00B4D8]/10 border border-[#00B4D8]/30 flex-1 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#007799] dark:text-[#00B4D8]">
                          Datos para Enviar Yappy
                        </span>
                        <div className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          CLICMASTER LATAM INC.
                        </div>
                        <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                          Teléfono: <strong>+507 6829-4411</strong>
                        </div>
                        <div className="text-xs font-bold text-[#00B4D8]">
                          Monto a enviar: ${currentPkg.priceUsd} USD
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5 justify-center flex flex-col">
                        <p>1. Abre tu app Banco General o Yappy.</p>
                        <p>2. Envía <strong>${currentPkg.priceUsd} USD</strong> al <strong>+507 6829-4411</strong>.</p>
                        <p>3. Copia el número de comprobante o referencia y pégalo abajo.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          Número de Transacción / Boleta Yappy *
                        </label>
                        <input
                          type="text"
                          required
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="Ej: YP-98421049 ó 849201"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#00B4D8] hover:bg-[#0096b4] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>
                          {isSubmitting ? 'Registrando transacción...' : 'Registrar Pago y Enviar a Revisión'}
                        </span>
                      </button>
                    </div>

                    <p className="text-[11px] text-neutral-400 text-center">
                      ⏱ Las recargas por Yappy son validadas por un administrador del servidor en un lapso habitual de 5 a 15 minutos.
                    </p>
                  </form>
                )}

                {selectedMethod === 'Robux' && (
                  <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                      {/* Robux Box */}
                      <div className="p-4 rounded-xl bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex-1 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                          Paso Oficial en Roblox
                        </span>
                        <div className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          Gamepass / DevProduct Oficial
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-300">
                          Costo: <strong>{currentPkg.priceRobux} Robux</strong>
                        </div>
                        <a
                          href="https://www.roblox.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#2B6BFF] hover:underline font-bold"
                        >
                          <span>Abrir Gamepass en Roblox</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5 justify-center flex flex-col">
                        <p>1. Compra el Gamepass correspondiente en Roblox con tu cuenta <strong>@{user?.roblox_username}</strong>.</p>
                        <p>2. Pega abajo el ID de transacción de la compra.</p>
                        <p>3. Un administrador verificará la compra y te acreditará las ClicCoins.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                          ID de Transacción / Comprobante Roblox *
                        </label>
                        <input
                          type="text"
                          required
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="Ej: RBX-4920491"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#121212] dark:bg-white text-white dark:text-[#121212] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        {isSubmitting ? 'Registrando canje de Robux...' : 'Registrar Canje de Robux'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HISTORIAL DE TRANSACCIONES */}
          {/* ========================================================= */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Tus Movimientos Registrados
                </h4>
                <span className="text-xs text-neutral-400">
                  {transactions.length} transacciones registradas
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 space-y-2">
                  <History className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm">Aún no tienes movimientos registrados en ClicCoins.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {transactions.map((tx) => {
                    const isPositive = tx.tipo === 'compra_coins' || tx.tipo === 'bonificacion';
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
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-neutral-900 dark:text-white">
                                {tx.detalles || tx.tipo}
                              </span>
                              {/* Status Badge */}
                              <span
                                className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                                  tx.estado === 'completado'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                    : tx.estado === 'pendiente'
                                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/20'
                                    : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20'
                                }`}
                              >
                                {tx.estado === 'completado'
                                  ? 'Completado'
                                  : tx.estado === 'pendiente'
                                  ? 'En Revisión'
                                  : 'Rechazado'}
                              </span>
                            </div>

                            <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono">
                              <span>Ref: {tx.referencia_pago}</span>
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
                              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                                Motivo: {tx.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
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
                            <div className="text-[10px] text-neutral-400">
                              {tx.moneda === 'ROBUX' || tx.metodo_pago === 'Robux'
                                ? `${tx.monto_dinero_real} Robux`
                                : `$${tx.monto_dinero_real} USD`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CUENTA & ACCESO ADMIN */}
          {/* ========================================================= */}
          {activeTab === 'cuenta' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-contain bg-neutral-950 p-1 border border-neutral-800"
                    />
                    <div>
                      <h4 className="text-base font-black text-neutral-900 dark:text-white">
                        {user?.username}
                      </h4>
                      <p className="text-xs text-neutral-400">Roblox: @{user?.roblox_username}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      isAdmin
                        ? 'bg-[#67F23B] text-[#121212]'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Rol: {user?.role}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-neutral-400">
                    Cuenta creada el {user ? new Date(user.created_at).toLocaleDateString('es-PA') : ''}
                  </p>

                  <button
                    onClick={logout}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>

              {/* Panel Admin Shortcut (solo administradores) */}
              {isAdmin && (
              <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#67F23B]" />
                    <h5 className="text-sm font-black">Panel de Aprobación de Pagos (Admin)</h5>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Revisa en tiempo real las solicitudes de recarga por Yappy y Robux para aprobar o rechazar con 1 clic.
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
        </div>
      </div>
    </div>
  );
};
