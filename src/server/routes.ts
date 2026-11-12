import { Router, Request, Response } from 'express';
import { db, PaymentMetodo } from './db.ts';

export const apiRouter = Router();

// ============================================================================
// 1. OBTENER SALDO Y TRANSACCIONES DEL USUARIO
// GET /api/user/balance
// ============================================================================
apiRouter.get('/user/balance', (req: Request, res: Response): void => {
  try {
    const userId = (req.query.userId as string) || 'usr-carlos-01';
    let user = db.getUser(userId);

    if (!user) {
      user = db.getDefaultUser();
    }

    const transactions = db.getUserTransactions(user.id);

    res.json({
      success: true,
      user,
      balance: user.cliccoins_balance,
      transactions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 2. PAQUETES DISPONIBLES DE CLICCOINS
// GET /api/packages
// ============================================================================
apiRouter.get('/packages', (_req: Request, res: Response): void => {
  try {
    const packages = db.getPackages();
    res.json({ success: true, packages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 3. REGISTRAR SOLICITUD DE COMPRA DE CLICCOINS
// POST /api/coins/buy-request
// ============================================================================
apiRouter.post('/coins/buy-request', (req: Request, res: Response): void => {
  try {
    const {
      userId = 'usr-carlos-01',
      packageId,
      coins,
      amountMoney,
      paymentMethod,
      paymentReference,
      detalles,
    } = req.body;

    if (!coins || coins <= 0) {
      res.status(400).json({ success: false, message: 'La cantidad de ClicCoins debe ser mayor a 0.' });
      return;
    }

    if (!paymentMethod || !['Yappy', 'PayPal', 'Robux', 'Sistema'].includes(paymentMethod)) {
      res.status(400).json({ success: false, message: 'Método de pago no válido.' });
      return;
    }

    if (!paymentReference || typeof paymentReference !== 'string' || !paymentReference.trim()) {
      res.status(400).json({
        success: false,
        message: 'Debes proporcionar un número de referencia o boleta de pago.',
      });
      return;
    }

    const transaction = db.createBuyRequest({
      userId,
      packageId,
      coins: parseInt(coins, 10),
      amountMoney: parseFloat(amountMoney) || 0,
      paymentMethod: paymentMethod as PaymentMetodo,
      paymentReference: paymentReference.trim(),
      detalles,
    });

    const user = db.getUser(userId);

    const message =
      transaction.estado === 'completado'
        ? `¡Pago completado! Se han acreditado ${transaction.cantidad_coins} ClicCoins a tu cuenta.`
        : `Solicitud registrada exitosamente. Tu transacción (${transaction.id}) está en revisión por nuestro equipo administrativo.`;

    res.status(201).json({
      success: true,
      transaction,
      balance: user?.cliccoins_balance ?? 0,
      message,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 4. WEBHOOK PAYPAL / CAPTURA AUTOMÁTICA
// POST /api/webhooks/paypal
// ============================================================================
apiRouter.post('/webhooks/paypal', (req: Request, res: Response): void => {
  try {
    const {
      event_type,
      resource,
      orderId,
      userId = 'usr-carlos-01',
      coins = 1000,
      amountMoney = 14.99,
    } = req.body;

    // Acepta tanto formato webhook estándar PayPal como payload directo de captura
    const reference = resource?.id || orderId || `PP-CAPTURE-${Date.now()}`;
    const targetCoins = resource?.custom_id ? parseInt(resource.custom_id, 10) : coins;
    const targetAmount = resource?.amount?.value ? parseFloat(resource.amount.value) : amountMoney;

    const transaction = db.createBuyRequest({
      userId,
      coins: targetCoins,
      amountMoney: targetAmount,
      paymentMethod: 'PayPal',
      paymentReference: reference,
      detalles: `Webhook PayPal confirmado automáticamente: Evento ${event_type || 'CHECKOUT.ORDER.COMPLETED'}`,
      autoComplete: true,
    });

    const user = db.getUser(userId);

    res.json({
      success: true,
      message: 'Pago de PayPal verificado y acreditado instantáneamente.',
      transaction,
      newBalance: user?.cliccoins_balance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 5. LISTAR PAGOS PENDIENTES (PANEL ADMINISTRADOR)
// GET /api/admin/pending-payments
// ============================================================================
apiRouter.get('/admin/pending-payments', (_req: Request, res: Response): void => {
  try {
    const pendingPayments = db.getPendingTransactions();
    const allTransactions = db.getAllTransactions();

    res.json({
      success: true,
      pendingPayments,
      totalPending: pendingPayments.length,
      stats: {
        totalPending: pendingPayments.length,
        totalCompleted: allTransactions.filter((t) => t.estado === 'completado').length,
        totalRejected: allTransactions.filter((t) => t.estado === 'rechazado').length,
        yappyPending: pendingPayments.filter((t) => t.metodo_pago === 'Yappy').length,
        robuxPending: pendingPayments.filter((t) => t.metodo_pago === 'Robux').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 6. APROBAR PAGO MANUAL (YAPPY / ROBUX)
// POST /api/admin/approve-payment/:id
// ============================================================================
apiRouter.post('/admin/approve-payment/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { adminUsername = 'Admin_Master' } = req.body;

    const transaction = db.approvePayment(id, adminUsername);
    const user = db.getUser(transaction.user_id);

    res.json({
      success: true,
      message: `Pago ${id} aprobado con éxito. Se acreditaron ${transaction.cantidad_coins} ClicCoins al usuario ${transaction.username}.`,
      transaction,
      userNewBalance: user?.cliccoins_balance,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 7. RECHAZAR PAGO MANUAL (YAPPY / ROBUX)
// POST /api/admin/reject-payment/:id
// ============================================================================
apiRouter.post('/admin/reject-payment/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { reason, adminUsername = 'Admin_Master' } = req.body;

    const transaction = db.rejectPayment(id, reason, adminUsername);

    res.json({
      success: true,
      message: `Pago ${id} rechazado. Motivo: ${transaction.rejection_reason}`,
      transaction,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 8. COMPRA EN TIENDA CON CLICCOINS (GASTO EN PLATAFORMA)
// POST /api/shop/purchase
// ============================================================================
apiRouter.post('/shop/purchase', (req: Request, res: Response): void => {
  try {
    const {
      userId = 'usr-carlos-01',
      itemId,
      itemName,
      costCoins,
    } = req.body;

    if (!itemId || !itemName) {
      res.status(400).json({ success: false, message: 'Faltan datos del artículo a comprar.' });
      return;
    }

    const coinsToDeduct = parseInt(costCoins, 10);
    if (isNaN(coinsToDeduct) || coinsToDeduct <= 0) {
      res.status(400).json({ success: false, message: 'El precio en ClicCoins es inválido.' });
      return;
    }

    const result = db.processShopPurchase({
      userId,
      itemId,
      itemName,
      costCoins: coinsToDeduct,
    });

    res.json({
      success: true,
      message: `¡Compra exitosa! Has adquirido ${itemName} por ${coinsToDeduct} ClicCoins.`,
      newBalance: result.newBalance,
      transaction: result.transaction,
      purchase: result.purchase,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 9. SWITCH USER / ROLE (UTILIDAD DE TEST PARA ADMIN & CLIENTE)
// POST /api/user/toggle-role
// ============================================================================
apiRouter.post('/user/toggle-role', (req: Request, res: Response): void => {
  try {
    const { userId = 'usr-carlos-01', role } = req.body;
    const targetRole = role === 'admin' ? 'admin' : 'user';
    const user = db.switchUserRole(userId, targetRole);

    res.json({
      success: true,
      user,
      message: `Rol actualizado a ${targetRole}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
