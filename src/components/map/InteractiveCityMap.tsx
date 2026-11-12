import React, { useState } from 'react';
import { MAP_POIS } from '../../data/serverData.ts';
import { MapPOI } from '../../types/index.ts';
import {
  MapPin,
  Radio,
  Users,
  Compass,
  Check,
  Copy,
  ChevronRight,
  Crosshair,
  Building2,
  Car,
  Shield,
  HeartPulse,
  Flame,
  Plane,
  Trees,
} from 'lucide-react';

export const InteractiveCityMap: React.FC = () => {
  const [selectedPoi, setSelectedPoi] = useState<MapPOI>(MAP_POIS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [copiedCoords, setCopiedCoords] = useState(false);

  const categories = [
    'Todos',
    'Hospital',
    'Policía',
    'Bomberos',
    'Ayuntamiento',
    'Banco',
    'Concesionarios',
    'Casas',
    'Aeropuerto',
  ];

  const filteredPois =
    activeCategory === 'Todos'
      ? MAP_POIS
      : MAP_POIS.filter((poi) => poi.category === activeCategory);

  const handleCopyCoords = (poi: MapPOI) => {
    navigator.clipboard.writeText(`GPS: X:${poi.coordinates.x * 10}, Y:${poi.coordinates.y * 10} - ${poi.name}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hospital':
        return HeartPulse;
      case 'Policía':
        return Shield;
      case 'Bomberos':
        return Flame;
      case 'Aeropuerto':
        return Plane;
      case 'Concesionarios':
        return Car;
      case 'Parques':
        return Trees;
      default:
        return Building2;
    }
  };

  return (
    <section id="mapa" className="py-16 sm:py-24 bg-[#F5F7FA] dark:bg-[#151517] border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Cartografía Oficial de Brookhaven Latam</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Mapa Interactivo de la Metrópolis
            </h2>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#121212] dark:bg-[#67F23B] text-white dark:text-[#121212]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Map Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Visual Interactive Map Canvas Container */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1A1A1D] rounded-3xl p-4 sm:p-6 border border-neutral-200/90 dark:border-neutral-800 shadow-xl relative overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[#258712] dark:text-[#67F23B]">
                  <Crosshair className="w-4 h-4" />
                  <span>GPS Satelital Activo</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Resolución 1080p UHD</span>
              </div>
              <div className="text-[11px] tabular-nums">
                {filteredPois.length} Marcadores Disponibles
              </div>
            </div>

            {/* Interactive Vector Board */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 select-none shadow-inner">
              {/* Stylized Metropolitan Grid Map Pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                {/* Background Roads & Grids */}
                <defs>
                  <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#0f172a" />
                <rect width="100%" height="100%" fill="url(#city-grid)" />

                {/* Main Avenues */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#475569" strokeWidth="12" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 8" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#475569" strokeWidth="12" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 8" />

                {/* Diagonal Highways */}
                <line x1="10%" y1="100%" x2="90%" y2="0" stroke="#334155" strokeWidth="8" />
                <line x1="0" y1="20%" x2="100%" y2="85%" stroke="#334155" strokeWidth="8" />

                {/* Central Park Lake & Green Space */}
                <rect x="42%" y="45%" width="22%" height="20%" rx="16" fill="#14532d" opacity="0.75" />
                <ellipse cx="53%" cy="55%" rx="6%" ry="4%" fill="#0284c7" opacity="0.85" />

                {/* Airport Runway */}
                <rect x="5%" y="82%" width="22%" height="10%" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                <line x1="7%" y1="87%" x2="25%" y2="87%" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
              </svg>

              {/* Real Interactive Markers on Map */}
              {filteredPois.map((poi) => {
                const isSelected = selectedPoi.id === poi.id;
                const IconComponent = getCategoryIcon(poi.category);

                return (
                  <button
                    key={poi.id}
                    onClick={() => setSelectedPoi(poi)}
                    style={{
                      left: `${poi.coordinates.x}%`,
                      top: `${poi.coordinates.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none transition-all duration-300 ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                    aria-label={`Ver información de ${poi.name}`}
                  >
                    {/* Ripple on active */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-[#67F23B] opacity-50 animate-ping" />
                    )}

                    {/* Marker badge */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors ${
                        isSelected
                          ? 'bg-[#67F23B] text-[#121212] border-white ring-4 ring-[#67F23B]/30'
                          : 'bg-[#121212] text-white border-neutral-600 hover:border-[#67F23B]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Hover tooltip label */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 text-[11px] font-bold bg-black/90 text-white rounded-md whitespace-nowrap shadow-md pointer-events-none border border-neutral-700">
                      {poi.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Map Bottom Legend */}
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#67F23B]" />
                  <span>Ubicación Seleccionada</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>Puntos de Interés</span>
                </span>
              </div>
              <div>Haz clic en cualquier punto para abrir su ficha informativa</div>
            </div>
          </div>

          {/* Ficha de Localización (Sidebar Info Panel) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#1A1A1D] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col justify-between">
            <div>
              {/* Location Cover Image */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={selectedPoi.image}
                  alt={selectedPoi.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#67F23B] text-[#121212]">
                    {selectedPoi.category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[11px] font-semibold text-neutral-300">
                    {selectedPoi.address}
                  </div>
                </div>
              </div>

              {/* Ficha Body */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {selectedPoi.state}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <Users className="w-3.5 h-3.5 text-[#2B6BFF]" />
                    <span className="tabular-nums font-semibold">{selectedPoi.staffOnline} personal de turno</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-neutral-900 dark:text-white leading-tight mb-3">
                  {selectedPoi.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#7B7B7B] dark:text-neutral-300 leading-relaxed mb-5">
                  {selectedPoi.description}
                </p>

                {/* Radio Frequency (if available) */}
                {selectedPoi.radioFrequency && (
                  <div className="mb-5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#2B6BFF]" />
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Frecuencia Radial Oficial
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[#121212] dark:text-[#67F23B] tabular-nums font-mono">
                      {selectedPoi.radioFrequency}
                    </span>
                  </div>
                )}

                {/* Services List */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                    Servicios Disponibles
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedPoi.services.map((srv, index) => (
                      <li
                        key={index}
                        className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-[#32B818] shrink-0" />
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-2.5">
              <button
                onClick={() => handleCopyCoords(selectedPoi)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Coordenadas GPS Copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Coordenadas GPS para Roblox</span>
                  </>
                )}
              </button>

              <a
                href="https://discord.gg/clicmaster"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors block"
              >
                Solicitar Asistencia en Frecuencia Radial
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
