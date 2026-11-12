import React, { useState } from 'react';
import { X, Check, ShieldCheck, ShoppingBag, Sparkles, Truck, Gift, Coins } from 'lucide-react';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';
import confetti from 'canvas-confetti';

export interface CheckoutModalItem {
  id: string;
  name: string;
  price: string;
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

export const StoreCheckoutModal: React.FC<StoreCheckoutModalProps> = ({ item, onClose }) => {
  const { balance, purchaseWithCoins, setWalletOpen } = useClicCoins();
  const [buyerName, setBuyerName] = useState('Carlos Rodriguez');
  const [robloxUser, setRobloxUser] = useState('Rodriguez_Capo');
  const [discordTag, setDiscordTag] = useState('CarlosRP#2026');
  const [email, setEmail] = useState('carlos@clicmaster.lat');
  const [shippingAddress, setShippingAddress] = useState('');
  const [country, setCountry] = useState('México');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'ClicCoins' | 'Robux'>('ClicCoins');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!item) return null;

  const isPhysical = item.type === 'physical' || item.type === 'pack';
  const numericPrice = parseInt(item.price.replace(/\D/g, ''), 10) || 350;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPhysical && paymentMode === 'ClicCoins') {
      if (balance < numericPrice) {
        setErrorMessage(
          `Saldo insuficiente. Tienes ${balance.toLocaleString()} ClicCoins y el ítem cuesta ${numericPrice.toLocaleString()} ClicCoins.`
        );
        return;
      }

      setIsProcessing(true);
      const res = await purchaseWithCoins(item.id, item.name, numericPrice);
      setIsProcessing(false);

      if (res.success) {
        setCompleted(true);
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
        });
      } else {
        setErrorMessage(res.message);
      }
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCompleted(true);
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.6 },
      });
    }, 900);
  };

  const handleResetAndClose = () => {
    setCompleted(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-[#151518] max-w-xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7CFF3A]/20 text-[#1a6b0c] dark:text-[#7CFF3A] flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-tight">
                CLICMASTER STORE · Finalizar Pedido
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pasarela Oficial con Activación Automática
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {completed ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                ¡Pedido Confirmado con Éxito!
              </h4>

              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                Gracias <span className="font-bold">{buyerName || 'Ciudadano'}</span>. Tu compra de{' '}
                <span className="font-bold text-[#1f7c0f] dark:text-[#7CFF3A]">{item.name}</span> ha sido procesada.
              </p>

              {/* Order dossier */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 text-left space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-semibold text-neutral-500">Orden de Compra:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    #STORE-2026-{Math.floor(100000 + Math.random() * 900000)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Usuario Roblox:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                    @{robloxUser || 'CLIC_Player'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Beneficio Discord:</span>
                  <span className="font-bold text-[#5865F2]">Rol Exclusivo Asignado</span>
                </div>
                {isPhysical && (
                  <div className="flex items-center justify-between pt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Envío a Domicilio:</span>
                    </span>
                    <span>Preparando despacho (3-5 días)</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] transition-colors shadow-md"
                >
                  Volver a CLICMASTER STORE
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product preview ribbon */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#7CFF3A]/20 text-[#1a6b0c] dark:text-[#7CFF3A]">
                      {item.category}
                    </span>
                    {item.selectedSize && (
                      <span className="text-[10px] font-bold text-neutral-500">
                        Talla: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="text-[10px] font-bold text-neutral-500">
                        Color: {item.selectedColor}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-neutral-900 dark:text-white truncate mt-0.5">
                    {item.name}
                  </h4>
                  <div className="text-sm font-black text-[#1a6b0c] dark:text-[#7CFF3A] tabular-nums">
                    {item.price}
                  </div>
                </div>
              </div>

              {/* ClicCoins Payment Mode Selector (para ítems virtuales) */}
              {!isPhysical && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Forma de Pago del Ítem
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMode('ClicCoins');
                        setErrorMessage(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        paymentMode === 'ClicCoins'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>ClicCoins ({numericPrice} 🪙)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMode('Robux');
                        setErrorMessage(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        paymentMode === 'Robux'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <span>Robux / Pase</span>
                    </button>
                  </div>

                  {paymentMode === 'ClicCoins' && (
                    <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                      <span>Tu saldo actual:</span>
                      <span className="font-black text-amber-500">{balance.toLocaleString()} ClicCoins</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 space-y-2">
                      <p className="font-bold">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleResetAndClose();
                          setWalletOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#121212] font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Recargar ClicCoins (PayPal / Yappy / Robux)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Input: Buyer Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mateo Vance"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                />
              </div>

              {/* Grid: Roblox & Discord for automated role/item delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Usuario Roblox (Para ítems/códigos)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: MateoRoblox_RP"
                    value={robloxUser}
                    onChange={(e) => setRobloxUser(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Usuario Discord (Para Rol VIP)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: mateo#1234"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                  Correo Electrónico (Para comprobante digital)
                </label>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                />
              </div>

              {/* Physical shipping fields */}
              {isPhysical && (
                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Truck className="w-4 h-4 text-[#7CFF3A]" />
                    <span>Datos de Envío a Domicilio</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                        País de Destino
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                      >
                        <option>México</option>
                        <option>Colombia</option>
                        <option>Argentina</option>
                        <option>Chile</option>
                        <option>Perú</option>
                        <option>España</option>
                        <option>Estados Unidos</option>
                        <option>Resto de Latinoamérica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                        Dirección y Ciudad
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Calle, Número, Colonia, Ciudad"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Guarantee badge */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Garantía de entrega oficial CLICMASTER · Transacción encriptada</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_4px_24px_rgba(124,255,58,0.35)] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Procesando Orden...</span>
                ) : (
                  <>
                    {!isPhysical && paymentMode === 'ClicCoins' ? (
                      <Coins className="w-4 h-4 text-amber-900" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                    <span>
                      Confirmar Compra ({!isPhysical && paymentMode === 'ClicCoins' ? `${numericPrice.toLocaleString()} ClicCoins` : item.price})
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
