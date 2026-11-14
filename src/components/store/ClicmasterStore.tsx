import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Zap,
  Shirt,
  Shield,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Award,
  Users,
  Radio,
  Truck,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { StoreCheckoutModal, CheckoutModalItem } from './StoreCheckoutModal.tsx';
import { VIRTUAL_PRODUCTS, VirtualProduct } from '../../data/storeProducts.ts';

// High quality WebP optimized images for Merch
const MERCH_HOODIE = '/src/assets/images/clicmaster_merch_hoodie_1794100557771.webp';
const MERCH_CAP = '/src/assets/images/clicmaster_merch_cap_1794100558380.webp';
const MERCH_MOUSEPAD = '/src/assets/images/clicmaster_merch_mousepad_1794100559849.webp';
const MERCH_LIFESTYLE = '/src/assets/images/clicmaster_merch_lifestyle_1794100560331.webp';

interface PhysicalProduct {
  id: string;
  name: string;
  icon: string;
  price: string;
  badge: 'Nuevo' | 'Más vendido' | 'Edición limitada';
  image: string;
  sizes: string[];
  colors: string[];
  stock: number;
  desc: string;
}

interface ExclusivePack {
  id: string;
  name: string;
  tagline: string;
  price: string;
  badge: string;
  items: string[];
  popular?: boolean;
}


const PHYSICAL_PRODUCTS: PhysicalProduct[] = [
  {
    id: 'p-hoodie',
    name: 'Hoodie Oficial CLICMASTER',
    icon: '🧥',
    price: '$44.99 USD',
    badge: 'Más vendido',
    image: MERCH_HOODIE,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Negro Cyber', 'Gris Grafito'],
    stock: 28,
    desc: 'Algodón pesado 380 GSM con bordado neón #7CFF3A de alta densidad.',
  },
  {
    id: 'p-gorra',
    name: 'Gorra Trucker Oficial CLICMASTER',
    icon: '🧢',
    price: '$24.99 USD',
    badge: 'Nuevo',
    image: MERCH_CAP,
    sizes: ['Ajustable (Snapback)'],
    colors: ['Negro Intenso'],
    stock: 45,
    desc: 'Visera curva con relieve 3D electro-verde e interior transpirable.',
  },
  {
    id: 'p-franela',
    name: 'Franela Urbana CLICMASTER Latam',
    icon: '👕',
    price: '$21.99 USD',
    badge: 'Nuevo',
    image: MERCH_HOODIE,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Negro Jet', 'Blanco Ártico'],
    stock: 60,
    desc: 'Corte oversize premium 100% algodón peinado con serigrafía táctil.',
  },
  {
    id: 'p-mousepad',
    name: 'Mousepad Gamer XL Cyber Metropolis',
    icon: '💻',
    price: '$29.99 USD',
    badge: 'Edición limitada',
    image: MERCH_MOUSEPAD,
    sizes: ['900 x 400 x 4 mm'],
    colors: ['RGB Neón Edge'],
    stock: 18,
    desc: 'Borde con costura reforzada, base antideslizante y textura Speed/Control.',
  },
  {
    id: 'p-mouse',
    name: 'Mouse Gamer Ultraligero Pro 8K',
    icon: '🖱',
    price: '$49.99 USD',
    badge: 'Edición limitada',
    image: MERCH_MOUSEPAD,
    sizes: ['Ergonómico (62g)'],
    colors: ['Matte Black + Green Glow'],
    stock: 14,
    desc: 'Sensor óptico 26,000 DPI con switches ópticos de 100 millones de clics.',
  },
  {
    id: 'p-teclado',
    name: 'Teclado Mecánico RGB 75% CLIC Custom',
    icon: '⌨',
    price: '$89.99 USD',
    badge: 'Edición limitada',
    image: MERCH_MOUSEPAD,
    sizes: ['Formato 75% Compacto'],
    colors: ['Linear Green Switches'],
    stock: 9,
    desc: 'Gasket mount, perilla de aluminio multimedia y switches lubricados de fábrica.',
  },
  {
    id: 'p-morral',
    name: 'Morral Ergonómico Antirrobo CLIC',
    icon: '🎒',
    price: '$39.99 USD',
    badge: 'Más vendido',
    image: MERCH_HOODIE,
    sizes: ['Capacidad 25L'],
    colors: ['Negro Táctico'],
    stock: 22,
    desc: 'Compartimento acolchado para laptop de 16", puerto USB y tejido impermeable.',
  },
  {
    id: 'p-taza',
    name: 'Taza Cerámica Termocrómica Cyber Mug',
    icon: '☕',
    price: '$16.99 USD',
    badge: 'Nuevo',
    image: MERCH_CAP,
    sizes: ['15 oz (450 ml)'],
    colors: ['Negro con cambio térmico a Verde'],
    stock: 50,
    desc: 'Al verter líquidos calientes revela la skyline iluminada de Brookhaven.',
  },
];

