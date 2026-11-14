import React, { useState } from 'react';
import { X, Check, ShieldCheck, ShoppingBag, Truck, Coins } from 'lucide-react';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';
import confetti from 'canvas-confetti';

export interface CheckoutModalItem {
  id: string;
  name: string;
  /** Precio en ClicCoins (lo confirma el servidor al cobrar) */
  priceCoins: number;
  category: 'Virtual' | 'Físico' | 'Pack';
  type: 'virtual' | 'physical' | 'pack';
  image: string;
  badge?: string;
  selectedSize?: string;
  selectedColor?: string;
}

interface StoreCheckoutModalProps {
  item: CheckoutModalItem | null;
  onClose: () => void;
}

const COUNTRIES = [
  'Panamá',
  'México',
  'Colombia',
  'Perú',
  'Argentina',
  'Chile',
  'Costa Rica',
  'Venezuela',
  'Ecuador',
  'República Dominicana',
  'Guatemala',
  'Honduras',
  'El Salvador',
  'Nicaragua',
  'Bolivia',
  'Paraguay',
  'Uruguay',
  'España',
  'Estados Unidos',
  'Otro país',
];

export const StoreCheckoutModal: React.FC<StoreCheckoutModalProps> = ({ item, onClose }) => {
  const { user, balance, purchaseWithCoins, setWalletOpen, setAuthOpen } = useClicCoins();
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('Panamá');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!item) return null;

  const needsShipping = item.type === 'physical' || item.type === 'pack';
  const notEnough = !!user && balance < item.priceCoins;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (balance < item.priceCoins) {
      setErrorMessage(
        `Saldo insuficiente. Tienes ${balance.toLocaleString()} ClicCoins y este producto cuesta ${item.priceCoins.toLocaleString()} ClicCoins.`
      );
      return;
    }

    setIsProcessing(true);
    const res = await purchaseWithCoins(item.id, {
      opciones:
        item.selectedSize || item.selectedColor ? { talla: item.selectedSize, color: item.selectedColor } : undefined,
      envio: needsShipping
        ? { nombre: nombre.trim(), pais, direccion: direccion.trim(), telefono: telefono.trim() }
        : undefined,
    });
    setIsProcessing(false);

    if (res.success) {
      setOrderId(res.order?.id || 'registrado');
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResetAndClose = () => {
    setOrderId(null);
    setErrorMessage(null);
    onClose();
  };

  const input =
    'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white';
  const label = 'block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-[#151518] max-w-xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7CFF3A]/20 text-[#1a6b0c] dark:text-[#7CFF3A] flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-tight">
                CLICMASTER STORE · Finalizar pedido
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Pago únicamente con ClicCoins</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {orderId ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">¡Pedido realizado!</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                Compraste <span className="font-bold text-[#1f7c0f] dark:text-[#7CFF3A]">{item.name}</span> por{' '}
                {item.priceCoins.toLocaleString()} ClicCoins.{' '}
                {needsShipping
                  ? 'El staff preparará tu envío y te contactará por teléfono.'
                  : `El staff lo entregará a tu cuenta de Roblox @${user?.roblox_username}.`}
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-500">Número de pedido:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Estado:</span>
                  <span className="font-bold text-amber-600">Pendiente de entrega</span>
                </div>
                <p className="text-neutral-500">Puedes seguirlo en tu billetera, pestaña "Mis pedidos".</p>
              </div>
              <button
                onClick={handleResetAndClose}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] transition-colors shadow-md"
              >
                Volver a CLICMASTER STORE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Resumen del producto */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#7CFF3A]/20 text-[#1a6b0c] dark:text-[#7CFF3A]">
                      {item.category}
                    </span>
                    {item.selectedSize && <span className="text-[10px] font-bold text-neutral-500">Talla: {item.selectedSize}</span>}
                    {item.selectedColor && <span className="text-[10px] font-bold text-neutral-500">Color: {item.selectedColor}</span>}
                  </div>
                  <h4 className="text-sm font-black text-neutral-900 dark:text-white truncate mt-0.5">{item.name}</h4>
                  <div className="text-sm font-black text-amber-500 tabular-nums">🪙 {item.priceCoins.toLocaleString()} ClicCoins</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                <span>Tu saldo actual:</span>
                <span className="font-black text-amber-500">
                  {user ? `${balance.toLocaleString()} ClicCoins` : 'Inicia sesión para comprar'}
                </span>
              </div>

              {(errorMessage || notEnough) && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 space-y-2">
                  <p className="font-bold">
                    {errorMessage ||
                      `Te faltan ${(item.priceCoins - balance).toLocaleString()} ClicCoins para este producto.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      setWalletOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#121212] font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Recargar ClicCoins (Yappy / PayPal)</span>
                  </button>
                </div>
              )}

              {needsShipping ? (
                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Truck className="w-4 h-4 text-[#7CFF3A]" />
                    <span>Datos de envío</span>
                  </div>
                  <div>
                    <label className={label}>Nombre completo de quien recibe</label>
                    <input type="text" required minLength={3} maxLength={80} placeholder="Ej: Mateo Vance" value={nombre} onChange={(e) => setNombre(e.target.value)} className={input} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={label}>País</label>
                      <select value={pais} onChange={(e) => setPais(e.target.value)} className={input}>
                        {COUNTRIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Teléfono de contacto</label>
                      <input type="tel" required maxLength={25} placeholder="+507 6000-0000" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={input} />
                    </div>
                  </div>
                  <div>
                    <label className={label}>Dirección completa y ciudad</label>
                    <input
                      type="text"
                      required
                      minLength={8}
                      maxLength={200}
                      placeholder="Calle, número, barrio, ciudad"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className={input}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Se entregará a tu cuenta de Roblox:{' '}
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {user ? `@${user.roblox_username}` : 'inicia sesión para comprar'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>El precio lo confirma el servidor. Si no podemos entregar tu pedido, te devolvemos tus ClicCoins.</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing || notEnough}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Coins className="w-4 h-4 text-amber-900" />
                <span>
                  {isProcessing
                    ? 'Procesando pedido...'
                    : user
                      ? `Pagar ${item.priceCoins.toLocaleString()} ClicCoins`
                      : 'Inicia sesión para comprar'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
