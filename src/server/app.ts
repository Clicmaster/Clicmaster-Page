// ============================================================================
// APLICACIÓN DEL SERVIDOR (API de ClicCoins)
// La usan tanto el servidor local (server.ts) como Vercel (api/index.ts).
// ============================================================================
import express, { Request, Response, NextFunction } from 'express';
import { apiRouter } from './routes.js';
import { getStore, UserFacingError } from './db.js';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

export const app = express();

// No anunciar qué tecnología usa el servidor
app.disable('x-powered-by');

// En el hosting hay un proxy delante: esto permite conocer la IP real del
// visitante para el limitador de intentos.
if (isProduction) {
  app.set('trust proxy', 1);
}

// Cabeceras de seguridad básicas
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  next();
});

// Bloquear el acceso público a archivos internos (base de datos local, código del servidor, claves)
app.use((req: Request, res: Response, next: NextFunction) => {
  let requested = req.path;
  try {
    requested = decodeURIComponent(req.path);
  } catch {
    // ruta mal formada: se revisa tal cual
  }
  const lower = requested.toLowerCase();
  const isPrivate =
    lower.includes('cliccoins_db') ||
    lower.startsWith('/data/') ||
    lower.includes('/src/server/') ||
    lower.endsWith('/server.ts') ||
    lower.includes('/.env') ||
    lower.includes('/.git');
  if (isPrivate) {
    res.status(404).send('No encontrado');
    return;
  }
  next();
});

// Leer cuerpos JSON (con tamaño máximo para evitar abusos)
app.use(express.json({ limit: '20kb' }));

// Las respuestas de la API nunca se guardan en caché (contienen saldos y datos de cuenta)
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Verificación de estado: confirma que el servidor Y la base de datos responden
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const store = getStore();
    await store.ping();
    res.json({ status: 'ok', service: 'CLICMaster Virtual Economy API', version: '2026.3', database: store.kind });
  } catch (error) {
    console.error('[CLICMaster] La base de datos no responde:', error);
    res.status(503).json({ status: 'error', message: 'La base de datos no responde.' });
  }
});

// Rutas de la economía ClicCoins
app.use('/api', apiRouter);

// Manejo de errores: mensajes claros para el usuario, sin detalles internos
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof UserFacingError) {
    if (err.status >= 500) console.error('[CLICMaster]', err.message);
    res.status(err.status).json({ success: false, message: err.message });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'Solicitud con formato inválido.' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: 'La solicitud es demasiado grande.' });
    return;
  }
  console.error('[CLICMaster] Error no controlado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor. Intenta de nuevo.' });
});