const EXCLUSIVE_PACKS: ExclusivePack[] = [
  {
    id: 'pack-starter',
    name: 'Starter Pack',
    tagline: 'El kit perfecto para entrar al servidor con estilo propio.',
    price: '$39.99 USD',
    badge: 'Ideal Nuevos',
    items: [
      'Franela Urbana Oficial',
      'Gorra Snapback CLICMASTER',
      'Código Virtual 50,000 CLIC Coins',
      'Pase VIP Bronce (7 días)',
    ],
  },
  {
    id: 'pack-community',
    name: 'Community Pack',
    tagline: 'Para los ciudadanos más leales que viven la comunidad cada día.',
    price: '$79.99 USD',
    badge: 'Más Popular',
    popular: true,
    items: [
      'Hoodie Oficial Bordado',
      'Mousepad Gamer XL Cyber',
      'Taza Cerámica Termocrómica',
      'Rol Exclusivo Discord "Community Supporter"',
      'Insignia Especial en el Perfil Web',
    ],
  },
  {
    id: 'pack-legend',
    name: 'Legend Pack',
    tagline: 'La cúspide para los líderes de facción y leyendas del rol.',
    price: '$149.99 USD',
    badge: 'Edición Suprema',
    items: [
      'Todo lo incluido en Starter & Community Pack',
      'Teclado Mecánico RGB 75% Custom',
      'Certificado Digital de Fundador',
      'Firma Autografiada Digital del Creador',
      'Pase VIP Diamante Permanente en Roblox',
      'Canal de voz privado con el staff en Discord',
    ],
  },
];

const COMMUNITY_METRICS = [
  { number: '15,000+', label: 'Miembros Discord', icon: Users, sub: 'Comunidad en línea activa' },
  { number: '45,000+', label: 'Seguidores', icon: Radio, sub: 'En TikTok, YouTube e Instagram' },
  { number: '30,000+', label: 'Participantes en Eventos', icon: Award, sub: 'Torneos y directos masivos' },
];

const STORE_BENEFITS = [
  {
    title: 'Rol Exclusivo Discord',
    desc: 'Rango destacado con color neón propio y acceso a salas VIP.',
    icon: Shield,
    color: '#7CFF3A',
  },
  {
    title: 'Insignia Especial',
    desc: 'Distintivo verificado en tu DNI virtual y perfil oficial.',
    icon: Award,
    color: '#F59E0B',
  },
  {
    title: 'Color Personalizado',
    desc: 'Nombre resaltado en el chat del juego y en los directos oficiales.',
    icon: Sparkles,
    color: '#7CFF3A',
  },
  {
    title: 'Acceso Anticipado',
    desc: 'Prueba vehículos, armas y mapas 48 horas antes de cada actualización.',
    icon: Zap,
    color: '#2B6BFF',
  },
  {
    title: 'Sorteos Privados',
    desc: 'Participación mensual garantizada en premios de Robux y periféricos.',
    icon: Gift,
    color: '#EC4899',
  },
];

