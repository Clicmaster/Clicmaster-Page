import React from 'react';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';
import { Coins, Plus, ShieldCheck, LogIn } from 'lucide-react';

export const ClicCoinsBadge: React.FC = () => {
  const { balance, pendingPayments, isAdmin, isLoggedIn, setWalletOpen, setAdminPanelOpen, setAuthOpen } =
    useClicCoins();

  // Sin sesión: mostrar botón para entrar
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => setAuthOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] text-xs font-black transition-colors shadow-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B]"
        title="Inicia sesión para usar ClicCoins"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Entrar</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* ClicCoins Wallet Trigger Button */}
      <button
        onClick={() => setWalletOpen(true)}
        className="group relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#67F23B]/10 to-amber-500/10 hover:from-amber-500/20 hover:to-[#67F23B]/20 border border-amber-500/30 dark:border-[#67F23B]/30 hover:border-[#67F23B] transition-all duration-300 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B]"
        title="Gestionar ClicCoins y Recargas"
        aria-label={`Saldo de ClicCoins: ${balance.toLocaleString()}`}
      >
        {/* Animated Coin Icon */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-amber-400 to-[#67F23B] flex items-center justify-center text-[#121212] shadow-xs group-hover:scale-110 transition-transform shrink-0">
          <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
        </div>

        {/* Balance Counter */}
        <div className="flex flex-col text-left leading-none">
          <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            ClicCoins
          </span>
          <span className="text-xs font-black text-neutral-900 dark:text-white tabular-nums tracking-tight">
            {balance.toLocaleString()}
          </span>
        </div>

        {/* Plus badge */}
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#67F23B] text-[#121212] flex items-center justify-center ml-0.5 group-hover:rotate-90 transition-transform shrink-0">
          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
        </div>
      </button>

      {/* Admin Quick Action Button (si es admin o hay pendientes) */}
      {isAdmin && (
        <button
          onClick={() => setAdminPanelOpen(true)}
          className="relative hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-800 text-[11px] font-bold border border-neutral-700 hover:border-[#67F23B] transition-colors shadow-xs shrink-0"
          title="Panel de Pagos Pendientes (Admin)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#67F23B] shrink-0" />
          <span>Admin</span>
          {pendingPayments.length > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-500 text-[#121212] animate-pulse leading-none">
              {pendingPayments.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
