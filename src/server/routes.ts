// ============================================================================
// RUTAS DE LA API DE CLICCOINS
// ============================================================================
import { Router, Request, Response, NextFunction } from 'express';
import { getStore, getPackage, normalizeReference, PACKAGES } from './db.js';
import type { PaymentSettings, ShippingInfo } from './types.js';
import {
  AuthedRequest,
  createSessionToken,
  hashPassword,
  rateLimit,
  readInviteToken,
  requireAdmin,
  requireAuth,
  safeEqual,
  verifyPassword,
} from './auth.js';
import { findCatalogItem } from '../data/coinShopCatalog.js';
import { isPayPalReady, isYappyReady } from '../data/paymentSettings.js';

export const apiRouter = Router();

/** Permite usar funciones async en Express: cualquier error va al manejador central. */
type AsyncHandler = (req: AuthedRequest, res: Response, next: NextFunction) => Promise<void>;
const wrap =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req as AuthedRequest, res, next).catch(next);
  };

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// ------------------------------------------------------------ Validaciones
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const ROBLOX_USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@/]{1,64}@[^\s@/]{1,190}\.[^\s@/.]{2,24}$/;
const REFERENCE_RE = /^[A-Za-z0-9\-_.#/ ]{4,64}$/;
const PHONE_RE = /^[+0-9 ()-]{7,25}$/;
const PAYPAL_LINK_RE = /^https:\/\/(www\.)?(paypal\.me|paypal\.com)\/[A-Za-z0-9_\-./?=&%]{1,120}$/;

const DUMMY_PASSWORD = hashPassword('clicmaster-dummy-password');

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'desconocida';
}

