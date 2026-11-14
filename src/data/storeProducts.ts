// Catálogo de ítems virtuales de CLICMASTER STORE.
// Se comparte entre la página y el servidor: el servidor usa ESTOS precios
// para cobrar, así nadie puede cambiar el precio desde su navegador.

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
  priceRobux: number;
  image: string;
  desc: string;
  glowColor: string;
}

export const VIRTUAL_PRODUCTS: VirtualProduct[] = [
  {
    id: 'v-vip-diamante',
    name: 'Pase VIP Diamante',
    rareza: 'Legendario',
    priceRobux: 799,
    image: ROBLOX_VIP_PASS,
    desc: 'Multiplicador de salario x3.5, helipuerto y cola prioritaria.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-uniforme-policia',
    name: 'Uniforme Táctico Policía (RPD)',
    rareza: 'Épico',
    priceRobux: 250,
    image: ROBLOX_POLICE_TACTICAL,
    desc: 'Chaleco blindado de asalto, radio digital y placa reglamentaria.',
    glowColor: '#2B6BFF',
  },
  {
    id: 'v-uniforme-medico',
    name: 'Uniforme Médico de Cirugía (SAMUR)',
    rareza: 'Raro',
    priceRobux: 190,
    image: ROBLOX_DOCTOR_SCRUBS,
    desc: 'Ambo médico oficial con estetoscopio y carnet hospitalario.',
    glowColor: '#42D425',
  },
  {
    id: 'v-uniforme-bombero',
    name: 'Uniforme Ignífugo Bomberos #12',
    rareza: 'Raro',
    priceRobux: 210,
    image: ROBLOX_FIREFIGHTER_GEAR,
    desc: 'Traje de combate contra fuego estructural y casco con linterna.',
    glowColor: '#EF4444',
  },
  {
    id: 'v-mochila-clicmaster',
    name: 'Mochila Táctica CLICMASTER',
    rareza: 'Épico',
    priceRobux: 320,
    image: ROBLOX_TACTICAL_BACKPACK,
    desc: 'Slots de inventario ampliados con logotipo neón reflectante.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-alas-legendarias',
    name: 'Alas Cyber Legendarias',
    rareza: 'Legendario',
    priceRobux: 950,
    image: ROBLOX_CYBER_WINGS,
    desc: 'Efecto de vuelo cosmético con partículas de luz esmeralda.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-placa-dorada',
    name: 'Placa Dorada de Ciudadano Ilustre',
    rareza: 'Exclusivo',
    priceRobux: 450,
    image: ROBLOX_GOLD_BADGE,
    desc: 'Insignia dorada sobre tu avatar con reconocimiento municipal.',
    glowColor: '#F59E0B',
  },
  {
    id: 'v-auto-exclusivo',
    name: 'Superdeportivo SF90 Aurum Custom',
    rareza: 'Exclusivo',
    priceRobux: 1200,
    image: ROBLOX_SF90_SUPERCAR,
    desc: '345 km/h, tracción total híbrida y escape con llama neón.',
    glowColor: '#7CFF3A',
  },
  {
    id: 'v-helicoptero',
    name: 'Helicóptero de Patrulla Aérea',
    rareza: 'Legendario',
    priceRobux: 1450,
    image: ROBLOX_PATROL_HELICOPTER,
    desc: 'Aeronave bimotor con foco rastreador y helipuerto desbloqueado.',
    glowColor: '#2B6BFF',
  },
  {
    id: 'v-casa-premium',
    name: 'Mansión Crest Heights',
    rareza: 'Exclusivo',
    priceRobux: 1800,
    image: ROBLOX_LUXURY_MANSION,
    desc: 'Residencia en colina con piscina infinity y garaje para 6 supercars.',
    glowColor: '#7CFF3A',
  },
];
