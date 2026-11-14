// ============================================================================
// PRECIOS OFICIALES EN CLICCOINS (todo lo que se puede comprar en la página)
// Esta es la ÚNICA fuente de precios que usa el servidor para cobrar.
// Para cambiar un precio, edita el producto en serverData.ts (Tienda VIP)
// o en storeProducts.ts (CLICMASTER STORE): aquí se reúnen automáticamente.
// ============================================================================
import { SHOP_ITEMS } from './serverData.js';
import { VIRTUAL_PRODUCTS, PHYSICAL_PRODUCTS, EXCLUSIVE_PACKS } from './storeProducts.js';
import type { ShopItem } from '../types/index.js';

/** Tipo de producto: decide cómo se entrega el pedido. */
export type CatalogItemType = 'membresia' | 'virtual' | 'fisico' | 'pack';

export interface CoinShopEntry {
  id: string;
  name: string;
  costCoins: number;
  type: CatalogItemType;
  /** Si es true, el comprador debe dar sus datos de envío (mercancía física y packs). */
  requiresShipping: boolean;
  /** Tallas y colores permitidos (solo mercancía física). */
  sizes?: string[];
  colors?: string[];
}

/** Precio en ClicCoins de un ítem de la Tienda VIP. */
export function getVipItemCoinCost(item: ShopItem): number {
  return item.priceCoins;
}

const entries: CoinShopEntry[] = [
  ...SHOP_ITEMS.map((item) => ({
    id: item.id,
    name: item.title,
    costCoins: getVipItemCoinCost(item),
    type: (item.category === 'VIP' ? 'membresia' : 'virtual') as CatalogItemType,
    requiresShipping: false,
  })),
  ...VIRTUAL_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    costCoins: p.priceCoins,
    type: (p.id.includes('vip') ? 'membresia' : 'virtual') as CatalogItemType,
    requiresShipping: false,
  })),
  ...PHYSICAL_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    costCoins: p.priceCoins,
    type: 'fisico' as CatalogItemType,
    requiresShipping: true,
    sizes: p.sizes,
    colors: p.colors,
  })),
  ...EXCLUSIVE_PACKS.map((p) => ({
    id: p.id,
    name: p.name,
    costCoins: p.priceCoins,
    type: 'pack' as CatalogItemType,
    requiresShipping: true,
  })),
];

export const COIN_SHOP_CATALOG: Record<string, CoinShopEntry> = Object.fromEntries(
  entries.map((entry) => [entry.id, entry])
);

/** Busca un producto del catálogo de forma segura (evita nombres especiales como "__proto__"). */
export function findCatalogItem(itemId: string): CoinShopEntry | undefined {
  return Object.prototype.hasOwnProperty.call(COIN_SHOP_CATALOG, itemId) ? COIN_SHOP_CATALOG[itemId] : undefined;
}
