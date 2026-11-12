import React, { useEffect, useRef, useState } from 'react';
import { cargarPaypal } from '../../lib/clicoinsApi.ts';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';

interface Props {
  packageId: string;
  onResult: (r: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

/** Botones oficiales de PayPal. El precio lo pone el servidor, no la página. */
export const PayPalCheckout: React.FC<Props> = ({ packageId, onResult }) => {
  const { paypalCreateOrder, paypalCapture } = useClicCoins();
  const contenedor = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'procesando' | 'error'>('cargando');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    let botones: any = null;
    setEstado('cargando');

    cargarPaypal()
      .then((paypal) => {
        if (cancelado || !contenedor.current) return;
        contenedor.current.innerHTML = '';
        botones = paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay', height: 45 },
          createOrder: () => paypalCreateOrder(packageId),
          onApprove: async (data: { orderID: string }) => {
            setEstado('procesando');
            const r = await paypalCapture(data.orderID);
            setEstado('listo');
            onResult({ type: r.success ? (r.pending ? 'info' : 'success') : 'error', message: r.message });
          },
          onCancel: () => onResult({ type: 'info', message: 'Pago cancelado. No se cobró nada.' }),
          onError: (e: any) =>
            onResult({ type: 'error', message: e?.message || 'Ocurrió un error con PayPal. Intenta de nuevo.' }),
        });
        return botones.render(contenedor.current).then(() => !cancelado && setEstado('listo'));
      })
      .catch((e: Error) => {
        if (cancelado) return;
        setEstado('error');
        setError(e.message);
      });

    return () => {
      cancelado = true;
      if (botones?.close) botones.close().catch(() => {});
    };
  }, [packageId]);

  return (
    <div>
      {estado === 'cargando' && <p className="text-xs text-neutral-500 text-center py-3">Cargando PayPal…</p>}
      {estado === 'procesando' && (
        <p className="text-sm font-bold text-[#0070BA] text-center py-3">Confirmando tu pago, no cierres esta ventana…</p>
      )}
      {estado === 'error' && <p className="text-xs font-bold text-red-600 text-center py-3">{error}</p>}
      <div ref={contenedor} className={estado === 'procesando' ? 'hidden' : ''} />
    </div>
  );
};
