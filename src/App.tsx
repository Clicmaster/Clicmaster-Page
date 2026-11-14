/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.tsx';
import { Hero } from './components/hero/Hero.tsx';
import { LiveStats } from './components/stats/LiveStats.tsx';
import { QuickAccessGrid } from './components/quick-access/QuickAccessGrid.tsx';
import { FeaturedEvent } from './components/events/FeaturedEvent.tsx';
import { ClicmasterAcademy } from './components/academy/ClicmasterAcademy.tsx';
import { ClicmasterStore } from './components/store/ClicmasterStore.tsx';
import { NewsSection } from './components/news/NewsSection.tsx';
import { InteractiveCityMap } from './components/map/InteractiveCityMap.tsx';
import { DepartmentsSection } from './components/departments/DepartmentsSection.tsx';
import { DniGenerator } from './components/dni/DniGenerator.tsx';
import { PromoCodesHub } from './components/codes/PromoCodesHub.tsx';
import { VipShop } from './components/shop/VipShop.tsx';
import { Leaderboard } from './components/ranking/Leaderboard.tsx';
import { CommunityGallery } from './components/gallery/CommunityGallery.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { RulesModal } from './components/rules/RulesModal.tsx';
import { SearchModal } from './components/common/SearchModal.tsx';
import { LiveDirectModal } from './components/common/LiveDirectModal.tsx';
import { ClicCoinsProvider } from './context/ClicCoinsContext.tsx';
import { ClicCoinsWalletModal } from './components/coins/ClicCoinsWalletModal.tsx';
import { AdminPaymentsModal } from './components/coins/AdminPaymentsModal.tsx';
import { AuthModal } from './components/coins/AuthModal.tsx';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Default to clean white theme as requested by user prompt, but allow user toggle
    return false;
  });
  const [rulesOpen, setRulesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [directOpen, setDirectOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleScrollTo = (anchorId: string) => {
    const el = document.getElementById(anchorId.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ClicCoinsProvider>
      <div className="min-h-screen w-full overflow-x-clip bg-white dark:bg-[#121212] text-[#121212] dark:text-neutral-100 font-['Plus_Jakarta_Sans'] transition-colors duration-200">
        {/* 1. Header Navigation Bar */}
        <Navbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenRules={() => setRulesOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

      {/* Main Page Flow */}
      <main>
        {/* 2. Hero Section */}
        <Hero
          onOpenDirect={() => setDirectOpen(true)}
          onOpenRules={() => setRulesOpen(true)}
        />

        {/* 3. Live Dynamic Statistics (Discord, TikTok, YouTube, Roblox Live) */}
        <LiveStats />

        {/* 4. Quick Access Grid (12 core modules) */}
        <QuickAccessGrid
          onOpenRules={() => setRulesOpen(true)}
          onOpenCodes={() => handleScrollTo('codigos')}
          onOpenDni={() => handleScrollTo('dni')}
        />

        {/* 5. Featured Event with Live Countdown & Auto Slider */}
        <FeaturedEvent />

        {/* 5.5. Clicmaster Academy: Aprende a crear mundos y experiencias en Roblox */}
        <ClicmasterAcademy />

        {/* 5.6. CLICMASTER STORE: Productos Virtuales, Merch Oficial & Packs */}
        <ClicmasterStore />

        {/* 6. Latest News & Patch Notes */}
        <NewsSection />

        {/* 7. Interactive City Map with 12 POI Markers */}
        <InteractiveCityMap />

        {/* 8. Departments & Official Factions */}
        <DepartmentsSection />

        {/* 9. Interactive Citizen DNI Virtual Card Generator */}
        <DniGenerator />

        {/* 10. Promo Codes Redeem Hub */}
        <PromoCodesHub />

        {/* 11. VIP Shop & Gamepasses */}
        <VipShop />

        {/* 12. Player Ranking & Leaderboard */}
        <Leaderboard />

        {/* 13. Community Real Gallery & Social Media */}
        <CommunityGallery />
      </main>

      {/* 14. Footer with Panoramic Skyline */}
      <Footer
        onOpenRules={() => setRulesOpen(true)}
        onOpenDni={() => handleScrollTo('dni')}
        onOpenCodes={() => handleScrollTo('codigos')}
      />

      {/* Global Modals */}
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAction={(anchor) => handleScrollTo(anchor)}
      />
      <LiveDirectModal isOpen={directOpen} onClose={() => setDirectOpen(false)} />

      {/* ClicCoins Virtual Economy Modals */}
      <ClicCoinsWalletModal />
      <AdminPaymentsModal />
      <AuthModal />
    </div>
  </ClicCoinsProvider>
  );
}
