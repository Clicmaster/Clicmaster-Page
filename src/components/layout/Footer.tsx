import React, { useState } from 'react';
import { ClicMasterLogo } from '../common/ClicMasterLogo.tsx';
import { HERO_IMAGE } from '../../data/serverData.ts';
import { ShieldCheck, Heart, Sparkles, X, FileText, Globe } from 'lucide-react';

interface FooterProps {
  onOpenRules: () => void;
  onOpenDni: () => void;
  onOpenCodes: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRules, onOpenDni, onOpenCodes }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSitemapModal, setShowSitemapModal] = useState(false);

  return (
    <footer className="relative bg-white dark:bg-[#0E0E10] border-t border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 overflow-hidden">
      {/* Panoramic Skyline Illustration Banner */}
      <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800">
        <img
          src={HERO_IMAGE}
          alt="Skyline panorámico de la metrópolis de CLICMaster Brookhaven"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top opacity-35 dark:opacity-20 filter grayscale-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-[#0E0E10] dark:via-[#0E0E10]/70 dark:to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#248811] dark:text-[#67F23B] mb-2">
            La Experiencia Definitiva de Rol en Español
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            ¿Listo para construir tu propia historia en Brookhaven?
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://discord.gg/clicmaster"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors shadow-md"
            >
              Unirse al Discord Oficial
            </a>
            <button
              onClick={onOpenDni}
              className="px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Crear DNI Gratis
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <ClicMasterLogo size="md" showSubtitle={true} />
            <p className="text-xs sm:text-sm text-[#7B7B7B] dark:text-neutral-400 max-w-sm leading-relaxed">
              La plataforma y servidor de Roleplay más grande y activo de Roblox en América Latina. Economía interactiva, instituciones serias, sistema de leyes y comunidad inclusiva.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-[#67F23B]">
              <span className="w-2 h-2 rounded-full bg-[#67F23B] animate-pulse" />
              <span>Servidores Operativos 24/7 sin Interrupciones</span>
            </div>
          </div>

          {/* Column: Navegación */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Inicio del Servidor
                </a>
              </li>
              <li>
                <a href="#eventos" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Calendario de Eventos
                </a>
              </li>
              <li>
                <a href="#academy" className="hover:text-neutral-900 dark:hover:text-white transition-colors font-bold text-[#258712] dark:text-[#67F23B]">
                  Clicmaster Academy
                </a>
              </li>
              <li>
                <a href="#noticias" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Noticias & Parches
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Servicios & Comunidad */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Herramientas
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={onOpenDni} className="hover:text-neutral-900 dark:hover:text-white text-left transition-colors">
                  Generador de DNI
                </button>
              </li>
              <li>
                <button onClick={onOpenCodes} className="hover:text-neutral-900 dark:hover:text-white text-left transition-colors">
                  Hub de Códigos
                </button>
              </li>
              <li>
                <a href="#store" className="hover:text-neutral-900 dark:hover:text-white transition-colors font-bold text-[#1a6b0c] dark:text-[#7CFF3A]">
                  CLICMASTER STORE
                </a>
              </li>
              <li>
                <a href="#tienda" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Gamepasses & VIP
                </a>
              </li>
              <li>
                <a href="#ranking" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Ranking de Jugadores
                </a>
              </li>
              <li>
                <button onClick={onOpenRules} className="hover:text-neutral-900 dark:hover:text-white text-left transition-colors">
                  Normativas & Reglas
                </button>
              </li>
            </ul>
          </div>

          {/* Column: Legal & Políticas */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Legal & SEO
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-neutral-900 dark:hover:text-white text-left transition-colors"
                >
                  Términos y Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowSitemapModal(true)}
                  className="hover:text-neutral-900 dark:hover:text-white text-left transition-colors"
                >
                  Mapa del Sitio (Sitemap XML)
                </button>
              </li>
              <li>
                <a
                  href="https://discord.gg/clicmaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Soporte & Tickets
                </a>
              </li>
              <li>
                <span className="text-neutral-400 block">Roblox Fan Server</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Credits */}
        <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>© 2026 CLICMaster Roleplay. Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Roblox es marca registrada de Roblox Corporation. Servidor comunitario oficial no afiliado directamente.</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1A1D] max-w-lg w-full rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                Términos de Servicio y Privacidad
              </h4>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto">
              <p>
                <strong>1. Compromiso de Datos:</strong> CLICMaster respeta la privacidad de todos sus usuarios. La información ingresada en el generador de DNI, compras o códigos no es compartida con terceros y se utiliza estrictamente con fines de entretenimiento dentro del servidor de Roblox.
              </p>
              <p>
                <strong>2. Conducta en el Servidor:</strong> Todo usuario se compromete a respetar las normativas de no discriminación, evitar lenguaje de odio y mantener un rol enriquecedor para toda la comunidad.
              </p>
              <p>
                <strong>3. Compras y Donaciones:</strong> Los pases VIP y objetos son ítems virtuales dentro de la experiencia de Roblox y aplican las políticas estándar de la plataforma.
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-[#67F23B] text-[#121212]"
            >
              Cerrar y Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Sitemap Modal */}
      {showSitemapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1A1D] max-w-lg w-full rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2B6BFF]" />
                <span>Estructura del Sitio (Sitemap & Schema)</span>
              </h4>
              <button
                onClick={() => setShowSitemapModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs font-mono text-neutral-600 dark:text-neutral-300 space-y-2 max-h-[60vh] overflow-y-auto bg-neutral-50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div>https://clicmaster.roblox.lat/ (Prioridad 1.0)</div>
              <div>├── #eventos (Calendario Oficial)</div>
              <div>├── #academy (Clicmaster Academy 10 Niveles)</div>
              <div>├── #noticias (Actualizaciones v5.2)</div>
              <div>├── #mapa (Cartografía Satelital)</div>
              <div>├── #facciones (Policía, SAMUR, Bomberos)</div>
              <div>├── #dni (Registro Civil)</div>
              <div>├── #tienda (Pases VIP)</div>
              <div>├── #ranking (Leaderboard 2026)</div>
              <div>└── #codigos (Hub Promocional)</div>
            </div>
            <button
              onClick={() => setShowSitemapModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-[#67F23B] text-[#121212]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
