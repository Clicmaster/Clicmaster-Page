import React from 'react';

// Official CLICMaster brand assets uploaded by the user (WebP optimized)
export const OFFICIAL_LOGO_DARK_BG = '/assets/brand/CLIC_MASTER_final-01_a30eff56.webp'; // Black background, white CLIC, green Master
export const OFFICIAL_LOGO_LIGHT_BG = '/assets/brand/CLIC_MASTER_final-02_279d0d75.webp'; // White background, black CLIC, green Master
export const OFFICIAL_LOGO_MONO_LIGHT = '/assets/brand/CLIC_MASTER_final-04_66285d9e.webp'; // White background, all black
export const OFFICIAL_ICON_GREEN = '/assets/brand/CLIC_MASTER_final-07_0791f7ab.webp'; // Green emblem icon on white

interface ClicMasterLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'auto' | 'dark-bg' | 'light-bg' | 'icon-only';
}

export const ClicMasterLogo: React.FC<ClicMasterLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'auto',
}) => {
  // Dimension definitions matching navigation and hero proportions
  const sizeMap = {
    sm: {
      height: 'h-8 sm:h-9',
      iconWidth: 'w-8 h-8',
      subtitle: 'text-[9px]',
    },
    md: {
      height: 'h-10 sm:h-11',
      iconWidth: 'w-10 h-10',
      subtitle: 'text-[10px]',
    },
    lg: {
      height: 'h-14 sm:h-16',
      iconWidth: 'w-14 h-14',
      subtitle: 'text-xs',
    },
    xl: {
      height: 'h-20 sm:h-24',
      iconWidth: 'w-20 h-20',
      subtitle: 'text-sm',
    },
  };

  const currentSize = sizeMap[size];

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={OFFICIAL_ICON_GREEN}
          alt="Emblema Oficial CLICMaster"
          referrerPolicy="no-referrer"
          className={`${currentSize.iconWidth} object-contain rounded-xl`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* 
        Dual-theme handling:
        In Light Mode: render OFFICIAL_LOGO_LIGHT_BG (white background, crisp black 'CLIC' and neon green script 'Master')
        In Dark Mode: render OFFICIAL_LOGO_DARK_BG (black background, crisp white 'CLIC' and neon green script 'Master')
      */}
      <div className="relative shrink-0 flex flex-col items-start justify-center">
        {variant === 'auto' ? (
          <>
            {/* Light Mode Logo (Visible in light mode, hidden in dark) */}
            <img
              src={OFFICIAL_LOGO_LIGHT_BG}
              alt="CLICMaster Official Logo"
              referrerPolicy="no-referrer"
              width={1773}
              height={1772}
              decoding="async"
              className={`block dark:hidden ${currentSize.height} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
            />

            {/* Dark Mode Logo (Hidden in light mode, visible in dark) */}
            <img
              src={OFFICIAL_LOGO_DARK_BG}
              alt="CLICMaster Official Logo"
              referrerPolicy="no-referrer"
              width={1773}
              height={1772}
              decoding="async"
              className={`hidden dark:block ${currentSize.height} w-auto object-contain rounded-lg transition-transform duration-200 hover:scale-[1.02]`}
            />
          </>
        ) : variant === 'dark-bg' ? (
          <img
            src={OFFICIAL_LOGO_DARK_BG}
            alt="CLICMaster Official Logo"
            referrerPolicy="no-referrer"
            width={1773}
            height={1772}
            decoding="async"
            className={`${currentSize.height} w-auto object-contain rounded-lg`}
          />
        ) : (
          <img
            src={OFFICIAL_LOGO_LIGHT_BG}
            alt="CLICMaster Official Logo"
            referrerPolicy="no-referrer"
            width={1773}
            height={1772}
            decoding="async"
            className={`${currentSize.height} w-auto object-contain`}
          />
        )}

        {showSubtitle && (
          <span
            className={`font-black tracking-[0.25em] uppercase text-neutral-500 dark:text-neutral-400 mt-1 pl-1 ${currentSize.subtitle}`}
          >
            ROLEPLAY LATAM 2026
          </span>
        )}
      </div>
    </div>
  );
};
