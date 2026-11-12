import React, { useState } from 'react';
import { LEADERBOARD_DATA } from '../../data/serverData.ts';
import { Trophy, Search, CheckCircle, Clock, DollarSign, Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingFilter, setRankingFilter] = useState<'all' | 'level' | 'money' | 'hours'>('all');

  const filteredPlayers = LEADERBOARD_DATA.filter(
    (p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.faction.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (rankingFilter === 'money') return b.cleanMoney - a.cleanMoney;
    if (rankingFilter === 'hours') return b.playtimeHours - a.playtimeHours;
    return b.level - a.level;
  });

  return (
    <section id="ranking" className="py-16 sm:py-24 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Cuadro de Honor Temporada 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Ranking Oficial de Jugadores Destacados
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o facción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
            />
          </div>
        </div>

        {/* Season Rewards Strip */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Premios de Fin de Temporada
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                El Top 3 de cada categoría recibirá $5,000,000 CLIC Coins + Trofeo exclusivo en su perfil y Pase VIP Diamante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setRankingFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rankingFilter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setRankingFilter('money')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rankingFilter === 'money'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Más Ricos
            </button>
            <button
              onClick={() => setRankingFilter('hours')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rankingFilter === 'hours'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Más Horas
            </button>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="bg-white dark:bg-[#1A1A1D] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/60 text-[11px] font-black uppercase tracking-wider text-neutral-400">
                  <th className="py-4 px-6 text-center w-16">Puesto</th>
                  <th className="py-4 px-6">Ciudadano / Roblox</th>
                  <th className="py-4 px-6">Facción</th>
                  <th className="py-4 px-6 text-center">Nivel & XP</th>
                  <th className="py-4 px-6 text-right">Patrimonio Limpio</th>
                  <th className="py-4 px-6 text-center">Horas en Servidor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs sm:text-sm">
                {filteredPlayers.map((player, idx) => (
                  <tr
                    key={player.username}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Rank position */}
                    <td className="py-4 px-6 text-center font-black">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-neutral-900 font-extrabold text-xs shadow-xs">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-300 text-neutral-900 font-extrabold text-xs">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/80 text-white font-extrabold text-xs">
                          3
                        </span>
                      ) : (
                        <span className="font-mono text-neutral-500 text-xs">{idx + 1}</span>
                      )}
                    </td>

                    {/* Player Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatarUrl}
                          alt={player.displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover bg-neutral-200 border border-neutral-300 dark:border-neutral-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white leading-tight">
                            <span>{player.displayName}</span>
                            {player.verifiedRoblox && (
                              <span title="Cuenta de Roblox verificada" className="inline-flex">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2B6BFF] shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-neutral-500">
                            @{player.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Faction */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {player.faction}
                      </span>
                    </td>

                    {/* Level & XP */}
                    <td className="py-4 px-6 text-center">
                      <div className="font-black text-neutral-900 dark:text-white tabular-nums">
                        Nivel {player.level}
                      </div>
                      <div className="text-[11px] text-neutral-400 tabular-nums font-mono">
                        {player.xp.toLocaleString()} XP
                      </div>
                    </td>

                    {/* Clean Money */}
                    <td className="py-4 px-6 text-right">
                      <div className="font-extrabold text-[#228410] dark:text-[#67F23B] tabular-nums font-mono flex items-center justify-end gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{player.cleanMoney.toLocaleString()} CLIC</span>
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{player.playtimeHours} hrs</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
