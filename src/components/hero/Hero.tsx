import React from 'react';
import { HERO_IMAGE } from '../../data/serverData.ts';
import { ClicMasterLogo } from '../common/ClicMasterLogo.tsx';
import { Play, Sparkles, ShieldCheck, Users, Gamepad2, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenDirect: () => void;
  onOpenRules: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDirect, onOpenRules }) => {
  return (
    <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-20 overflow-hidden bg-white dark:bg-[#121212]">
      {/* Background Ambient Glow & Light Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#67F23B]/20 via-[#42D425]/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Kicker Tag */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/80">
            <Sparkles className="w-3.5 h-3.5 text-[#3BB81F] dark:text-[#67F23B]" />
            <span>Temporada 2026 // Servidor v5.2</span>
          </span>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>Roleplay Serio & Economía Real</span>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-[#2B6BFF] font-medium">Whitelist Abierta</span>
        </div>

        {/* 2-Column Split: Hero Headline & Content / Cinematic Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Column 1: Copywriting & Primary CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="mb-4">
              <ClicMasterLogo size="lg" showSubtitle={true} />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-[#121212] dark:text-white leading-[1.08] mb-5 text-balance">
              La comunidad de Roleplay más activa de{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#218d0d] via-[#32B818] to-[#1e7b0c] dark:from-[#67F23B] dark:via-[#42D425] dark:to-[#7EFF45]">
                  Latinoamérica
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#67F23B]/20 -rotate-1 -z-0 rounded" />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#7B7B7B] dark:text-neutral-300 leading-relaxed mb-8 max-w-xl">
              Vive una metrópolis inspirada en Brookhaven con más de 1,400 jugadores simultáneos. Facciones oficiales de Policía, Hospital y Bomberos, negocios propios, superdeportivos hiperrealistas y economía balanceada.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              {/* Button 1: Unirse al Discord */}
              <a
                href="https://discord.gg/clicmaster"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-[#121212] bg-[#67F23B] hover:bg-[#52d627] active:scale-98 transition-all rounded-xl shadow-md hover:shadow-[0_4px_24px_rgba(103,242,59,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Unirse al Discord</span>
              </a>

              {/* Button 2: Ver último directo */}
              <button
                onClick={onOpenDirect}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-neutral-800 dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all rounded-xl border border-neutral-200 dark:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Ver último directo</span>
              </button>

              {/* Button 3: Jugar en Roblox */}
              <a
                href="https://www.roblox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Jugar en Roblox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#7B7B7B] dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3BB81F] dark:text-[#67F23B]" />
                <span>Anticheat & Moderación 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2B6BFF]" />
                <span>+48,000 Miembros Activos</span>
              </div>
            </div>
          </div>

          {/* Column 2: Cinematic City Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-neutral-800 group bg-neutral-100 dark:bg-neutral-900">
              {/* Main Image with fallback */}
              <img
                src={HERO_IMAGE}
                alt="Vista cinematográfica de la metrópolis de CLICMaster inspirada en Brookhaven"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[440px] md:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
                width={1376}
                height={768}
                decoding="async"
              />

              {/* Scrim overlay for light & depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Live Badge top-right */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#67F23B] animate-pulse" />
                <span>METRÓPOLIS EN VIVO</span>
              </div>

              {/* Floating Bottom Card: Quick Server Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-neutral-800 shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#67F23B]/20 text-[#248811] dark:text-[#67F23B] flex items-center justify-center font-bold text-sm shrink-0">
                    RP
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                      Distrito Brookhaven Latam
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Servidor Oficial #01 · IP Automática en Roblox
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenRules}
                  className="px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Ver Normativas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
