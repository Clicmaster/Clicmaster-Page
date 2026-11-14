export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Actualización' | 'Facciones' | 'Eventos' | 'Comunidad' | 'Economía';
  date: string;
  readTime: string;
  author: string;
  image: string;
  likes: number;
  featured?: boolean;
}

export interface MapPOI {
  id: string;
  name: string;
  category: 'Hospital' | 'Policía' | 'Bomberos' | 'Ayuntamiento' | 'Banco' | 'Escuelas' | 'Casas' | 'Tiendas' | 'Concesionarios' | 'Gasolineras' | 'Parques' | 'Aeropuerto';
  coordinates: { x: number; y: number }; // percentage 0-100
  address: string;
  state: 'Abierto 24/7' | 'En Operación' | 'Seguridad Alta' | 'Zona Residencial' | 'Acceso Público';
  staffOnline: number;
  radioFrequency?: string;
  description: string;
  services: string[];
  image: string;
}

export interface DepartmentFaction {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  description: string;
  membersCount: number;
  headOfDepartment: string;
  image: string;
  ranks: string[];
  requirements: string[];
  color: string;
  isOpenForApplications: boolean;
}

export interface ShopItem {
  id: string;
  title: string;
  category: 'VIP' | 'Vehículos' | 'Casas' | 'Skins' | 'Negocios' | 'Gamepass' | 'Monedas';
  description: string;
  /** Precio de referencia en dinero del juego (CLIC dentro de Roblox) */
  priceCLIC: number;
  /** Precio en ClicCoins en la página web */
  priceCoins: number;
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario' | 'Exclusivo';
  image: string;
  benefits: string[];
  popular?: boolean;
  stock?: number;
}

export interface LeaderboardPlayer {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  cleanMoney: number;
  playtimeHours: number;
  faction: string;
  reputation: 'Ejemplar' | 'Veterano' | 'Ciudadano Ilustre' | 'Magnate';
  verifiedRoblox: boolean;
}

export interface ServerEvent {
  id: string;
  title: string;
  category: 'Oficial' | 'Carreras' | 'Facciones' | 'Especial' | 'Comunidad' | 'Tradición & Fiestas Patrias' | string;
  date: string;
  time: string;
  targetTimestamp: number;
  description: string;
  location: string;
  rewards: string;
  registeredCount: number;
  image: string;
}

export interface RedeemCode {
  code: string;
  rewardDescription: string;
  type: 'coins' | 'vehicle' | 'vip' | 'items';
  value: string;
  expires: string;
  active: boolean;
}

export interface CitizenDniData {
  fullName: string;
  robloxUser: string;
  citizenNumber: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  occupation: string;
  address: string;
  issueDate: string;
  avatarStyle: string;
}
