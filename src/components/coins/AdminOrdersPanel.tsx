import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, XCircle, Search, AlertCircle, X } from 'lucide-react';
import { useClicCoins, ShopOrder } from '../../context/ClicCoinsContext.tsx';

type Filter = 'pendientes' | 'entregados' | 'cancelados' | 'todos';

const TYPE_LABEL: Record<ShopOrder['item_type'], string> = {
  membresia: 'Membresía',
  virtual: 'Ítem virtual',
  fisico: 'Mercancía física',
  pack: 'Pack',
};

/** Sección "Pedidos" del panel de administración: entregar o cancelar compras de la tienda. */
export const AdminOrdersPanel: React.FC = () => {
  const { adminOrders, deliverOrder, cancelOrder } = useClicCoins();
  const [filter, setFilter] = useState<Filter>('pendientes');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<ShopOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const counts = {
    pendientes: adminOrders.filter((o) => o.estado === 'pendiente_entrega').length,
    entregados: adminOrders.filter((o) => o.estado === 'entregado').length,
    cancelados: adminOrders.filter((o) => o.estado === 'cancelado').length,
  };

  const list = adminOrders.filter((o) => {
    if (filter === 'pendientes' && o.estado !== 'pendiente_entrega') return false;
    if (filter === 'entregados' && o.estado !== 'entregado') return false;
    if (filter === 'cancelados' && o.estado !== 'cancelado') return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [o.username, o.roblox_username, o.item_name, o.id, o.email || ''].some((v) => v.toLowerCase().includes(term));
  });

  const handleDeliver = async (order: ShopOrder) => {
    setProcessingId(order.id);
    setFeedback(null);
    const res = await deliverOrder(order.id);
    setProcessingId(null);
    setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelling) return;
    setProcessingId(cancelling.id);
    setFeedback(null);
    const res = await cancelOrder(cancelling.id, cancelReason.trim());
    setProcessingId(null);
    setCancelling(null);
    setCancelReason('');
    setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100" aria-label="Cerrar aviso">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 p-6 pb-2 shrink-0">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Por entregar</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{counts.pendientes}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Entregados</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{counts.entregados}</div>
        </div>
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Cancelados</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 tabular-nums">{counts.cancelados}</div>
        </div>
      </div>

      <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full sm:w-auto">
          {(['pendientes', 'entregados', 'cancelados', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-extrabold rounded-lg capitalize transition-colors ${
                filter === f
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario, producto o pedido..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#67F23B]"
          />
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 space-y-2">
            <Package className="w-10 h-10 mx-auto opacity-30 text-[#67F23B]" />
            <p className="text-sm font-bold">No hay pedidos en esta categoría.</p>
            <p className="text-xs text-neutral-500">Cada compra en la tienda aparecerá aquí para que la entregues.</p>
          </div>
        ) : (
          list.map((order) => {
            const pending = order.estado === 'pendiente_entrega';
            const busy = processingId === order.id;
            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  pending
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="space-y-1.5 text-xs min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {order.envio ? <Truck className="w-4 h-4 text-neutral-500" /> : <Package className="w-4 h-4 text-neutral-500" />}
                    <span className="text-sm font-black text-neutral-900 dark:text-white">{order.item_name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {TYPE_LABEL[order.item_type]}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                        order.estado === 'entregado'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : order.estado === 'cancelado'
                            ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                            : 'bg-amber-500/20 text-amber-800 dark:text-amber-400'
                      }`}
                    >
                      {order.estado === 'entregado' ? 'Entregado' : order.estado === 'cancelado' ? 'Cancelado' : 'Por entregar'}
                    </span>
                  </div>
                  <div className="text-neutral-700 dark:text-neutral-300">
                    <strong>@{order.username}</strong> · Roblox: <strong className="font-mono">@{order.roblox_username}</strong>
                    {order.email && <span className="text-neutral-500"> · {order.email}</span>}
                  </div>
                  {(order.opciones?.talla || order.opciones?.color) && (
                    <div className="text-neutral-600 dark:text-neutral-400">
                      {order.opciones?.talla && <>Talla: <strong>{order.opciones.talla}</strong> </>}
                      {order.opciones?.color && <>· Color: <strong>{order.opciones.color}</strong></>}
                    </div>
                  )}
                  {order.envio && (
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 space-y-0.5">
                      <div className="font-bold">Envío a: {order.envio.nombre}</div>
                      <div>{order.envio.direccion}, {order.envio.pais}</div>
                      <div>Tel: {order.envio.telefono}</div>
                    </div>
                  )}
                  <div className="text-[11px] text-neutral-500 font-mono flex flex-wrap gap-x-3">
                    <span>{order.id}</span>
                    <span>{new Date(order.timestamp).toLocaleString('es-PA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {order.entregado_por && <span>Entregó: {order.entregado_por}</span>}
                    {order.cancelado_por && <span>Canceló: {order.cancelado_por}</span>}
                  </div>
                  {order.motivo_cancelacion && (
                    <p className="text-red-600 dark:text-red-400">Motivo: {order.motivo_cancelacion}</p>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <div className="text-lg font-black text-neutral-900 dark:text-white tabular-nums">
                    🪙 {order.cost_coins.toLocaleString()}
                  </div>
                  {pending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeliver(order)}
                        disabled={busy}
                        className="px-3.5 py-2 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{busy ? 'Procesando...' : 'Marcar entregado'}</span>
                      </button>
                      <button
                        onClick={() => setCancelling(order)}
                        disabled={busy}
                        className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {cancelling && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>Cancelar pedido y devolver ClicCoins</span>
              </h4>
              <button onClick={() => setCancelling(null)} aria-label="Cerrar">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Se devolverán <strong>{cancelling.cost_coins.toLocaleString()} ClicCoins</strong> a @{cancelling.username} por{' '}
              <strong>{cancelling.item_name}</strong>.
            </p>
            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Motivo (lo verá el cliente):
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej: Sin existencias de la talla elegida"
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancelling(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs"
                >
                  Volver
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs">
                  Cancelar y devolver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
