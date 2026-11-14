import React, { useState } from 'react';
import { SHOP_ITEMS } from '../../data/serverData.ts';
import { ShopItem } from '../../types/index.ts';
import { ShoppingBag, Check, Sparkles, X, ShieldCheck, Zap, Coins, CreditCard } from 'lucide-react';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';
import confetti from 'canvas-confetti';
import { getVipItemCoinCost } from '../../data/coinShopCatalog.ts';

export const VipShop: React.FC = () => {
  const { user, balance, purchaseWithCoins, setWalletOpen, setAuthOpen } = useClicCoins();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [checkoutItem, setCheckoutItem] = useState<ShopItem | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'ClicCoins' | 'Robux'>('ClicCoins');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = ['Todos', 'VIP', 'Vehículos', 'Casas', 'Monedas'];

  const filteredItems =
    selectedCategory === 'Todos'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === selectedCategory);

  // Mismo precio que cobra el servidor (catálogo oficial)
  const getCoinsCost = (item: ShopItem) => getVipItemCoinCost(item);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem) return;

    setErrorMessage(null);
    const coinsCost = getCoinsCost(checkoutItem);

    if (paymentMode === 'ClicCoins') {
      if (!user) {
        setAuthOpen(true);
        return;
      }
      if (balance < coinsCost) {
        setErrorMessage(
          `Saldo insuficiente. Tienes ${balance.toLocaleString()} ClicCoins y el ítem requiere ${coinsCost.toLocaleString()} ClicCoins.`
        );
        return;
      }

      setIsProcessing(true);
      const res = await purchaseWithCoins(checkoutItem.id);
      setIsProcessing(false);

      if (res.success) {
        setPurchaseSuccess(true);
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 },
        });
      } else {
        setErrorMessage(res.message);
      }
    } else {
      // Antes aquí se simulaba una compra exitosa sin cobrar nada.
      // El pago con Robux se hace en Roblox: recarga ClicCoins con Robux y luego compra aquí.
      setErrorMessage(
        'El pago directo con Robux no está disponible en la web. Recarga ClicCoins con Robux desde tu billetera y luego compra con ClicCoins.'
      );
    }
  };

  const closeCheckout = () => {
    setCheckoutItem(null);
    setPurchaseSuccess(false);
    setErrorMessage(null);
  };

  return (
    <section id="tienda" className="py-16 sm:py-24 bg-[#F5F7FA] dark:bg-[#151517] border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Tienda Oficial & Gamepasses Exclusivos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Catálogo VIP & Bienes Exclusivos
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#121212] dark:bg-[#67F23B] text-white dark:text-[#121212]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#1A1A1D] rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl group ${
                item.popular
                  ? 'border-[#42D425] ring-2 ring-[#42D425]/20'
                  : 'border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300'
              }`}
            >
              <div>
                {/* Media banner */}
                <div className="relative h-48 overflow-hidden bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-[#67F23B] text-[#121212]">
                      {item.rarity}
                    </span>
                    {item.popular && (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-400 text-[#121212] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <span className="text-[10px] uppercase font-bold text-neutral-300 block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-xs sm:text-sm text-[#7B7B7B] dark:text-neutral-300 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                      Beneficios Incluidos
                    </span>
                    {item.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <Check className="w-3.5 h-3.5 text-[#32B818] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Purchase CTA */}
              <div className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
                <div className="flex items-baseline justify-between mb-4 pt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                      Precio Oficial
                    </span>
                    <div className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tabular-nums flex items-center gap-1.5">
                      <span className="text-amber-500">🪙 {getCoinsCost(item).toLocaleString()}</span>
                      <span className="text-xs font-bold text-neutral-400">ClicCoins</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-neutral-500 tabular-nums">
                    o {item.priceRobux || 500} Robux
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCheckoutItem(item);
                    setPaymentMode('ClicCoins');
                    setErrorMessage(null);
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Coins className="w-4 h-4" />
                  <span>Comprar con ClicCoins</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout / Voucher Modal */}
      {checkoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1A1D] max-w-lg w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#67F23B]/20 text-[#258712] dark:text-[#67F23B] flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    Pasarela de Entrega Inmediata
                  </h3>
                  <p className="text-xs text-neutral-500">Servidor CLICMaster Roblox</p>
                </div>
              </div>
              <button
                onClick={closeCheckout}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {purchaseSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                    ¡Entrega Confirmada con Éxito!
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Tu ítem <span className="font-bold">{checkoutItem.title}</span> quedó registrado para la cuenta de Roblox <span className="font-mono font-bold text-[#2B6BFF]">@{user?.roblox_username}</span>. Se descontó de tu saldo de ClicCoins.
                  </p>
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                    ID Transacción: SHOP-{checkoutItem.id.toUpperCase()}-{Date.now()}
                  </div>
                  <button
                    onClick={closeCheckout}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#67F23B] text-[#121212] hover:bg-[#52d726] transition-colors"
                  >
                    Aceptar y Volver a la Tienda
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  {/* Item Summary */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        {checkoutItem.title}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {checkoutItem.category} · Entrega Digital
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-amber-500 block">
                        🪙 {getCoinsCost(checkoutItem).toLocaleString()} ClicCoins
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Saldo: {balance.toLocaleString()} 🪙
                      </span>
                    </div>
                  </div>

                  {/* Payment Mode Selector */}
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
                      <span>ClicCoins</span>
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
                      <span>Robux ({getCoinsCost(checkoutItem)} R$)</span>
                    </button>
                  </div>

                  {/* Error / Insufficient Balance Warning */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 space-y-2">
                      <p className="font-bold">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => {
                          closeCheckout();
                          setWalletOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#121212] font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Recargar ClicCoins (Yappy / Robux)</span>
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Entrega a la cuenta de Roblox:{' '}
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {user ? `@${user.roblox_username}` : 'inicia sesión para comprar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Verificación estricta en servidor y entrega inmediata</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Validando transacción en servidor...</span>
                    ) : paymentMode === 'ClicCoins' ? (
                      <span>Pagar {getCoinsCost(checkoutItem).toLocaleString()} ClicCoins</span>
                    ) : (
                      <span>Continuar con Robux</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
