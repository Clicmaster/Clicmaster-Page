// ============================================================================
// PRECIOS OFICIALES EN CLICCOINS
// Esta es la ÚNICA fuente de precios que usa el servidor para cobrar.
// Si cambias un precio aquí, cambia tanto en la página como en el cobro real.
// ============================================================================
import { SHOP_ITEMS } from './serverData.js';
import { VIRTUAL_PRODUCTS } from './storeProducts.js';
import type { ShopItem } from '../types/index.js';

export interface CoinShopEntry {
  id: string;
  name: string;
  costCoins: number;
}

/** Precio en ClicCoins de un ítem de la Tienda VIP (misma regla que usaba la página). */
export function getVipItemCoinCost(item: ShopItem): number {
  return item.priceRobux || 500;
}

const entries: CoinShopEntry[] = [
  ...SHOP_ITEMS.map((item) => ({ id: item.id, name: item.title, costCoins: getVipItemCoinCost(item) })),
  ...VIRTUAL_PRODUCTS.map((p) => ({ id: p.id, name: p.name, costCoins: p.priceRobux })),
];

export const COIN_SHOP_CATALOG: Record<string, CoinShopEntry> = Object.fromEntries(
  entries.map((entry) => [entry.id, entry])
);
