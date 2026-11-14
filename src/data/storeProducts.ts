// ============================================================================
// CATÁLOGO DE CLICMASTER STORE (ítems virtuales, mercancía física y packs)
// Se comparte entre la página y el servidor: el servidor usa ESTOS precios
// para cobrar, así nadie puede cambiar el precio desde su navegador.
//
// TODO se paga con ClicCoins. Los precios de mercancía y packs se calcularon
// a 100 ClicCoins por cada 1 USD de su precio anterior: cámbialos aquí.
// ============================================================================

// Roblox in-game screenshot style virtual store items
export const ROBLOX_VIP_PASS = '/src/assets/images/roblox_vip_pass_1794365858806.jpg';
export const ROBLOX_POLICE_TACTICAL = '/src/assets/images/roblox_police_tactical_1794365859519.jpg';
export const ROBLOX_DOCTOR_SCRUBS = '/src/assets/images/roblox_doctor_scrubs_1794365860261.jpg';
export const ROBLOX_FIREFIGHTER_GEAR = '/src/assets/images/roblox_firefighter_gear_1794365861409.jpg';
export const ROBLOX_TACTICAL_BACKPACK = '/src/assets/images/roblox_tactical_backpack_1794365861993.jpg';
export const ROBLOX_CYBER_WINGS = '/src/assets/images/roblox_cyber_wings_1794365862985.jpg';
export const ROBLOX_GOLD_BADGE = '/src/assets/images/roblox_gold_badge_1794365864178.jpg';
export const ROBLOX_SF90_SUPERCAR = '/src/assets/images/roblox_sf90_supercar_1794365864979.jpg';
export const ROBLOX_PATROL_HELICOPTER = '/src/assets/images/roblox_patrol_helicopter_1794365867069.jpg';
export const ROBLOX_LUXURY_MANSION = '/src/assets/images/roblox_luxury_mansion_1794365865198.jpg';

export interface VirtualProduct {
  id: string;
  name: string;
  rareza: 'Común' | 'Raro' | 'Épico' | 'Legendario' | 'Exclusivo';
  /** Precio en ClicCoins */
  priceCoins: number;
  image: string;
  desc: string;
  glowColor: string;
}

export const VIRTUAL_PRODUCTS: VirtualProduct[] = [
  {
    id: 'v-vip-diamante',
    name: 'Pase VIP Diamante',
    rareza: 'Legendario',
    priceCoins: 799,
    image: ROBLOX_VIP_PASS,
    desc: 'Multiplicador de salario x3.5, helipuerto y cola prioritaria.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-uniforme-policia',
    name: 'Uniforme Táctico Policía (RPD)',
    rareza: 'Épico',
    priceCoins: 250,
    image: ROBLOX_POLICE_TACTICAL,
    desc: 'Chaleco blindado de asalto, radio digital y placa reglamentaria.',
    glowColor: '#2B6BFF',
  },
  {
    id: 'v-uniforme-medico',
    name: 'Uniforme Médico de Cirugía (SAMUR)',
    rareza: 'Raro',
    priceCoins: 190,
    image: ROBLOX_DOCTOR_SCRUBS,
    desc: 'Ambo médico oficial con estetoscopio y carnet hospitalario.',
    glowColor: '#42D425',
  },
  {
    id: 'v-uniforme-bombero',
    name: 'Uniforme Ignífugo Bomberos #12',
    rareza: 'Raro',
    priceCoins: 210,
    image: ROBLOX_FIREFIGHTER_GEAR,
    desc: 'Traje de combate contra fuego estructural y casco con linterna.',
    glowColor: '#EF4444',
  },
  {
    id: 'v-mochila-clicmaster',
    name: 'Mochila Táctica CLICMASTER',
    rareza: 'Épico',
    priceCoins: 320,
    image: ROBLOX_TACTICAL_BACKPACK,
    desc: 'Slots de inventario ampliados con logotipo neón reflectante.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-alas-legendarias',
    name: 'Alas Cyber Legendarias',
    rareza: 'Legendario',
    priceCoins: 950,
    image: ROBLOX_CYBER_WINGS,
    desc: 'Efecto de vuelo cosmético con partículas de luz esmeralda.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-placa-dorada',
    name: 'Placa Dorada de Ciudadano Ilustre',
    rareza: 'Exclusivo',
    priceCoins: 450,
    image: ROBLOX_GOLD_BADGE,
    desc: 'Insignia dorada sobre tu avatar con reconocimiento municipal.',
    glowColor: '#F59E0B',
  },
  {
    id: 'v-auto-exclusivo',
    name: 'Superdeportivo SF90 Aurum Custom',
    rareza: 'Exclusivo',
    priceCoins: 1200,
    image: ROBLOX_SF90_SUPERCAR,
    desc: '345 km/h, tracción total híbrida y escape con llama neón.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-helicoptero',
    name: 'Helicóptero de Patrulla Aérea',
    rareza: 'Legendario',
    priceCoins: 1450,
    image: ROBLOX_PATROL_HELICOPTER,
    desc: 'Aeronave bimotor con foco rastreador y helipuerto desbloqueado.',
    glowColor: '#2B6BFF',
  },
  {
    id: 'v-casa-premium',
    name: 'Mansión Crest Heights',
    rareza: 'Exclusivo',
    priceCoins: 1800,
    image: ROBLOX_LUXURY_MANSION,
    desc: 'Residencia en colina con piscina infinity y garaje para 6 supercars.',
    glowColor: '#7CFF3A',
  },
];