function asText(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function bad(res: Response, message: string, status = 400): void {
  res.status(status).json({ success: false, message });
}

function tooManyAttempts(res: Response): void {
  bad(res, 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.', 429);
}

/** Valida los datos de una cuenta nueva. Devuelve un mensaje de error o null. */
function validateNewAccount(username: string, email: string, robloxUsername: string, password: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return 'El usuario debe tener de 3 a 20 caracteres: letras, números o guion bajo (_).';
  }
  if (!EMAIL_RE.test(email) || email.length > 120) return 'Escribe un correo electrónico válido.';
  if (!ROBLOX_USERNAME_RE.test(robloxUsername)) return 'Escribe un usuario de Roblox válido (3 a 20 caracteres).';
  if (password.length < 8 || password.length > 128) return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

// ============================================================================
// CUENTAS
// ============================================================================

// Crear cuenta: { username, email, robloxUsername, password, adminCode? }
apiRouter.post(
  '/auth/register',
  wrap(async (req, res) => {
    if (!rateLimit(`register:${clientIp(req)}`, 5, ONE_HOUR)) return tooManyAttempts(res);

    const username = asText(req.body?.username, 40);
    const email = asText(req.body?.email, 200).toLowerCase();
    const robloxUsername = asText(req.body?.robloxUsername, 40);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const adminCode = asText(req.body?.adminCode, 200);

    const invalid = validateNewAccount(username, email, robloxUsername, password);
    if (invalid) return bad(res, invalid);

    // Solo quien conozca el código secreto ADMIN_INVITE_CODE puede crear una cuenta de administrador.
    let role: 'user' | 'admin' = 'user';
    if (adminCode) {
      const realCode = process.env.ADMIN_INVITE_CODE || '';
      if (realCode.length < 12 || !safeEqual(adminCode, realCode)) {
        return bad(res, 'El código de administrador no es válido.', 403);
      }
      role = 'admin';
    }

    const { hash, salt } = hashPassword(password);
    const user = await getStore().createUser({
      username,
      email,
      robloxUsername,
      passwordHash: hash,
      passwordSalt: salt,
      role,
    });
    res.status(201).json({ success: true, token: createSessionToken(user.id), user });
  })
);

// Iniciar sesión: { username (usuario o correo), password }
apiRouter.post(
  '/auth/login',
  wrap(async (req, res) => {
    const identifier = asText(req.body?.username ?? req.body?.identifier, 200);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (
      !rateLimit(`login-ip:${clientIp(req)}`, 20, FIFTEEN_MIN) ||
      !rateLimit(`login-user:${identifier.toLowerCase()}`, 8, FIFTEEN_MIN)
    ) {
      return tooManyAttempts(res);
    }

    const store = getStore();
    const stored = !identifier
      ? undefined
      : identifier.includes('@')
        ? await store.findUserByEmail(identifier)
        : await store.findUserByUsername(identifier);

    let valid = false;
    if (stored?.password_hash && stored.password_salt) {
      valid = verifyPassword(password, stored.password_hash, stored.password_salt);
    } else {
      // Mismo trabajo aunque el usuario no exista, para no revelar qué cuentas existen.
      verifyPassword(password, DUMMY_PASSWORD.hash, DUMMY_PASSWORD.salt);
    }

    if (!stored || !valid) return bad(res, 'Usuario, correo o contraseña incorrectos.', 401);

    const user = (await store.getPublicUser(stored.id))!;
    res.json({ success: true, token: createSessionToken(user.id), user });
  })
);

// Ver a qué correo corresponde un enlace de activación de administrador
apiRouter.get(
  '/auth/invite',
  wrap(async (req, res) => {
    const invite = readInviteToken(asText(req.query?.token, 1000));
    if (!invite) return bad(res, 'El enlace de activación no es válido o ya caducó.');
    const exists = await getStore().findUserByEmail(invite.email);
    if (exists) return bad(res, 'Este enlace ya se usó: la cuenta de administrador ya existe. Inicia sesión.');
    res.json({ success: true, email: invite.email, role: invite.role });
  })
);

// Activar cuenta de administrador: { token, username, robloxUsername, password }
apiRouter.post(
  '/auth/activate-invite',
  wrap(async (req, res) => {
    if (!rateLimit(`invite:${clientIp(req)}`, 10, ONE_HOUR)) return tooManyAttempts(res);

    const invite = readInviteToken(asText(req.body?.token, 1000));
    if (!invite) return bad(res, 'El enlace de activación no es válido o ya caducó.');

    const username = asText(req.body?.username, 40);
    const robloxUsername = asText(req.body?.robloxUsername, 40);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const invalid = validateNewAccount(username, invite.email, robloxUsername, password);
    if (invalid) return bad(res, invalid);

    const { hash, salt } = hashPassword(password);
    const user = await getStore().createUser({
      username,
      email: invite.email,
      robloxUsername,
      passwordHash: hash,
      passwordSalt: salt,
      role: 'admin',
    });
    res.status(201).json({ success: true, token: createSessionToken(user.id), user });
  })
);

// Mi cuenta, saldo e historial
apiRouter.get(
  '/user/balance',
  requireAuth,
  wrap(async (req, res) => {
    const user = req.user!;
    res.json({
      success: true,
      user,
      balance: user.cliccoins_balance,
      transactions: await getStore().getUserTransactions(user.id),
    });
  })
);

// Mis pedidos de la tienda
apiRouter.get(
  '/user/orders',
  requireAuth,
  wrap(async (req, res) => {
    res.json({ success: true, orders: await getStore().getUserOrders(req.user!.id) });
  })
);

// ============================================================================
// RECARGAS DE CLICCOINS (Yappy y PayPal, con verificación manual)
// ============================================================================

apiRouter.get('/packages', (_req: Request, res: Response): void => {
  res.json({ success: true, packages: PACKAGES });
});

/** Datos públicos de pago: solo los métodos activos y lo que el cliente necesita ver. */
function publicPaymentInfo(s: PaymentSettings) {
  return {
    yappy: isYappyReady(s)
      ? { available: true, phone: s.yappy.phone, holder: s.yappy.holder, instructions: s.yappy.instructions }
      : { available: false },
    paypal: isPayPalReady(s)
      ? { available: true, email: s.paypal.email, link: s.paypal.link, instructions: s.paypal.instructions }
      : { available: false },
  };
}

apiRouter.get(
  '/payment-settings',
  wrap(async (_req, res) => {
    res.json({ success: true, methods: publicPaymentInfo(await getStore().getPaymentSettings()) });
  })
);

// Solicitar recarga: { packageId, paymentMethod: 'Yappy' | 'PayPal', paymentReference }
// Las monedas y el precio los calcula el servidor según el paquete.
apiRouter.post(
  '/coins/buy-request',
  requireAuth,
  wrap(async (req, res) => {
    const user = req.user!;
    if (!rateLimit(`buy:${user.id}`, 10, ONE_HOUR)) return tooManyAttempts(res);

    const packageId = asText(req.body?.packageId, 40);
    const paymentMethod = asText(req.body?.paymentMethod, 20);
    const paymentReference = asText(req.body?.paymentReference, 100);

    if (paymentMethod !== 'Yappy' && paymentMethod !== 'PayPal') {
      return bad(res, 'Método de pago no válido. Puedes recargar con Yappy o PayPal.');
    }

    const settings = await getStore().getPaymentSettings();
    const ready = paymentMethod === 'Yappy' ? isYappyReady(settings) : isPayPalReady(settings);
    if (!ready) return bad(res, `${paymentMethod} no está disponible en este momento.`);

    if (!getPackage(packageId)) return bad(res, 'El paquete seleccionado no existe.');

    if (!REFERENCE_RE.test(paymentReference) || normalizeReference(paymentReference).length < 4) {
      return bad(res, 'El número de comprobante debe tener de 4 a 64 caracteres (letras, números y guiones).');
    }

    const transaction = await getStore().createBuyRequest({
      userId: user.id,
      packageId,
      paymentMethod,
      paymentReference,
    });

    res.status(201).json({
      success: true,
      transaction,
      message: `Solicitud registrada. Tu transacción (${transaction.id}) está en revisión por el equipo administrativo.`,
    });
  })
);

// ============================================================================
// TIENDA: todo se compra SOLO con ClicCoins
// POST /api/shop/purchase  { itemId, opciones?: {talla, color}, envio?: {nombre, pais, direccion, telefono} }
// ============================================================================
apiRouter.post(
  '/shop/purchase',
  requireAuth,
  wrap(async (req, res) => {
    const user = req.user!;
    if (!rateLimit(`shop:${user.id}`, 30, ONE_HOUR)) return tooManyAttempts(res);

    const item = findCatalogItem(asText(req.body?.itemId, 80));
    if (!item) return bad(res, 'Ese artículo no existe o no se puede comprar con ClicCoins.');

    // Tallas y colores: solo los que existen para ese producto
    let opciones: { talla?: string; color?: string } | undefined;
    if (item.sizes || item.colors) {
      const talla = asText(req.body?.opciones?.talla, 60) || item.sizes?.[0];
      const color = asText(req.body?.opciones?.color, 60) || item.colors?.[0];
      if (item.sizes && talla && !item.sizes.includes(talla)) return bad(res, 'La talla elegida no está disponible.');
      if (item.colors && color && !item.colors.includes(color)) return bad(res, 'El color elegido no está disponible.');
      opciones = { talla, color };
    }

    // Datos de envío: obligatorios para mercancía física y packs
    let envio: ShippingInfo | undefined;
    if (item.requiresShipping) {
      envio = {
        nombre: asText(req.body?.envio?.nombre, 80),
        pais: asText(req.body?.envio?.pais, 60),
        direccion: asText(req.body?.envio?.direccion, 200),
        telefono: asText(req.body?.envio?.telefono, 25),
      };
      if (envio.nombre.length < 3) return bad(res, 'Escribe el nombre completo de quien recibe el pedido.');
      if (envio.pais.length < 2) return bad(res, 'Elige el país de envío.');
      if (envio.direccion.length < 8) return bad(res, 'Escribe la dirección completa de envío (calle, ciudad).');
      if (!PHONE_RE.test(envio.telefono)) return bad(res, 'Escribe un teléfono de contacto válido.');
    }

    const result = await getStore().processShopPurchase({ userId: user.id, item, opciones, envio });
    res.json({
      success: true,
      message: `¡Compra exitosa! Pediste ${item.name} por ${item.costCoins} ClicCoins. Tu pedido ${result.order.id} está pendiente de entrega.`,
      newBalance: result.newBalance,
      transaction: result.transaction,
      order: result.order,
    });
  })
);

// ============================================================================
// PANEL DE ADMINISTRACIÓN (solo administradores)
// ============================================================================

// Recargas: pendientes y recientes
apiRouter.get(
  '/admin/pending-payments',
  requireAdmin,
  wrap(async (_req, res) => {
    const store = getStore();
    const [pendingPayments, requests] = await Promise.all([store.getPendingTransactions(), store.getPurchaseRequests()]);
    res.json({
      success: true,
      pendingPayments,
      requests,
      totalPending: pendingPayments.length,
      stats: {
        totalPending: pendingPayments.length,
        totalCompleted: requests.filter((t) => t.estado === 'completado').length,
        totalRejected: requests.filter((t) => t.estado === 'rechazado').length,
        yappyPending: pendingPayments.filter((t) => t.metodo_pago === 'Yappy').length,
        paypalPending: pendingPayments.filter((t) => t.metodo_pago === 'PayPal').length,
      },
    });
  })
);

apiRouter.post(
  '/admin/approve-payment/:id',
  requireAdmin,
  wrap(async (req, res) => {
    const transaction = await getStore().approvePayment(req.params.id, req.user!.username);
    res.json({
      success: true,
      message: `Pago aprobado. Se acreditaron ${transaction.cantidad_coins} ClicCoins a ${transaction.username}.`,
      transaction,
    });
  })
);

apiRouter.post(
  '/admin/reject-payment/:id',
  requireAdmin,
  wrap(async (req, res) => {
    const reason = asText(req.body?.reason, 300) || 'Comprobante no válido o pago no recibido';
    const transaction = await getStore().rejectPayment(req.params.id, reason, req.user!.username);
    res.json({ success: true, message: `Pago rechazado. Motivo: ${reason}`, transaction });
  })
);

// Pedidos de la tienda
apiRouter.get(
  '/admin/orders',
  requireAdmin,
  wrap(async (_req, res) => {
    const orders = await getStore().getOrders();
    res.json({
      success: true,
      orders,
      stats: {
        pendientes: orders.filter((o) => o.estado === 'pendiente_entrega').length,
        entregados: orders.filter((o) => o.estado === 'entregado').length,
        cancelados: orders.filter((o) => o.estado === 'cancelado').length,
      },
    });
  })
);

apiRouter.post(
  '/admin/orders/:id/deliver',
  requireAdmin,
  wrap(async (req, res) => {
    const note = asText(req.body?.note, 300);
    const order = await getStore().markOrderDelivered(req.params.id, req.user!.username, note);
    res.json({ success: true, message: `Pedido ${order.id} marcado como entregado.`, order });
  })
);

apiRouter.post(
  '/admin/orders/:id/cancel',
  requireAdmin,
  wrap(async (req, res) => {
    const reason = asText(req.body?.reason, 300);
    if (reason.length < 3) return bad(res, 'Escribe el motivo de la cancelación (el cliente lo verá).');
    const { order, refund } = await getStore().cancelOrder(req.params.id, req.user!.username, reason);
    res.json({
      success: true,
      message: `Pedido cancelado. Se devolvieron ${refund.cantidad_coins} ClicCoins a ${order.username}.`,
      order,
      refund,
    });
  })
);

// Ajustes de pago (datos de Yappy y PayPal)
apiRouter.get(
  '/admin/payment-settings',
  requireAdmin,
  wrap(async (_req, res) => {
    res.json({ success: true, settings: await getStore().getPaymentSettings() });
  })
);

apiRouter.put(
  '/admin/payment-settings',
  requireAdmin,
  wrap(async (req, res) => {
    const y = req.body?.yappy || {};
    const p = req.body?.paypal || {};
    const settings: PaymentSettings = {
      yappy: {
        enabled: y.enabled === true,
        phone: asText(y.phone, 25),
        holder: asText(y.holder, 80),
        instructions: asText(y.instructions, 300),
      },
      paypal: {
        enabled: p.enabled === true,
        email: asText(p.email, 120).toLowerCase(),
        link: asText(p.link, 200),
        instructions: asText(p.instructions, 300),
      },
    };

    if (settings.yappy.phone && !PHONE_RE.test(settings.yappy.phone)) {
      return bad(res, 'El teléfono de Yappy no es válido (solo números, espacios, +, guiones).');
    }
    if (settings.yappy.enabled && (!settings.yappy.phone || settings.yappy.holder.length < 2)) {
      return bad(res, 'Para activar Yappy escribe el teléfono y el nombre del titular.');
    }
    if (settings.paypal.email && !EMAIL_RE.test(settings.paypal.email)) {
      return bad(res, 'El correo de PayPal no es válido.');
    }
    if (settings.paypal.link && !PAYPAL_LINK_RE.test(settings.paypal.link)) {
      return bad(res, 'El enlace de PayPal debe empezar por https://paypal.me/ o https://www.paypal.com/');
    }
    if (settings.paypal.enabled && !settings.paypal.email && !settings.paypal.link) {
      return bad(res, 'Para activar PayPal escribe el correo o el enlace PayPal.me.');
    }

    const saved = await getStore().savePaymentSettings(settings, req.user!.username);
    res.json({ success: true, message: 'Configuración de pagos guardada.', settings: saved });
  })
);

// Cualquier otra ruta /api que no exista
apiRouter.use((_req: Request, res: Response) => {
  bad(res, 'Ruta no encontrada.', 404);
});

