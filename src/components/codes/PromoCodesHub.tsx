import React, { useState } from 'react';
import { REDEEM_CODES } from '../../data/serverData.ts';
import { Gift, Check, Copy, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PromoCodesHubProps {
  onClose?: () => void;
}

export const PromoCodesHub: React.FC<PromoCodesHubProps> = () => {
  const [inputCode, setInputCode] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();

    if (!cleanCode) {
      setStatusMessage({ type: 'error', message: 'Por favor ingresa un código promocional.' });
      return;
    }

    if (!robloxUsername.trim()) {
      setStatusMessage({ type: 'error', message: 'Debes indicar tu usuario de Roblox para recibir la recompensa.' });
      return;
    }

    if (claimedCodes.includes(cleanCode)) {
      setStatusMessage({ type: 'error', message: 'Este código ya ha sido canjeado en tu cuenta.' });
      return;
    }

    const found = REDEEM_CODES.find((c) => c.code.toUpperCase() === cleanCode);

    if (found) {
      setClaimedCodes((prev) => [...prev, cleanCode]);
      setStatusMessage({
        type: 'success',
        message: `¡Felicidades @${robloxUsername}! Has desbloqueado: ${found.rewardDescription}. Los ítems han sido acreditados a tu inventario.`,
      });
      setInputCode('');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      setStatusMessage({
        type: 'error',
        message: 'Código inválido o expirado. Revisa la lista oficial de códigos activos abajo.',
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setInputCode(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="codigos" className="py-16 sm:py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-[#161618] dark:to-neutral-950 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2">
                <Gift className="w-4 h-4" />
                <span>Recompensas Gratuitas de Temporada</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
                Hub Oficial de Códigos de Canje
              </h2>
              <p className="text-sm text-[#7B7B7B] dark:text-neutral-400 mb-6 max-w-lg">
                Ingresa los cupones activos de directos y eventos para obtener monedas bancarias, autos deportivos y pases VIP sin costo.
              </p>

              <form onSubmit={handleRedeem} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Usuario de Roblox
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: JugadorPro_RP"
                      value={robloxUsername}
                      onChange={(e) => setRobloxUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Código Promocional
                    </label>
                    <input
                      type="text"
                      placeholder="CLIC2026"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Canjear Recompensa en Roblox</span>
                </button>

                {/* Status Message Alert */}
                {statusMessage.type && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {statusMessage.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    )}
                    <span>{statusMessage.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: Active Codes List */}
            <div className="lg:col-span-5 bg-white dark:bg-neutral-850 p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 flex items-center justify-between">
                <span>Códigos Activos Verificados</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Funcionales</span>
              </h3>

              <div className="space-y-3">
                {REDEEM_CODES.map((item) => {
                  const isClaimed = claimedCodes.includes(item.code);
                  const isCopied = copiedCode === item.code;

                  return (
                    <div
                      key={item.code}
                      className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800 flex items-center justify-between gap-3 group hover:border-[#67F23B] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                            {item.code}
                          </span>
                          {isClaimed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                              Canjeado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                          {item.rewardDescription}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyCode(item.code)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-200 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Listo</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
