import React, { useState, useEffect } from 'react';
import { ClicMasterLogo } from '../common/ClicMasterLogo.tsx';
import { ClicCoinsBadge } from '../coins/ClicCoinsBadge.tsx';
import { Search, Moon, Sun, Menu, X, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenRules: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  darkMode,
  onToggleDarkMode,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#' },
    { label: 'Store', href: '#store' },
    { label: 'Eventos', href: '#eventos' },
    { label: 'Academy', href: '#academy' },
    { label: 'Noticias', href: '#noticias' },
    { label: 'Mapa', href: '#mapa' },
    { label: 'Facciones', href: '#facciones' },
    { label: 'DNI', href: '#dni' },
    { label: 'Comunidad', href: '#comunidad' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md shadow-sm border-b border-neutral-200/80 dark:border-neutral-800/80 py-2.5'
          : 'bg-white/75 dark:bg-[#121212]/75 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-900 py-3'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Zone 1: Official Logo */}
          <a
            href="#"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B] rounded-lg shrink-0"
            aria-label="CLICMaster Roleplay Inicio"
          >
            <ClicMasterLogo size="sm" showSubtitle={false} />
          </a>

          {/* Zone 2: Navigation Links */}
          <nav
            className="hidden xl:flex items-center gap-3.5 2xl:gap-6 text-[13px] 2xl:text-sm font-semibold text-[#121212] dark:text-neutral-200 min-w-0"
            aria-label="Navegación principal"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="whitespace-nowrap transition-colors hover:text-[#2B6BFF] dark:hover:text-[#67F23B] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#67F23B] py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Search, Theme Toggle & Compact Discord Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* ClicCoins Real-Time Counter & Wallet Modal Trigger */}
            <ClicCoinsBadge />

            {/* Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/80 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B]"
              aria-label="Buscar en CLICMaster"
              title="Buscar (Ctrl + K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/80 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B]"
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* Compact Primary Action Button: UNIRSE AL DISCORD */}
            <a
              href="https://discord.gg/clicmaster"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] font-extrabold text-[#121212] bg-[#67F23B] hover:bg-[#52d627] active:scale-95 transition-all duration-200 rounded-lg shadow-xs hover:shadow-[0_0_16px_rgba(103,242,59,0.35)] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#67F23B]"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="hidden sm:inline">Unirse al Discord</span>
              <span className="sm:hidden">Discord</span>
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 xl:hidden text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pb-4 border-t border-neutral-200 dark:border-neutral-800 pt-3 animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="sm:hidden flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 mb-1"
              >
                <Search className="w-4 h-4" />
                <span>Buscar en CLICMaster</span>
              </button>

              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-base font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <a
                  href="https://discord.gg/clicmaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#67F23B] text-sm font-extrabold text-[#121212] rounded-xl text-center"
                >
                  <span>Unirse al Discord</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
