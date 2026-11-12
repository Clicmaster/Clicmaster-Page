// api/_lib/precios.js
// =====================================================================
//  PRECIOS DE CLICCOINS  ·  ÚNICO lugar donde se definen los precios.
//  Lo usan el servidor (para cobrar) y la página (para mostrar).
//  Para cambiar un precio: edita el número aquí en GitHub y guarda.
//  (No pongas aquí nada secreto: este archivo también lo ve la página.)
// =====================================================================

// 1) Paquetes de recarga (dinero real -> ClicCoins)
//    El usuario recibe  coins + bonus.  precioUsd siempre con 2 decimales.
export const PAQUETES_RECARGA = [
  { id: 'pack-100',  name: 'Pack Básico',    coins: 100,  bonus: 0,    precioUsd: '1.99',  tag: 'Iniciación' },
  { id: 'pack-500',  name: 'Pack Ciudadano', coins: 500,  bonus: 50,   precioUsd: '7.99',  tag: 'Popular', popular: true },
  { id: 'pack-1000', name: 'Pack Élite',     coins: 1000, bonus: 150,  precioUsd: '14.99', tag: 'Recomendado' },
  { id: 'pack-2500', name: 'Pack Magnate',   coins: 2500, bonus: 500,  precioUsd: '29.99', tag: 'Gran Ahorro' },
  { id: 'pack-5000', name: 'Pack Imperio',   coins: 5000, bonus: 1250, precioUsd: '49.99', tag: 'VIP Máximo' },
];

// 2) Artículos que se compran con ClicCoins.
//    El "id" debe ser igual al id del artículo en la página.
//    tipo:
//      'membresia' -> dura "dias" días; si se compra otra vez, se suman los días
//      'unico'     -> se compra una sola vez (queda para siempre)
//      'repetible' -> se puede comprar varias veces
//    Todas las compras crean un PEDIDO para que el staff entregue el ítem en Roblox/Discord.
export const ARTICULOS = {
  // ---- Tienda VIP & Gamepasses (sección "Catálogo VIP") ----
  'vip-diamante':      { nombre: 'Pase VIP Diamante (30 Días)', precioCoins: 799,  tipo: 'membresia', membresia: 'vip-diamante', dias: 30 },
  'vip-oro':           { nombre: 'Pase VIP Oro (30 Días)',      precioCoins: 499,  tipo: 'membresia', membresia: 'vip-oro',      dias: 30 },
  'auto-sf90':         { nombre: 'Hypercar F-90 Stradale',      precioCoins: 950,  tipo: 'unico' },
  'auto-suv-defender': { nombre: 'Titan Defender 4x4',          precioCoins: 350,  tipo: 'unico' },
  'mansion-colina':    { nombre: 'Mansión "Skyline Crest"',     precioCoins: 1200, tipo: 'unico' },
  'pack-monedas-1m':   { nombre: 'Fondo Bancario 1,000,000 CLIC Coins (juego)', precioCoins: 400, tipo: 'repetible' },

  // ---- CLICMASTER STORE · Productos virtuales ----
  'v-vip-diamante':       { nombre: 'Pase VIP Diamante',                 precioCoins: 799,  tipo: 'membresia', membresia: 'vip-diamante', dias: 30 },
  'v-uniforme-policia':   { nombre: 'Uniforme Táctico Policía (RPD)',    precioCoins: 250,  tipo: 'unico' },
  'v-uniforme-medico':    { nombre: 'Uniforme Médico de Cirugía (SAMUR)', precioCoins: 190, tipo: 'unico' },
  'v-uniforme-bombero':   { nombre: 'Uniforme Ignífugo Bomberos #12',    precioCoins: 210,  tipo: 'unico' },
  'v-mochila-clicmaster': { nombre: 'Mochila Táctica CLICMASTER',        precioCoins: 320,  tipo: 'unico' },
  'v-alas-legendarias':   { nombre: 'Alas Cyber Legendarias',            precioCoins: 950,  tipo: 'unico' },
  'v-placa-dorada':       { nombre: 'Placa Dorada de Ciudadano Ilustre', precioCoins: 450,  tipo: 'unico' },
  'v-auto-exclusivo':     { nombre: 'Superdeportivo SF90 Aurum Custom',  precioCoins: 1200, tipo: 'unico' },
  'v-helicoptero':        { nombre: 'Helicóptero de Patrulla Aérea',     precioCoins: 1450, tipo: 'unico' },
  'v-casa-premium':       { nombre: 'Mansión Crest Heights',             precioCoins: 1800, tipo: 'unico' },
};

// Precio en ClicCoins de un artículo (o null si no se vende con ClicCoins)
export function precioCoins(id) {
  const a = ARTICULOS[id];
  return a ? a.precioCoins : null;
}
