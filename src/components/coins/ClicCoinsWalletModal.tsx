import React, { useState } from 'react';
import { useClicCoins, CoinPackage, RechargeMethod } from '../../context/ClicCoinsContext.tsx';
import {
  Coins,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  History,
  ShoppingBag,
  LogOut,
  Package,
  Truck,
  Undo2,
  Send,
} from 'lucide-react';

type Tab = 'recargar' | 'historial' | 'pedidos' | 'cuenta';

const ORDER_STATUS_LABEL = {
  pendiente_entrega: { text: 'Pendiente de entrega', cls: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/20' },
  entregado: { text: 'Entregado', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  cancelado: { text: 'Cancelado y devuelto', cls: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20' },
} as const;

export const ClicCoinsWalletModal: React.FC = () => {
  const {
    user,
    balance,
    transactions,
    orders,
    packages,
    paymentMethods,
    walletOpen,
    setWalletOpen,
    setAdminPanelOpen,
    buyCoinsRequest,
    isAdmin,
    logout,
  } = useClicCoins();

  const [activeTab, setActiveTab] = useState<Tab>('recargar');
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<RechargeMethod | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Paquete por defecto: el más popular
  React.useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages.find((p) => p.popular) || packages[0]);
    }
  }, [packages, selectedPackage]);

  // Método por defecto: el primero disponible
  React.useEffect(() => {
    const available: RechargeMethod[] = [];
    if (paymentMethods.yappy.available) available.push('Yappy');
    if (paymentMethods.paypal.available) available.push('PayPal');
    if (!selectedMethod || !available.includes(selectedMethod)) setSelectedMethod(available[0] || null);
  }, [paymentMethods, selectedMethod]);

  if (!walletOpen) return null;

  const currentPkg = selectedPackage || packages[0];
  const totalCoinsInPkg = currentPkg ? currentPkg.coins + currentPkg.bonus : 0;
  const noMethods = !paymentMethods.yappy.available && !paymentMethods.paypal.available;

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !currentPkg) return;
    if (!referenceNumber.trim()) {
      setNotification({ type: 'error', message: 'Escribe el número de comprobante o referencia del pago.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    const res = await buyCoinsRequest({
      packageId: currentPkg.id,
      paymentMethod: selectedMethod,
      paymentReference: referenceNumber.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      const sentReference = referenceNumber.trim();
      setReferenceNumber('');
      setNotification({
        type: 'info',
        message: `¡Solicitud registrada! Tu pago con referencia ${sentReference} quedó "En Revisión". Recibirás ${totalCoinsInPkg.toLocaleString()} ClicCoins cuando un administrador lo confirme.`,
      });
      setActiveTab('historial');
    } else {
      setNotification({ type: 'error', message: res.message });
    }
  };

  const tabButton = (tab: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setNotification(null);
      }}
      className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-extrabold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
        activeTab === tab
          ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const methodCard = (method: RechargeMethod, short: string, color: string, subtitle: string) => {
    const available = method === 'Yappy' ? paymentMethods.yappy.available : paymentMethods.paypal.available;
    const selected = selectedMethod === method;
    return (
      <button
        type="button"
        disabled={!available}
        onClick={() => setSelectedMethod(method)}
        className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 ${
          !available
            ? 'opacity-50 cursor-not-allowed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
            : selected
              ? 'bg-neutral-50 dark:bg-neutral-800'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
        }`}
        style={selected && available ? { borderColor: color, boxShadow: `0 0 0 2px ${color}40` } : undefined}
      >
        <div
          className="w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0"
          style={{ background: `${color}26`, color }}
        >
          {short}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-neutral-900 dark:text-white">{method}</span>
            <span
              className="px-1.5 py-0.5 text-[9px] font-black rounded-md text-white"
              style={{ background: available ? color : '#737373' }}
            >
              {available ? 'Verificación manual' : 'No disponible'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 truncate">{available ? subtitle : 'Aún no configurado'}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#151518] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-[#67F23B] flex items-center justify-center text-[#121212] shadow-md">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">Billetera ClicCoins</h3>
                <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#67F23B]/15 text-[#1e780d] dark:text-[#67F23B] border border-[#67F23B]/30">
                  Moneda oficial
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Todo en la página se compra con ClicCoins</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">Saldo:</span>
              <span className="text-base font-black tabular-nums text-amber-500">{balance.toLocaleString()} 🪙</span>
            </div>
            <button
              onClick={() => setWalletOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Cerrar billetera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 flex gap-1 sm:gap-2 shrink-0 overflow-x-auto bg-white dark:bg-[#151518]">
          {tabButton('recargar', <CreditCard className="w-4 h-4" />, 'Recargar')}
          {tabButton('historial', <History className="w-4 h-4" />, `Historial (${transactions.length})`)}
          {tabButton('pedidos', <Package className="w-4 h-4" />, `Mis pedidos (${orders.length})`)}
          {tabButton('cuenta', <ShieldCheck className="w-4 h-4" />, isAdmin ? 'Mi cuenta & Admin' : 'Mi cuenta')}
        </div>

        {/* Aviso */}
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
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100" aria-label="Cerrar aviso">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================================================= RECARGAR */}
          {activeTab === 'recargar' && (
            <div className="space-y-6">
              {/* Paso 1: paquete */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                  Paso 1: Elige tu paquete de ClicCoins
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-3.5 rounded-2xl border transition-all duration-200 text-center flex flex-col justify-between ${
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
                        <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-sm font-black text-neutral-900 dark:text-white">
                          ${pkg.priceUsd} USD
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paso 2: método */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                  Paso 2: Elige cómo pagar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {methodCard('Yappy', 'YP', '#00B4D8', 'Pago móvil en Panamá')}
                  {methodCard('PayPal', 'PP', '#0070BA', 'Pago internacional')}
                </div>
              </div>

              {/* Paso 3: pagar y enviar comprobante */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                {noMethods || !selectedMethod || !currentPkg ? (
                  <div className="text-center py-6 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-neutral-400" />
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      Las recargas estarán disponibles muy pronto.
                    </p>
                    <p className="text-xs text-neutral-500">
                      El equipo está configurando los métodos de pago. Vuelve en un rato o pregunta en nuestro Discord.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRechargeSubmit} className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Paso 3: Paga y envía tu comprobante
                    </h4>
                    <div className="flex flex-col md:flex-row gap-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                      {selectedMethod === 'Yappy' ? (
                        <div className="p-4 rounded-xl bg-[#00B4D8]/10 border border-[#00B4D8]/30 flex-1 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#007799] dark:text-[#00B4D8]">
                            Datos para enviar por Yappy
                          </span>
                          <div className="text-sm font-extrabold text-neutral-900 dark:text-white">
                            {paymentMethods.yappy.holder}
                          </div>
                          <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                            Teléfono: <strong>{paymentMethods.yappy.phone}</strong>
                          </div>
                          <div className="text-xs font-bold text-[#00B4D8]">Monto a enviar: ${currentPkg.priceUsd} USD</div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-[#0070BA]/10 border border-[#0070BA]/30 flex-1 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#0070BA]">
                            Datos para pagar por PayPal
                          </span>
                          {paymentMethods.paypal.email && (
                            <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 break-all">
                              Enviar a: <strong>{paymentMethods.paypal.email}</strong>
                            </div>
                          )}
                          {paymentMethods.paypal.link && (
                            <a
                              href={paymentMethods.paypal.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#0070BA] hover:underline font-bold"
                            >
                              <span>Abrir PayPal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <div className="text-xs font-bold text-[#0070BA]">Monto a enviar: ${currentPkg.priceUsd} USD</div>
                        </div>
                      )}

                      <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5 justify-center flex flex-col">
                        <p>
                          1. Envía <strong>${currentPkg.priceUsd} USD</strong> por {selectedMethod} con los datos de la izquierda.
                        </p>
                        <p>2. Copia el número de comprobante o ID de la transacción.</p>
                        <p>
                          3. Pégalo abajo. Recibirás <strong>{totalCoinsInPkg.toLocaleString()} ClicCoins</strong> cuando lo verifiquemos.
                        </p>
                        {(selectedMethod === 'Yappy' ? paymentMethods.yappy.instructions : paymentMethods.paypal.instructions) && (
                          <p className="text-neutral-700 dark:text-neutral-300 font-semibold">
                            Nota:{' '}
                            {selectedMethod === 'Yappy' ? paymentMethods.yappy.instructions : paymentMethods.paypal.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        {selectedMethod === 'Yappy' ? 'Número de comprobante de Yappy *' : 'ID de transacción de PayPal *'}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={64}
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder={selectedMethod === 'Yappy' ? 'Ej: 849201 o YP-98421049' : 'Ej: 8AB12345CD678901E'}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#121212] dark:bg-[#67F23B] text-white dark:text-[#121212] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Enviando...' : 'Enviar comprobante a revisión'}</span>
                    </button>

                    <p className="text-[11px] text-neutral-400 text-center">
                      ⏱ Un administrador verifica cada pago a mano antes de acreditar tus ClicCoins.
                    </p>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ================================================= HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Tus movimientos de ClicCoins
              </h4>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 space-y-2">
                  <History className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm">Aún no tienes movimientos.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {transactions.map((tx) => {
                    const isPositive = tx.tipo === 'compra_coins' || tx.tipo === 'bonificacion' || tx.tipo === 'reembolso';
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
                            ) : tx.tipo === 'reembolso' ? (
                              <Undo2 className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-neutral-900 dark:text-white">{tx.detalles || tx.tipo}</span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${
                                  tx.estado === 'completado'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                    : tx.estado === 'pendiente'
                                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20'
                                }`}
                              >
                                {tx.estado === 'completado' ? 'Completado' : tx.estado === 'pendiente' ? 'En revisión' : 'Rechazado'}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono">
                              <span>Ref: {tx.referencia_pago}</span>
                              {tx.tipo === 'compra_coins' && <span>Método: {tx.metodo_pago}</span>}
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
                              tx.estado === 'rechazado'
                                ? 'text-neutral-400 line-through'
                                : isPositive
                                  ? 'text-emerald-600 dark:text-[#67F23B]'
                                  : 'text-neutral-900 dark:text-white'
                            }`}
                          >
                            {isPositive ? '+' : '-'}
                            {tx.cantidad_coins.toLocaleString()} ClicCoins
                          </span>
                          {tx.monto_dinero_real > 0 && (
                            <div className="text-[10px] text-neutral-400">
                              {tx.moneda === 'ROBUX' ? `${tx.monto_dinero_real} Robux` : `$${tx.monto_dinero_real} USD`}
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

          {/* ================================================= MIS PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Tus compras en la tienda
              </h4>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 space-y-2">
                  <Package className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm">Aún no has comprado nada en la tienda.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((order) => {
                    const status = ORDER_STATUS_LABEL[order.estado];
                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs sm:text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.envio ? <Truck className="w-4 h-4 text-neutral-500" /> : <Package className="w-4 h-4 text-neutral-500" />}
                            <span className="font-extrabold text-neutral-900 dark:text-white">{order.item_name}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${status.cls}`}>
                              {status.text}
                            </span>
                          </div>
                          <span className="font-black tabular-nums text-neutral-900 dark:text-white">
                            🪙 {order.cost_coins.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                          <span>Pedido: {order.id}</span>
                          <span>{new Date(order.timestamp).toLocaleString('es-PA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          {order.opciones?.talla && <span>Talla: {order.opciones.talla}</span>}
                          {order.opciones?.color && <span>Color: {order.opciones.color}</span>}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {order.estado === 'pendiente_entrega'
                            ? order.envio
                              ? `Prepararemos tu envío a ${order.envio.pais}. Te contactaremos al ${order.envio.telefono}.`
                              : `Lo entregaremos a tu cuenta de Roblox @${order.roblox_username}.`
                            : order.estado === 'entregado'
                              ? `Entregado${order.nota_entrega ? `: ${order.nota_entrega}` : '.'}`
                              : `Cancelado: ${order.motivo_cancelacion}. Tus ClicCoins fueron devueltas.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================= MI CUENTA */}
          {activeTab === 'cuenta' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user?.avatar || '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-contain bg-neutral-950 p-1 border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-neutral-900 dark:text-white truncate">{user?.username}</h4>
                      {user?.email && <p className="text-xs text-neutral-400 truncate">{user.email}</p>}
                      <p className="text-xs text-neutral-400">Roblox: @{user?.roblox_username}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase shrink-0 ${
                      isAdmin ? 'bg-[#67F23B] text-[#121212]' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {isAdmin ? 'Administrador' : 'Ciudadano'}
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

              {isAdmin && (
                <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#67F23B]" />
                      <h5 className="text-sm font-black">Panel de Administración</h5>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Aprueba recargas, entrega pedidos y configura los datos de Yappy y PayPal.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setWalletOpen(false);
                      setAdminPanelOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#67F23B] text-[#121212] font-black text-xs hover:bg-[#52db28] transition-colors shrink-0"
                  >
                    Abrir panel
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
