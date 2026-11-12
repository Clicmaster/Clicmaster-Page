import React, { useState } from 'react';
import { Camera, X, Maximize2 } from 'lucide-react';

// Imágenes reales de la comunidad CLICMaster optimizadas en alta definición WebP
const GALLERY_RALI = '/assets/gallery/clicmaster_rali_business_center.webp';
const GALLERY_MAPACHES = '/assets/gallery/clicmaster_avenida_mapaches.webp';
const GALLERY_PUENTE = '/assets/gallery/clicmaster_puente_peatonal.webp';
const GALLERY_AUTOPISTA = '/assets/gallery/clicmaster_autopista_bahia.webp';
const GALLERY_TORRE = '/assets/gallery/clicmaster_torre_rascacielos.webp';
const GALLERY_BOULEVARD = '/assets/gallery/clicmaster_costanera_boulevard.webp';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Ciudad' | 'Comunidad' | 'Infraestructura' | 'Costanera';
  image: string;
  description: string;
  photographer: string;
}

export const CommunityGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-1',
      title: 'Centro Empresarial RALI & Torres Gemelas',
      category: 'Ciudad',
      image: GALLERY_RALI,
      description: 'Edificio corporativo principal con valla publicitaria y vista a los rascacielos gemelos del distrito financiero.',
      photographer: '@Comunidad_CLIC',
    },
    {
      id: 'gal-2',
      title: 'Paseo de las Banderas & Zona de Entregas',
      category: 'Comunidad',
      image: GALLERY_MAPACHES,
      description: 'Escena cotidiana del servidor con mapachitos curiosos custodiando una mochila de pedidos en la gran avenida.',
      photographer: '@DeliveryDriver_RP',
    },
    {
      id: 'gal-3',
      title: 'Puente Peatonal de la Gran Vía',
      category: 'Infraestructura',
      image: GALLERY_PUENTE,
      description: 'Paso elevado arquitrabado con barandales rojos cruzando la autopista metropolitana hacia las torres de cristal.',
      photographer: '@UrbanBuilder_RP',
    },
    {
      id: 'gal-4',
      title: 'Corredor Costero & Rampa a la Bahía',
      category: 'Costanera',
      image: GALLERY_AUTOPISTA,
      description: 'Autopista de alta velocidad con vegetación tropical, palmeras y acceso directo al frente marítimo de la ciudad.',
      photographer: '@SpeedwayRP',
    },
    {
      id: 'gal-5',
      title: 'Distrito Financiero & Skylines Modernos',
      category: 'Ciudad',
      image: GALLERY_TORRE,
      description: 'Perspectiva vertical de rascacielos corporativos vidriados con estandartes tricolores en el alumbrado público.',
      photographer: '@SkylineExplorer',
    },
    {
      id: 'gal-6',
      title: 'Malecón Costero & Bulevar Marítimo',
      category: 'Costanera',
      image: GALLERY_BOULEVARD,
      description: 'Avenida costera bordeada de palmeras con tránsito de vehículos, peatones paseando y vista panorámica al océano.',
      photographer: '@RoleplayLatam',
    },
  ];

  const categories = ['Todas', 'Ciudad', 'Comunidad', 'Infraestructura', 'Costanera'];

  const filteredItems =
    activeCategory === 'Todas'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <section id="comunidad" className="py-16 sm:py-24 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Galería Fotográfica de la Comunidad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Capturas Reales de Vida en el Servidor
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-100 dark:bg-neutral-800 cursor-pointer border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute top-3.5 left-3.5">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#67F23B] text-[#121212]">
                  {item.category}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-sm font-bold text-white group-hover:text-[#67F23B] transition-colors leading-snug truncate">
                  {item.title}
                </h3>
                <div className="text-[11px] text-neutral-300 flex items-center justify-between mt-1">
                  <span>{item.photographer}</span>
                  <span className="text-neutral-400">CLICMaster Latam</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Media Channels Grid (Prompt: Discord, TikTok, YouTube, Instagram, Facebook, Directos) */}
        <div className="mt-16 pt-12 border-t border-neutral-200/80 dark:border-neutral-800">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-2">
              Únete a Nuestra Gran Red Social
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Sigue todas las transmisiones en vivo, clips virales y anuncios en nuestras plataformas oficiales.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Discord */}
            <a
              href="https://discord.gg/clicmaster"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 hover:border-[#5865F2] transition-colors flex flex-col items-center text-center group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 text-[#5865F2] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Discord</span>
              <span className="text-[10px] text-neutral-500">48K Miembros</span>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@clicmasteroficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 hover:border-pink-500 transition-colors flex flex-col items-center text-center group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-500 font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                TT
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">TikTok</span>
              <span className="text-[10px] text-neutral-500">195K Seguidores</span>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@clicmasterrp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 hover:border-red-500 transition-colors flex flex-col items-center text-center group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                YT
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">YouTube</span>
              <span className="text-[10px] text-neutral-500">98K Suscriptores</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 hover:border-purple-500 transition-colors flex flex-col items-center text-center group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                IG
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Instagram</span>
              <span className="text-[10px] text-neutral-500">Fotos & Stories</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-600 transition-colors flex flex-col items-center text-center group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-600 font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                FB
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Facebook</span>
              <span className="text-[10px] text-neutral-500">Grupos de Rol</span>
            </a>

            {/* Directos Twitch / Live */}
            <a
              href="https://twitch.tv"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-neutral-200/80 dark:border-neutral-800 hover:border-[#67F23B] transition-colors flex flex-col items-center text-center group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#67F23B]/15 text-[#258712] dark:text-[#67F23B] font-bold text-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                LIVE
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Directos</span>
              <span className="text-[10px] text-neutral-500">Transmisiones</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-neutral-300"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={lightboxItem.image}
              alt={lightboxItem.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
            />

            <div className="mt-4 text-center text-white">
              <h4 className="text-lg font-bold">{lightboxItem.title}</h4>
              <p className="text-xs text-neutral-400 mt-1">{lightboxItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
