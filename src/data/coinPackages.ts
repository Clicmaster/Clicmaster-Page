// ============================================================================
// PAQUETES DE CLICCOINS — ÚNICA LISTA OFICIAL
// La usan la página (para mostrarlos) y el servidor (para cobrar).
// Si cambias un precio o un bono aquí, cambia en ambos lugares a la vez.
// ============================================================================

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  priceUsd: number;
  priceRobux: number;
  name: string;
  tag?: string;
  popular?: boolean;
}

export const PACKAGES: CoinPackage[] = [
  { id: 'pack-100', coins: 100, bonus: 0, priceUsd: 1.99, priceRobux: 80, name: 'Pack Básico', tag: 'Iniciación' },
  {
    id: 'pack-500',
    coins: 500,
    bonus: 50,
    priceUsd: 7.99,
    priceRobux: 350,
    name: 'Pack Ciudadano',
    tag: 'Popular',
    popular: true,
  },
  { id: 'pack-1000', coins: 1000, bonus: 150, priceUsd: 14.99, priceRobux: 650, name: 'Pack Élite', tag: 'Recomendado' },
  { id: 'pack-2500', coins: 2500, bonus: 500, priceUsd: 29.99, priceRobux: 1400, name: 'Pack Magnate', tag: 'Gran Ahorro' },
  { id: 'pack-5000', coins: 5000, bonus: 1250, priceUsd: 49.99, priceRobux: 2500, name: 'Pack Imperio', tag: 'VIP Máximo' },
];
