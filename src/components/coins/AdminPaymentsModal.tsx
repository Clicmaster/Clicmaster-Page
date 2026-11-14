import React, { useState } from 'react';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  QrCode,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  Package,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminOrdersPanel } from './AdminOrdersPanel.tsx';
import { AdminPaymentSettingsPanel } from './AdminPaymentSettingsPanel.tsx';

type Section = 'recargas' | 'pedidos' | 'ajustes';

export const AdminPaymentsModal: React.FC = () => {
  const {
    adminPanelOpen,
    setAdminPanelOpen,
    pendingPayments,
    adminRequests: transactions,
    adminOrders,
    approvePayment,
    rejectPayment,
  } = useClicCoins();

  const [section, setSection] = useState<Section>('recargas');
  const pendingOrders = adminOrders.filter((o) => o.estado === 'pendiente_entrega').length;

  const [filterState, setFilterState] = useState<'pendientes' | 'completados' | 'rechazados' | 'todos'>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Comprobante no reflejado en la cuenta');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!adminPanelOpen) return null;

  // Filter list
  const filteredList = transactions.filter((tx) => {
    // Only payment buy requests
    if (tx.tipo !== 'compra_coins') return false;

    if (filterState === 'pendientes' && tx.estado !== 'pendiente') return false;
    if (filterState === 'completados' && tx.estado !== 'completado') return false;
    if (filterState === 'rechazados' && tx.estado !== 'rechazado') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        tx.username.toLowerCase().includes(term) ||
        tx.referencia_pago.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term) ||
        tx.metodo_pago.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleApprove = async (txId: string, coins: number, username: string) => {
    setProcessingId(txId);
    setFeedback(null);

    const res = await approvePayment(txId);
    setProcessingId(null);

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
      });
      setFeedback({
        type: 'success',
        message: `¡Pago aprobado! Se han acreditado ${coins.toLocaleString()} ClicCoins a ${username}.`,
      });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTxId) return;

    setProcessingId(rejectingTxId);
    setFeedback(null);

    const res = await rejectPayment(rejectingTxId, rejectionReason);
    setProcessingId(null);
    setRejectingTxId(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'La transacción ha sido rechazada y se notificó en el historial.',
      });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#151518] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#67F23B] text-[#121212] flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">Panel de Administración</h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#67F23B]/20 text-[#67F23B] border border-[#67F23B]/30">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Recargas (Yappy y PayPal), pedidos de la tienda y configuración de pagos
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminPanelOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Secciones del panel */}
        <div className="px-6 pt-3 flex gap-2 shrink-0 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {(
            [
              ['recargas', 'Recargas', pendingPayments.length],
              ['pedidos', 'Pedidos', pendingOrders],
              ['ajustes', 'Configuración de pagos', 0],
            ] as const
          ).map(([key, text, count]) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`pb-3 px-2 text-xs sm:text-sm font-extrabold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                section === key
                  ? 'border-[#67F23B] text-[#1a700d] dark:text-[#67F23B]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {key === 'recargas' ? <Coins className="w-4 h-4" /> : key === 'pedidos' ? <Package className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              <span>{text}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-500 text-[#121212] leading-none">{count}</span>
              )}
            </button>
          ))}
        </div>

        {section === 'pedidos' && <AdminOrdersPanel />}
        {section === 'ajustes' && <AdminPaymentSettingsPanel />}

        {section === 'recargas' && (
        <>
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shrink-0 ${
              feedback.type === 'success'
                ? 'bg-[#67F23B]/15 text-[#135708] dark:text-[#67F23B] border border-[#67F23B]/30'
                : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="flex-1">{feedback.message}</p>
            <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pb-2 shrink-0">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pendientes de Revisión
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {pendingPayments.length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Pagos Aprobados
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {transactions.filter((t) => t.tipo === 'compra_coins' && t.estado === 'completado').length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Pagos Rechazados
            </span>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 tabular-nums">
              {transactions.filter((t) => t.tipo === 'compra_coins' && t.estado === 'rechazado').length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Total Solicitudes
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
              {transactions.filter((t) => t.tipo === 'compra_coins').length}
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-850 rounded-xl w-full sm:w-auto">
            {(['pendientes', 'completados', 'rechazados', 'todos'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-extrabold rounded-lg capitalize transition-colors ${
                  filterState === st
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario o boleta..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
            />
          </div>
        </div>

        {/* List of Payments */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto opacity-30 text-[#67F23B]" />
              <p className="text-sm font-bold">No hay transacciones en esta categoría.</p>
              <p className="text-xs text-neutral-500">
                Las nuevas solicitudes de Yappy o PayPal aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            filteredList.map((tx) => {
              const isPending = tx.estado === 'pendiente';
              const isProcessing = processingId === tx.id;

              return (
                <div
                  key={tx.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending
                      ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Method Icon Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        tx.metodo_pago === 'Yappy'
                          ? 'bg-[#00B4D8]/20 text-[#00B4D8]'
                          : tx.metodo_pago === 'PayPal'
                          ? 'bg-[#0070BA]/20 text-[#0070BA]'
                          : 'bg-neutral-900 text-white dark:bg-neutral-700'
                      }`}
                    >
                      {tx.metodo_pago === 'Yappy' ? 'YP' : tx.metodo_pago === 'PayPal' ? 'PP' : 'R$'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-neutral-900 dark:text-white">
                          @{tx.username}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">({tx.id})</span>
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                            tx.estado === 'completado'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : tx.estado === 'pendiente'
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 font-black'
                              : 'bg-red-500/15 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {tx.estado === 'completado'
                            ? 'Aprobado'
                            : tx.estado === 'pendiente'
                            ? 'Pendiente'
                            : 'Rechazado'}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                        {tx.detalles}
                      </div>

                      {/* Payment Proof and Method */}
                      <div className="text-xs text-neutral-500 font-mono flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                        <span className="text-neutral-900 dark:text-white font-bold">
                          Comprobante / Boleta: <span className="text-[#00B4D8]">{tx.referencia_pago}</span>
                        </span>
                        <span>Método: {tx.metodo_pago}</span>
                        <span>
                          {new Date(tx.timestamp).toLocaleString('es-PA', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {tx.rejection_reason && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Motivo rechazo: {tx.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-200 dark:border-neutral-800">
                    <div className="text-left md:text-right">
                      <div className="text-lg font-black text-neutral-900 dark:text-white tabular-nums">
                        +{tx.cantidad_coins.toLocaleString()} 🪙
                      </div>
                      <div className="text-xs font-bold text-neutral-500">
                        {tx.moneda === 'ROBUX' ? `${tx.monto_dinero_real} Robux` : `$${tx.monto_dinero_real} USD`}
                      </div>
                    </div>

                    {/* Action buttons (only for pending payments) */}
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(tx.id, tx.cantidad_coins, tx.username)}
                          disabled={isProcessing}
                          className="px-3.5 py-2 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                          title="Aprobar pago y acreditar ClicCoins"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isProcessing ? 'Procesando...' : 'Aprobar'}</span>
                        </button>

                        <button
                          onClick={() => setRejectingTxId(tx.id)}
                          disabled={isProcessing}
                          className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white font-black text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          title="Rechazar solicitud"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 font-mono">
                        {tx.reviewed_by ? `Por: ${tx.reviewed_by}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal for Rejecting with a Custom Reason */}
        {rejectingTxId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>Rechazar Solicitud de Pago</span>
                </h4>
                <button onClick={() => setRejectingTxId(null)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Motivo del Rechazo (Visible para el usuario):
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Número de boleta no aparece en la cuenta de Yappy..."
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
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