export const ClicmasterStore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'virtual' | 'physical'>('virtual');
  const [checkoutItem, setCheckoutItem] = useState<CheckoutModalItem | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [galleryIndex, setGalleryIndex] = useState(0);

  const gallerySlides = [
    {
      title: 'Comunidad CLICMASTER en las Calles',
      subtitle: 'Streetwear gamer diseñado para la vida real y la metrópolis de Roblox.',
      image: MERCH_LIFESTYLE,
      tag: 'Lifestyle Oficial 2026',
    },
    {
      title: 'Setup de Competición & Roleplay Serio',
      subtitle: 'Iluminación reactiva, mousepads XL y periféricos con acabado esmeralda.',
      image: MERCH_MOUSEPAD,
      tag: 'Periféricos RGB',
    },
    {
      title: 'Calidad Textil de Grado Profesional',
      subtitle: 'Bordados de alta densidad en verde neón (#7CFF3A) y algodón peinado.',
      image: MERCH_HOODIE,
      tag: 'Confección Premium',
    },
  ];

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleSelectColor = (productId: string, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  const handleBuyVirtual = (product: VirtualProduct) => {
    setCheckoutItem({
      id: product.id,
      name: product.name,
      price: `${product.priceRobux} Robux`,
      category: 'Virtual',
      type: 'virtual',
      image: product.image,
      badge: product.rareza,
    });
  };

  const handleBuyPhysical = (product: PhysicalProduct) => {
    setCheckoutItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: 'Físico',
      type: 'physical',
      image: product.image,
      badge: product.badge,
      selectedSize: selectedSizes[product.id] || product.sizes[0],
      selectedColor: selectedColors[product.id] || product.colors[0],
    });
  };

  const handleBuyPack = (pack: ExclusivePack) => {
    setCheckoutItem({
      id: pack.id,
      name: pack.name,
      price: pack.price,
      category: 'Pack',
      type: 'pack',
      image: MERCH_HOODIE,
      badge: pack.badge,
    });
  };

  const scrollToTabs = () => {
    document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="store"
      className="relative py-20 sm:py-28 lg:py-36 bg-white dark:bg-[#0c0c0e] text-[#121212] dark:text-white overflow-hidden border-y border-neutral-200/80 dark:border-neutral-800 transition-colors duration-300"
    >
      {/* ========================================================= */}
      {/* HERO SECTION WITH GREEN PARTICLES & PARALLAX GLOW */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Neon Green Ambient Flares */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-[#7CFF3A]/15 via-[#42D425]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-1/3 -right-48 w-[600px] h-[600px] bg-[#7CFF3A]/8 blur-[160px] rounded-full" />
        
        {/* Subtle Cyber Floating Particles (SVG background) */}
        <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15%" cy="20%" r="3" fill="#7CFF3A" className="animate-pulse" />
          <circle cx="28%" cy="75%" r="2" fill="#7CFF3A" />
          <circle cx="45%" cy="30%" r="4" fill="#7CFF3A" opacity="0.6" className="animate-ping" />
          <circle cx="70%" cy="15%" r="2.5" fill="#7CFF3A" />
          <circle cx="85%" cy="60%" r="3.5" fill="#7CFF3A" className="animate-pulse" />
          <circle cx="92%" cy="35%" r="2" fill="#7CFF3A" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Lockup */}
        <div className="text-center max-w-4xl mx-auto mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#7CFF3A] animate-ping" />
            <span>CLICMASTER STORE · COLECCIÓN OFICIAL 2026</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            🛍 CLICMASTER STORE
          </h2>

          <p className="text-xl sm:text-2xl font-bold text-[#1a6b0c] dark:text-[#7CFF3A] mb-3">
            Lleva tu identidad dentro y fuera de Roblox.
          </p>

          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Compra artículos físicos y virtuales exclusivos de la comunidad. Calidad streetwear de grado Nike/Apple con beneficios automáticos dentro del servidor.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToTabs}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-[#121212] bg-[#7CFF3A] hover:bg-[#68e02b] active:scale-98 transition-all duration-200 shadow-xl hover:shadow-[0_4px_30px_rgba(124,255,58,0.45)] flex items-center justify-center gap-2.5"
            >
              <ShoppingBag className="w-5 h-5 fill-current" />
              <span>Comprar Ahora</span>
            </button>

            <button
              onClick={scrollToTabs}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 transition-colors border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center gap-2"
            >
              <span>Ver Colección</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABS SELECTOR: PRODUCTOS VIRTUALES VS MERCH OFICIAL */}
        {/* ========================================================= */}
        <div id="store-catalog" className="mb-14 sm:mb-20">
          <div className="flex items-center justify-center">
            <div className="p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-inner inline-flex gap-2">
              <button
                onClick={() => setActiveTab('virtual')}
                className={`px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'virtual'
                    ? 'bg-neutral-900 text-white dark:bg-[#7CFF3A] dark:text-[#121212] shadow-md scale-102'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Productos Virtuales</span>
              </button>

              <button
                onClick={() => setActiveTab('physical')}
                className={`px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'physical'
                    ? 'bg-neutral-900 text-white dark:bg-[#7CFF3A] dark:text-[#121212] shadow-md scale-102'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Shirt className="w-4 h-4" />
                <span>Merch Oficial (Físico)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB CONTENT 1: PRODUCTOS VIRTUALES (10 ITEMS CON GLOW NEÓN) */}
        {/* ========================================================= */}
        {activeTab === 'virtual' && (
          <div className="animate-in fade-in duration-300 mb-24 sm:mb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {VIRTUAL_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="group rounded-3xl p-5 bg-white dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:border-[#7CFF3A] hover:shadow-[0_0_28px_rgba(124,255,58,0.32)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Big Image Container with Glow Hover */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-neutral-900">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                      {/* Rarity Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#7CFF3A] text-[#121212] shadow-xs">
                          {prod.rareza}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-neutral-900 dark:text-white mb-1.5 leading-snug line-clamp-1 group-hover:text-[#1a6b0c] dark:group-hover:text-[#7CFF3A] transition-colors">
                      {prod.name}
                    </h4>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
                      {prod.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        Precio Robux
                      </span>
                      <span className="text-base font-black text-neutral-900 dark:text-white tabular-nums">
                        {prod.priceRobux} R$
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuyVirtual(prod)}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] transition-colors shadow-xs active:scale-95"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB CONTENT 2: MERCH OFICIAL (FÍSICO: TALLAS, COLORES, STOCK) */}
        {/* ========================================================= */}
        {activeTab === 'physical' && (
          <div className="animate-in fade-in duration-300 mb-24 sm:mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {PHYSICAL_PRODUCTS.map((prod) => {
                const currentSize = selectedSizes[prod.id] || prod.sizes[0];
                const currentColor = selectedColors[prod.id] || prod.colors[0];

                return (
                  <div
                    key={prod.id}
                    className="group rounded-3xl p-6 bg-white dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:border-[#7CFF3A] hover:shadow-[0_0_30px_rgba(124,255,58,0.25)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-5 bg-neutral-900">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Badges: Nuevo / Más vendido / Edición limitada */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs ${
                              prod.badge === 'Más vendido'
                                ? 'bg-amber-400 text-[#121212]'
                                : prod.badge === 'Edición limitada'
                                ? 'bg-purple-600 text-white'
                                : 'bg-[#7CFF3A] text-[#121212]'
                            }`}
                          >
                            {prod.badge}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3 text-xs bg-black/60 backdrop-blur-md text-white font-bold px-2 py-1 rounded-md">
                          Stock: {prod.stock} uds
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{prod.icon}</span>
                        <span className="text-lg font-black text-[#1a6b0c] dark:text-[#7CFF3A] tabular-nums">
                          {prod.price}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2 leading-tight">
                        {prod.name}
                      </h4>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
                        {prod.desc}
                      </p>

                      {/* Sizes Selector */}
                      {prod.sizes.length > 1 && (
                        <div className="mb-3">
                          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
                            Talla:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {prod.sizes.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSelectSize(prod.id, s)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                  currentSize === s
                                    ? 'bg-[#7CFF3A] text-[#121212] border-[#7CFF3A]'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors Selector */}
                      {prod.colors.length > 1 && (
                        <div className="mb-4">
                          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
                            Color:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {prod.colors.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleSelectColor(prod.id, c)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                  currentColor === c
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleBuyPhysical(prod)}
                      className="w-full mt-2 py-3 px-4 rounded-xl font-black text-xs bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Comprar {prod.price}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PACKS EXCLUSIVOS (STARTER, COMMUNITY, LEGEND) */}
        {/* ========================================================= */}
        <div className="mb-24 sm:mb-32">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#1a6b0c] dark:text-[#7CFF3A]">
              Combos Todo en Uno
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mt-1">
              Packs Exclusivos
            </h3>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-2">
              Ahorra hasta un 40% comprando en lote prendas físicas y beneficios virtuales combinados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {EXCLUSIVE_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative group ${
                  pack.popular
                    ? 'bg-neutral-900 text-white dark:bg-[#161618] border-[#7CFF3A] ring-2 ring-[#7CFF3A]/30 shadow-2xl scale-102'
                    : 'bg-white dark:bg-[#141416] text-[#121212] dark:text-white border-neutral-200/90 dark:border-neutral-800 shadow-md hover:border-[#7CFF3A] hover:shadow-[0_0_30px_rgba(124,255,58,0.2)]'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-[#7CFF3A] text-[#121212] shadow-md flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>MÁS POPULAR</span>
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                      {pack.badge}
                    </span>
                    <span className="text-2xl font-black text-[#7CFF3A] tabular-nums">
                      {pack.price}
                    </span>
                  </div>

                  <h4 className="text-2xl font-black mb-2">{pack.name}</h4>
                  <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                    {pack.tagline}
                  </p>

                  <div className="space-y-3 mb-8">
                    {pack.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <Check className="w-4 h-4 text-[#7CFF3A] shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleBuyPack(pack)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                    pack.popular
                      ? 'bg-[#7CFF3A] hover:bg-[#68e02b] text-[#121212] shadow-[0_0_20px_rgba(124,255,58,0.35)]'
                      : 'bg-neutral-900 text-white dark:bg-[#7CFF3A] dark:text-[#121212] hover:opacity-90'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Obtener {pack.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* GALERÍA DE MOCKUPS & LIFESTYLE CAROUSEL */}
        {/* ========================================================= */}
        <div className="mb-24 sm:mb-32">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#1a6b0c] dark:text-[#7CFF3A]">
              Galería Inmersiva
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mt-1">
              Personas Reales Usando el Merch
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Mockups realistas y comunidad en las calles de la ciudad.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-950">
            <div className="relative aspect-[16/9] w-full max-h-[550px]">
              <img
                src={gallerySlides[galleryIndex].image}
                alt={gallerySlides[galleryIndex].title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Tag */}
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#7CFF3A] text-[#121212] shadow-md">
                  {gallerySlides[galleryIndex].tag}
                </span>
              </div>

              {/* Details */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white max-w-2xl">
                <h4 className="text-xl sm:text-3xl font-black leading-tight drop-shadow mb-2">
                  {gallerySlides[galleryIndex].title}
                </h4>
                <p className="text-xs sm:text-base text-neutral-300 leading-relaxed">
                  {gallerySlides[galleryIndex].subtitle}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <button
                  onClick={() =>
                    setGalleryIndex((prev) => (prev === 0 ? gallerySlides.length - 1 : prev - 1))
                  }
                  className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors border border-white/20"
                  aria-label="Anterior foto"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setGalleryIndex((prev) => (prev + 1) % gallerySlides.length)
                  }
                  className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors border border-white/20"
                  aria-label="Siguiente foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMUNIDAD: ESTADÍSTICAS ANIMADAS */}
        {/* ========================================================= */}
        <div className="mb-24 sm:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#1a6b0c] dark:text-[#7CFF3A]">
              Movimiento Latam
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mt-1">
              Miles de jugadores ya representan CLICMASTER
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Una comunidad unida por el roleplay serio, la creatividad y la pasión por Roblox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {COMMUNITY_METRICS.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="p-8 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-sm text-center group hover:border-[#7CFF3A] transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#7CFF3A]/15 text-[#1a6b0c] dark:text-[#7CFF3A] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tight mb-2">
                    {metric.number}
                  </div>
                  <div className="text-base font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {metric.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BENEFICIOS AUTOMÁTICOS AL COMPRAR MERCH */}
        {/* ========================================================= */}
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-neutral-900 text-white relative overflow-hidden border border-neutral-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7CFF3A]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#7CFF3A]">
              Ventajas Exclusivas
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2 leading-tight">
              Comprar Merch Desbloquea Beneficios
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
              Cada pedido físico o pack incluye sincronización instantánea con tu usuario de Discord y Roblox para disfrutar de privilegios automáticos.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STORE_BENEFITS.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center flex flex-col items-center hover:bg-white/10 hover:border-[#7CFF3A] transition-all duration-300 group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg"
                    style={{ backgroundColor: `${b.color}25`, color: b.color }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black mb-2 text-white">{b.title}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Bottom Callout in Benefits */}
          <div className="relative z-10 mt-14 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-400">
              * Los roles y beneficios son activados inmediatamente tras ingresar tu usuario de Discord y Roblox en el formulario de compra.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <StoreCheckoutModal
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
      />
    </section>
  );
};
