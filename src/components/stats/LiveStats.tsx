import React, { useState, useEffect } from 'react';
import { SERVER_METRICS } from '../../data/serverData.ts';
import { Radio, RefreshCw, Copy, Check, TrendingUp } from 'lucide-react';

export const LiveStats: React.FC = () => {
  const [metrics, setMetrics] = useState(SERVER_METRICS);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic live player fluctuation simulation (ready for Firebase onSnapshot)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        const newPlayers = Math.max(1200, prev.robloxConnected + delta);
        return {
          ...prev,
          robloxConnected: newPlayers,
        };
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setMetrics((prev) => ({
        ...prev,
        robloxConnected: prev.robloxConnected + Math.floor(Math.random() * 5) + 1,
        discordOnline: prev.discordOnline + Math.floor(Math.random() * 7) + 2,
      }));
      setIsSyncing(false);
    }, 700);
  };

  const handleCopyServerLink = () => {
    navigator.clipboard.writeText('https://discord.gg/clicmaster');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="py-10 bg-[#F5F7FA] dark:bg-[#161618] border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Sync status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67F23B] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#42D425]" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Estadísticas de la Comunidad en Tiempo Real
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors disabled:opacity-60"
              title="Sincronizar métricas con Firebase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#42D425]' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Actualizar'}</span>
            </button>

            <button
              onClick={handleCopyServerLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors"
              title="Copiar invitación oficial de Discord"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#32B818]" />
                  <span className="text-[#32B818] font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Discord</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Roblox Connected Players */}
          <div className="bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#67F23B] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Roblox En Vivo
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#67F23B]/15 text-[#258712] dark:text-[#67F23B] flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tabular-nums tracking-tight">
              {metrics.robloxConnected.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#3BB81F] dark:text-[#67F23B]" />
              <span className="font-semibold text-[#258712] dark:text-[#67F23B]">Pico 24h: {metrics.peakPlayers24h}</span>
              <span aria-hidden="true">·</span>
              <span>Servidor #1 Latam</span>
            </div>
          </div>

          {/* Card 2: Discord Members */}
          <div className="bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm group hover:border-[#5865F2] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Servidor de Discord
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#5865F2]/15 text-[#5865F2] flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tabular-nums tracking-tight">
              {metrics.discordMembers.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5865F2]" />
              <span className="font-semibold">{metrics.discordOnline.toLocaleString()} en línea ahora</span>
            </div>
          </div>

          {/* Card 3: TikTok Followers */}
          <div className="bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm group hover:border-pink-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                TikTok Oficial
              </span>
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-500 flex items-center justify-center font-bold text-xs">
                TT
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tabular-nums tracking-tight">
              {metrics.tiktokFollowers}
            </div>
            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <span>{metrics.tiktokLikes} me gusta acumulados</span>
            </div>
          </div>

          {/* Card 4: YouTube Subscribers */}
          <div className="bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm group hover:border-red-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Canal de YouTube
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center font-bold text-xs">
                YT
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tabular-nums tracking-tight">
              {metrics.youtubeSubscribers}
            </div>
            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <span>{metrics.youtubeVideos}+ directos y tutoriales</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
