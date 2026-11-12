import React, { useEffect, useState } from 'react';
import { useClicCoins, ClicTransaction, Pedido } from '../../context/ClicCoinsContext.tsx';
import { ShieldCheck, X, CheckCircle2, XCircle, Search, AlertCircle, Package, Coins, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

type EstadoYappy = 'pendiente' | 'esperando-pago' | 'aprobada' | 'rechazada';
const ETIQUETAS: Record<EstadoYappy, string> = {
  pendiente: 'Por revisar',
  'esperando-pago': 'Sin confirmar',
  aprobada: 'Aprobadas',
  rechazada: 'Rechazadas',
};

export const AdminPaymentsModal: React.FC = () => {
  const {
    adminPanelOpen,
    setAdminPanelOpen,
    isAdmin,
    adminListPayments,
    approvePayment,
    rejectPayment,
    adminListOrders,
    adminMarkDelivered,
    adminAdjust,
  } = useClicCoins();

  const [seccion, setSeccion] = useState<'yappy' | 'pedidos' | 'ajustar'>('yappy');
  const [filterState, setFilterState] = useState<EstadoYappy>('pendiente');
  const [lista, setLista] = useState<ClicTransaction[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [verEntregados, setVerEntregados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('No encontramos el pago con ese código y monto');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [ajuste, setAjuste] = useState({ email: '', monto: '', motivo: '' });

  const cargar = async () => {
    setCargando(true);
    try {
      if (seccion === 'yappy') setLista(await adminListPayments(filterState));
      if (seccion === 'pedidos') setPedidos(await adminListOrders(verEntregados ? 'entregado' : 'por-entregar'));
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
    setCargando(false);
  };

  useEffect(() => {
    if (adminPanelOpen && isAdmin) cargar();
  }, [adminPanelOpen, isAdmin, seccion, filterState, verEntregados]);

  if (!adminPanelOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
        <div className="bg-white dark:bg-[#151518] rounded-3xl p-8 max-w-sm text-center space-y-4">
          <ShieldCheck className="w-10 h-10 mx-auto text-neutral-400" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">Solo los administradores pueden ver este panel.</p>
          <button onClick={() => setAdminPanelOpen(false)} className="px-4 py-2 rounded-xl bg-[#67F23B] font-black text-xs">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const filtrada = lista.filter((tx) => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();
    return (
      tx.username.toLowerCase().includes(t) ||
      tx.referencia_pago.toLowerCase().includes(t) ||
      (tx.codigo_yappy || '').toLowerCase().includes(t)
    );
  });

  const handleApprove = async (tx: ClicTransaction) => {
    setProcessingId(tx.id);
    setFeedback(null);
    const res = await approvePayment(tx.id);
    setProcessingId(null);
    if (res.success) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      setFeedback({ type: 'success', message: `¡Aprobado! ${tx.cantidad_coins.toLocaleString()} ClicCoins para ${tx.username}.` });
      cargar();
    } else setFeedback({ type: 'error', message: res.message });
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTxId) return;
    setProcessingId(rejectingTxId);
    const res = await rejectPayment(rejectingTxId, rejectionReason);
    setProcessingId(null);
    setRejectingTxId(null);
    setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
    if (res.success) cargar();
  };

  const handleEntregado = async (p: Pedido) => {
    setProcessingId(p.id);
    const res = await adminMarkDelivered(p.id);
    setProcessingId(null);
    setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
    if (res.success) cargar();
  };

  const handleAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseInt(ajuste.monto, 10);
    if (!Number.isInteger(monto) || monto === 0) {
      setFeedback({ type: 'error', message: 'La cantidad debe ser un número entero distinto de 0.' });
      return;
    }
    setProcessingId('ajuste');
    const res = await adminAdjust(ajuste.email, monto, ajuste.motivo);
    setProcessingId(null);
    setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
    if (res.success) setAjuste({ email: '', monto: '', motivo: '' });
  };

  const seccionBtn = (id: 'yappy' | 'pedidos' | 'ajustar', label: string) => (
    <button
      onClick={() => {
        setSeccion(id);
        setFeedback(null);
      }}
      className={`py-3 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-colors ${
        seccion === id
          ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#151518] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#67F23B] text-[#121212] flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">Panel de Administración ClicCoins</h3>
              <p className="text-xs text-neutral-400">Recargas Yappy, pedidos de la tienda y ajustes de saldo</p>
            </div>
          </div>
          <button
            onClick={() => setAdminPanelOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 border-b border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0 overflow-x-auto">
          {seccionBtn('yappy', 'Recargas Yappy')}
          {seccionBtn('pedidos', 'Pedidos por entregar')}
          {seccionBtn('ajustar', 'Dar / quitar ClicCoins')}
        </div>

        {feedback && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shrink-0 ${
              feedback.type === 'success'
                ? 'bg-[#67F23B]/15 text-[#135708] dark:text-[#67F23B] border border-[#67F23B]/30'
                : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            <p className="flex-1">{feedback.message}</p>
            <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===================== RECARGAS YAPPY ===================== */}
        {seccion === 'yappy' && (
          <>
            <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full sm:w-auto overflow-x-auto">
                {(Object.keys(ETIQUETAS) as EstadoYappy[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterState(st)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-extrabold rounded-lg whitespace-nowrap transition-colors ${
                      filterState === st
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {ETIQUETAS[st]}
                  </button>
                ))}
                <button onClick={cargar} className="px-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white" title="Actualizar">
                  <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar correo, código o comprobante…"
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
                />
              </div>
            </div>
            <p className="px-6 pt-3 text-[11px] text-neutral-500">
              Antes de aprobar, busca en tu Yappy un pago con el <strong>monto exacto</strong> y el <strong>código</strong> en el mensaje.
            </p>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {cargando && lista.length === 0 ? (
                <p className="text-center text-sm text-neutral-500 py-12">Cargando…</p>
              ) : filtrada.length === 0 ? (
                <div className="text-center py-16 text-neutral-400 space-y-2">
                  <ShieldCheck className="w-10 h-10 mx-auto opacity-30 text-[#67F23B]" />
                  <p className="text-sm font-bold">No hay recargas en esta categoría.</p>
                </div>
              ) : (
                filtrada.map((tx) => {
                  const abierta = tx.estado === 'pendiente';
                  return (
                    <div
                      key={tx.id}
                      className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        abierta
                          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 bg-[#00B4D8]/20 text-[#00B4D8]">
                          YP
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-black text-neutral-900 dark:text-white">{tx.username}</div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-300">{tx.detalles}</div>
                          <div className="text-xs text-neutral-500 font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="text-neutral-900 dark:text-white font-bold">
                              Código: <span className="text-[#00B4D8]">{tx.codigo_yappy}</span>
                            </span>
                            <span>Comprobante: {tx.referencia_pago}</span>
                            <span>{new Date(tx.timestamp).toLocaleString('es-PA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                          {tx.rejection_reason && (
                            <p className="text-xs text-red-600 dark:text-red-400">Motivo rechazo: {tx.rejection_reason}</p>
                          )}
                          {tx.reviewed_by && <p className="text-[11px] text-neutral-400">Revisado por: {tx.reviewed_by}</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                        <div className="text-left md:text-right">
                          <div className="text-lg font-black text-neutral-900 dark:text-white tabular-nums">
                            +{tx.cantidad_coins.toLocaleString()} 🪙
                          </div>
                          <div className="text-xs font-bold text-neutral-500">${tx.monto_dinero_real.toFixed(2)} USD</div>
                        </div>
                        {(filterState === 'pendiente' || filterState === 'esperando-pago') && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(tx)}
                              disabled={processingId === tx.id}
                              className="px-3.5 py-2 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {processingId === tx.id ? 'Procesando…' : 'Aprobar'}
                            </button>
                            <button
                              onClick={() => setRejectingTxId(tx.id)}
                              disabled={processingId === tx.id}
                              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ===================== PEDIDOS ===================== */}
        {seccion === 'pedidos' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-neutral-500">
                Compras hechas con ClicCoins. Entrega el ítem en Roblox/Discord y márcalo como entregado.
              </p>
              <button
                onClick={() => setVerEntregados(!verEntregados)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 shrink-0"
              >
                {verEntregados ? 'Ver por entregar' : 'Ver entregados'}
              </button>
            </div>
            {cargando && pedidos.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-12">Cargando…</p>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-16 text-neutral-400 space-y-2">
                <Package className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-bold">{verEntregados ? 'Aún no hay pedidos entregados.' : 'No hay pedidos por entregar.'}</p>
              </div>
            ) : (
              pedidos.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-black text-neutral-900 dark:text-white">{p.articulo}</div>
                    <div className="text-xs text-neutral-500 font-mono flex flex-wrap gap-x-4 gap-y-1">
                      <span>{p.email}</span>
                      <span>Roblox: @{p.robloxUser || '—'}</span>
                      {p.discordUser && <span>Discord: {p.discordUser}</span>}
                      <span>{p.precioCoins.toLocaleString()} 🪙</span>
                      {p.creado && <span>{new Date(p.creado).toLocaleString('es-PA', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                    </div>
                    {p.entregadoPor && <p className="text-[11px] text-neutral-400">Entregado por: {p.entregadoPor}</p>}
                  </div>
                  {p.estado === 'por-entregar' && (
                    <button
                      onClick={() => handleEntregado(p)}
                      disabled={processingId === p.id}
                      className="px-3.5 py-2 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Marcar entregado
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ===================== AJUSTAR SALDO ===================== */}
        {seccion === 'ajustar' && (
          <div className="p-6 overflow-y-auto flex-1">
            <form onSubmit={handleAjuste} className="max-w-md space-y-3">
              <p className="text-xs text-neutral-500">
                Para premios de eventos o corregir errores. Usa un número negativo para quitar ClicCoins. Todo queda en el historial
                del usuario.
              </p>
              <input
                type="email"
                required
                value={ajuste.email}
                onChange={(e) => setAjuste({ ...ajuste, email: e.target.value })}
                placeholder="Correo del usuario"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
              />
              <input
                type="number"
                step={1}
                required
                value={ajuste.monto}
                onChange={(e) => setAjuste({ ...ajuste, monto: e.target.value })}
                placeholder="Cantidad (ej. 100 o -100)"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
              />
              <input
                type="text"
                required
                value={ajuste.motivo}
                onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })}
                placeholder="Motivo (lo verá el usuario), ej. Premio Desfile de La Villa"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
              />
              <button
                type="submit"
                disabled={processingId === 'ajuste'}
                className="w-full py-3 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Coins className="w-4 h-4" />
                {processingId === 'ajuste' ? 'Aplicando…' : 'Aplicar'}
              </button>
            </form>
          </div>
        )}

        {rejectingTxId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Rechazar recarga
                </h4>
                <button onClick={() => setRejectingTxId(null)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Motivo (lo verá el usuario):
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingTxId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs">
                    Confirmar rechazo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