// High quality WebP optimized images for Merch
export const MERCH_HOODIE = '/src/assets/images/clicmaster_merch_hoodie_1794100557771.webp';
export const MERCH_CAP = '/src/assets/images/clicmaster_merch_cap_1794100558380.webp';
export const MERCH_MOUSEPAD = '/src/assets/images/clicmaster_merch_mousepad_1794100559849.webp';
export const MERCH_LIFESTYLE = '/src/assets/images/clicmaster_merch_lifestyle_1794100560331.webp';

export interface PhysicalProduct {
  id: string;
  name: string;
  icon: string;
  /** Precio en ClicCoins (100 ClicCoins = 1 USD de referencia) */
  priceCoins: number;
  badge: 'Nuevo' | 'Más vendido' | 'Edición limitada';
  image: string;
  sizes: string[];
  colors: string[];
  stock: number;
  desc: string;
}

export interface ExclusivePack {
  id: string;
  name: string;
  tagline: string;
  /** Precio en ClicCoins (100 ClicCoins = 1 USD de referencia) */
  priceCoins: number;
  badge: string;
  items: string[];
  popular?: boolean;
}

export const PHYSICAL_PRODUCTS: PhysicalProduct[] = [
  {
    id: 'p-hoodie',
    name: 'Hoodie Oficial CLICMASTER',
    icon: '🧥',
    priceCoins: 4499,
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
    priceCoins: 2499,
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
    priceCoins: 2199,
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
    priceCoins: 2999,
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
    priceCoins: 4999,
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
    priceCoins: 8999,
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
    priceCoins: 3999,
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
    priceCoins: 1699,
    badge: 'Nuevo',
    image: MERCH_CAP,
    sizes: ['15 oz (450 ml)'],
    colors: ['Negro con cambio térmico a Verde'],
    stock: 50,
    desc: 'Al verter líquidos calientes revela la skyline iluminada de Brookhaven.',
  },
];

export const EXCLUSIVE_PACKS: ExclusivePack[] = [
  {
    id: 'pack-starter',
    name: 'Starter Pack',
    tagline: 'El kit perfecto para entrar al servidor con estilo propio.',
    priceCoins: 3999,
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
    priceCoins: 7999,
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
    priceCoins: 14999,
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
