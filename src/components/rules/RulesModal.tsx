import React, { useState } from 'react';
import { SERVER_RULES } from '../../data/serverData.ts';
import { X, ShieldAlert, Check, Search, BookOpen, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredRules = SERVER_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1A1A1D] max-w-2xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#67F23B]/20 text-[#218610] dark:text-[#67F23B] flex items-center justify-center font-bold text-base">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                Normativas Oficiales de Roleplay (2026)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Reglamento sancionatorio de convivencia ciudadana
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar regla (RDM, VDM, Metagaming, NVHQ)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
            />
          </div>
        </div>

        {/* Rules Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>
              El desconocimiento de estas normativas no exime de su cumplimiento. Toda infracción grave registrada por nuestro sistema o reportada con vídeo en Discord conlleva sanciones temporales o expulsión permanente.
            </span>
          </div>

          <div className="space-y-3">
            {filteredRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80"
              >
                <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#67F23B]" />
                  <span>{rule.title}</span>
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Última revisión: Octubre 2026 · Versión 5.2
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#67F23B] text-[#121212] hover:bg-[#52d726] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
