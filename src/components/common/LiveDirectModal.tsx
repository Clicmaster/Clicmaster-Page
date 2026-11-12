import React from 'react';
import { HERO_IMAGE } from '../../data/serverData.ts';
import { X, Radio, Eye, MessageSquare, ExternalLink, Play } from 'lucide-react';

interface LiveDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveDirectModal: React.FC<LiveDirectModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-[#1A1A1D] max-w-3xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              TRANSMISIÓN EN VIVO OFICIAL
            </span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              CLICMaster TV 2026
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Mockup with Real Background & Play Overlay */}
        <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center">
          <img
            src={HERO_IMAGE}
            alt="Transmisión en directo del servidor"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-70"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Big Play Button */}
          <a
            href="https://youtube.com/@clicmasterrp"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 w-20 h-20 rounded-full bg-[#67F23B] hover:bg-[#52d726] text-[#121212] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 group"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </a>

          {/* Top Info overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Eye className="w-3.5 h-3.5 text-red-400" />
              <span className="font-bold tabular-nums">2,840 Espectadores en Directo</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              1080p 60FPS
            </div>
          </div>

          {/* Bottom title overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-base sm:text-lg font-black leading-tight drop-shadow">
              ¡Operativo Nocturno Especial! Persecución Masiva en la Autopista Sur y Asalto al Banco
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Conducido por Administradores y Creadores de Contenido Oficiales
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-850 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Radio className="w-4 h-4 text-[#2B6BFF]" />
            <span>Emitiendo simultáneamente en YouTube y Twitch</span>
          </div>

          <a
            href="https://youtube.com/@clicmasterrp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>Ver en YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
