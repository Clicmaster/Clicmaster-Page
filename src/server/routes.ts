import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import {
  AuthedRequest,
  createSessionToken,
  hashPassword,
  rateLimit,
  requireAdmin,
  requireAuth,
  safeEqual,
  verifyPassword,
} from './auth.ts';
import { COIN_SHOP_CATALOG } from '../data/coinShopCatalog.ts';

export const apiRouter = Router();

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Reglas de formato
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const ROBLOX_USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const REFERENCE_RE = /^[A-Za-z0-9\-_.#/ ]{4,64}$/;

const DUMMY_PASSWORD = hashPassword('clicmaster-dummy-password');

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'desconocida';
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function tooManyAttempts(res: Response): void {
  res.status(429).json({
    success: false,
    message: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
  });
}

// ============================================================================
// 1. REGISTRO DE CUENTA
// POST /api/auth/register  { username, robloxUsername, password, adminCode? }
// ============================================================================
apiRouter.post('/auth/register', (req: Request, res: Response): void => {
  if (!rateLimit(`register:${clientIp(req)}`, 5, ONE_HOUR)) return tooManyAttempts(res);

  const username = asText(req.body?.username);
  const robloxUsername = asText(req.body?.robloxUsername);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const adminCode = asText(req.body?.adminCode);

  if (!USERNAME_RE.test(username)) {
    res.status(400).json({
      success: false,
      message: 'El usuario debe tener de 3 a 20 caracteres: letras, números o guion bajo (_).',
    });
    return;
  }
  if (!ROBLOX_USERNAME_RE.test(robloxUsername)) {
    res.status(400).json({ success: false, message: 'Escribe un usuario de Roblox válido (3 a 20 caracteres).' });
    return;
  }
  if (password.length < 8 || password.length > 128) {
    res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres.' });
    return;
  }

  // Solo quien conozca el código secreto ADMIN_INVITE_CODE puede crear una cuenta de administrador.
  let role: 'user' | 'admin' = 'user';
  if (adminCode) {
    const realCode = process.env.ADMIN_INVITE_CODE || '';
    if (realCode.length < 12 || !safeEqual(adminCode, realCode)) {
      res.status(403).json({ success: false, message: 'El código de administrador no es válido.' });
      return;
    }
    role = 'admin';
  }

  try {
    const { hash, salt } = hashPassword(password);
    const user = db.createUser({ username, robloxUsername, passwordHash: hash, passwordSalt: salt, role });
    res.status(201).json({ success: true, token: createSessionToken(user.id), user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 2. INICIAR SESIÓN
// POST /api/auth/login  { username, password }
// ============================================================================
apiRouter.post('/auth/login', (req: Request, res: Response): void => {
  const username = asText(req.body?.username);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (
    !rateLimit(`login-ip:${clientIp(req)}`, 20, FIFTEEN_MIN) ||
    !rateLimit(`login-user:${username.toLowerCase()}`, 8, FIFTEEN_MIN)
  ) {
    return tooManyAttempts(res);
  }

  const stored = username ? db.findUserByUsername(username) : undefined;
  let valid = false;
  if (stored?.password_hash && stored.password_salt) {
    valid = verifyPassword(password, stored.password_hash, stored.password_salt);
  } else {
    // Hacemos el mismo trabajo aunque el usuario no exista, para no revelar
    // por el tiempo de respuesta qué nombres de usuario están registrados.
    verifyPassword(password, DUMMY_PASSWORD.hash, DUMMY_PASSWORD.salt);
  }

  if (!stored || !valid) {
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    return;
  }

  const user = db.getPublicUser(stored.id)!;
  res.json({ success: true, token: createSessionToken(user.id), user });
});

// ============================================================================
// 3. DATOS DE MI CUENTA, SALDO E HISTORIAL (requiere sesión)
// GET /api/user/balance
// ============================================================================
apiRouter.get('/user/balance', requireAuth, (req: AuthedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    success: true,
    user,
    balance: user.cliccoins_balance,
    transactions: db.getUserTransactions(user.id),
  });
});

// ============================================================================
// 4. PAQUETES DISPONIBLES DE CLICCOINS (público)
// GET /api/packages
// ============================================================================
apiRouter.get('/packages', (_req: Request, res: Response): void => {
  res.json({ success: true, packages: db.getPackages() });
});

// ============================================================================
// 5. SOLICITAR RECARGA DE CLICCOINS (requiere sesión)
// POST /api/coins/buy-request  { packageId, paymentMethod, paymentReference }
// Las monedas y el precio los calcula el servidor según el paquete.
// ============================================================================
apiRouter.post('/coins/buy-request', requireAuth, (req: AuthedRequest, res: Response): void => {
  const user = req.user!;
  if (!rateLimit(`buy:${user.id}`, 10, ONE_HOUR)) return tooManyAttempts(res);

  const packageId = asText(req.body?.packageId);
  const paymentMethod = asText(req.body?.paymentMethod);
  const paymentReference = asText(req.body?.paymentReference);

  if (paymentMethod !== 'Yappy' && paymentMethod !== 'Robux') {
    res.status(400).json({
      success: false,
      message: 'Método de pago no disponible. Por ahora puedes recargar con Yappy o Robux.',
    });
    return;
  }

  if (!REFERENCE_RE.test(paymentReference)) {
    res.status(400).json({
      success: false,
      message: 'El número de comprobante debe tener de 4 a 64 caracteres (letras, números y guiones).',
    });
    return;
  }

  try {
    const transaction = db.createBuyRequest({
      userId: user.id,
      packageId,
      paymentMethod,
      paymentReference,
    });

    res.status(201).json({
      success: true,
      transaction,
      balance: db.getPublicUser(user.id)?.cliccoins_balance ?? 0,
      message: `Solicitud registrada. Tu transacción (${transaction.id}) está en revisión por el equipo administrativo.`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 6. PANEL ADMIN: SOLICITUDES DE RECARGA (solo administradores)
// GET /api/admin/pending-payments
// ============================================================================
apiRouter.get('/admin/pending-payments', requireAdmin, (_req: AuthedRequest, res: Response): void => {
  const pendingPayments = db.getPendingTransactions();
  const requests = db.getPurchaseRequests();

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
      robuxPending: pendingPayments.filter((t) => t.metodo_pago === 'Robux').length,
    },
  });
});

// ============================================================================
// 7. APROBAR PAGO (solo administradores)
// POST /api/admin/approve-payment/:id
// ============================================================================
apiRouter.post('/admin/approve-payment/:id', requireAdmin, (req: AuthedRequest, res: Response): void => {
  try {
    const transaction = db.approvePayment(req.params.id, req.user!.username);
    res.json({
      success: true,
      message: `Pago aprobado. Se acreditaron ${transaction.cantidad_coins} ClicCoins a ${transaction.username}.`,
      transaction,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 8. RECHAZAR PAGO (solo administradores)
// POST /api/admin/reject-payment/:id  { reason }
// ============================================================================
apiRouter.post('/admin/reject-payment/:id', requireAdmin, (req: AuthedRequest, res: Response): void => {
  const reason = asText(req.body?.reason).slice(0, 300) || 'Comprobante no válido o pago no recibido';
  try {
    const transaction = db.rejectPayment(req.params.id, reason, req.user!.username);
    res.json({ success: true, message: `Pago rechazado. Motivo: ${reason}`, transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 9. COMPRAR EN LA TIENDA CON CLICCOINS (requiere sesión)
// POST /api/shop/purchase  { itemId }
// El precio sale del catálogo oficial del servidor, no del navegador.
// ============================================================================
apiRouter.post('/shop/purchase', requireAuth, (req: AuthedRequest, res: Response): void => {
  const user = req.user!;
  if (!rateLimit(`shop:${user.id}`, 30, ONE_HOUR)) return tooManyAttempts(res);

  const itemId = asText(req.body?.itemId);
  const item = Object.prototype.hasOwnProperty.call(COIN_SHOP_CATALOG, itemId) ? COIN_SHOP_CATALOG[itemId] : undefined;

  if (!item) {
    res.status(400).json({ success: false, message: 'Ese artículo no existe o no se puede comprar con ClicCoins.' });
    return;
  }

  try {
    const result = db.processShopPurchase({
      userId: user.id,
      itemId: item.id,
      itemName: item.name,
      costCoins: item.costCoins,
    });
    res.json({
      success: true,
      message: `¡Compra exitosa! Has adquirido ${item.name} por ${item.costCoins} ClicCoins.`,
      newBalance: result.newBalance,
      transaction: result.transaction,
      purchase: result.purchase,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cualquier otra ruta /api que no exista
apiRouter.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada.' });
});
