import React, { useState, useEffect } from 'react';
import { NEWS_ARTICLES, MAP_POIS, DEPARTMENTS_DATA, SHOP_ITEMS } from '../../data/serverData.ts';
import { Search, X, MapPin, Newspaper, Shield, ShoppingBag, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (anchor: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const newsResults = cleanQuery
    ? NEWS_ARTICLES.filter((n) => n.title.toLowerCase().includes(cleanQuery))
    : [];

  const mapResults = cleanQuery
    ? MAP_POIS.filter((m) => m.name.toLowerCase().includes(cleanQuery) || m.category.toLowerCase().includes(cleanQuery))
    : [];

  const factionResults = cleanQuery
    ? DEPARTMENTS_DATA.filter((d) => d.name.toLowerCase().includes(cleanQuery) || d.shortName.toLowerCase().includes(cleanQuery))
    : [];

  const shopResults = cleanQuery
    ? SHOP_ITEMS.filter((s) => s.title.toLowerCase().includes(cleanQuery) || s.category.toLowerCase().includes(cleanQuery))
    : [];

  const academyMatched = cleanQuery && (
    'academy'.includes(cleanQuery) ||
    'roblox studio'.includes(cleanQuery) ||
    'lua'.includes(cleanQuery) ||
    'curso'.includes(cleanQuery) ||
    'aprender'.includes(cleanQuery) ||
    'crear mundos'.includes(cleanQuery)
  );

  const storeMatched = cleanQuery && (
    'store'.includes(cleanQuery) ||
    'merch'.includes(cleanQuery) ||
    'hoodie'.includes(cleanQuery) ||
    'gorra'.includes(cleanQuery) ||
    'mousepad'.includes(cleanQuery) ||
    'pack'.includes(cleanQuery) ||
    'franela'.includes(cleanQuery)
  );

  const hasResults =
    Boolean(academyMatched) ||
    Boolean(storeMatched) ||
    newsResults.length > 0 ||
    mapResults.length > 0 ||
    factionResults.length > 0 ||
    shopResults.length > 0;

  const handleNavigate = (anchor: string) => {
    onClose();
    if (onSelectAction) {
      onSelectAction(anchor);
    } else {
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1A1A1D] max-w-xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar en CLICMaster (hospital, policía, v5.2, vip, armas)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {!cleanQuery ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Escribe para buscar facciones, edificios en el mapa, parches o compras en la tienda.
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No se encontraron coincidencias para "{query}". Intenta con otro término.
            </div>
          ) : (
            <>
              {/* Academy */}
              {academyMatched && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7CFF3A]" />
                    <span>Clicmaster Academy</span>
                  </div>
                  <button
                    onClick={() => handleNavigate('#academy')}
                    className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center justify-between text-xs transition-colors border border-neutral-200 dark:border-neutral-750"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        Clicmaster Academy: Aprende a Crear Mundos en Roblox
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        10 niveles · Roblox Studio, Lua Scripting, Discord & Monetización
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#258712] dark:text-[#7CFF3A] shrink-0" />
                  </button>
                </div>
              )}

              {/* CLICMASTER STORE */}
              {storeMatched && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7CFF3A]" />
                    <span>CLICMASTER STORE</span>
                  </div>
                  <button
                    onClick={() => handleNavigate('#store')}
                    className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center justify-between text-xs transition-colors border border-neutral-200 dark:border-neutral-750"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        🛍 CLICMASTER STORE: Productos Virtuales & Merch Oficial
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Hoodies, Gorras, Mousepads, Packs y Artículos VIP
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#258712] dark:text-[#7CFF3A] shrink-0" />
                  </button>
                </div>
              )}

              {/* Map POIs */}
              {mapResults.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2B6BFF]" />
                    <span>Ubicaciones en el Mapa</span>
                  </div>
                  <div className="space-y-1">
                    {mapResults.map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => handleNavigate('#mapa')}
                        className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-bold text-neutral-900 dark:text-white">{poi.name}</span>
                        <span className="text-neutral-500">{poi.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Factions */}
              {factionResults.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#32B818]" />
                    <span>Facciones & Departamentos</span>
                  </div>
                  <div className="space-y-1">
                    {factionResults.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => handleNavigate('#facciones')}
                        className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-bold text-neutral-900 dark:text-white">{dept.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop */}
              {shopResults.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tienda VIP</span>
                  </div>
                  <div className="space-y-1">
                    {shopResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate('#tienda')}
                        className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-bold text-neutral-900 dark:text-white">{item.title}</span>
                        <span className="text-emerald-600 font-bold">{item.priceCLIC > 0 ? `$${item.priceCLIC.toLocaleString()} CLIC` : `${item.priceRobux} Robux`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {newsResults.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Noticias</span>
                  </div>
                  <div className="space-y-1">
                    {newsResults.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleNavigate('#noticias')}
                        className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-bold text-neutral-900 dark:text-white truncate">{article.title}</span>
                        <span className="text-neutral-400 shrink-0">{article.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
