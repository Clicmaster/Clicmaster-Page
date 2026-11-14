// Cargar variables del archivo .env (si existe) antes que todo lo demás
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { apiRouter } from './src/server/routes.ts';

const app = express();

// El servidor usa el puerto 3000 por defecto (o el indicado con --port / PORT)
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 ? Number(args[portIndex + 1]) : null;
const PORT = cliPort || Number(process.env.PORT) || 3000;

const isProduction = process.env.NODE_ENV === 'production';

// No anunciar qué tecnología usa el servidor
app.disable('x-powered-by');

// En el hosting (Cloud Run, Vercel, etc.) hay un proxy delante: esto permite
// conocer la IP real del visitante para el limitador de intentos.
if (isProduction) {
  app.set('trust proxy', 1);
}

// Cabeceras de seguridad básicas
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Bloquear el acceso público a archivos internos (base de datos, código del servidor, claves)
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

// Verificación de estado
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CLICMaster Virtual Economy API', version: '2026.2' });
});

// Rutas de la economía ClicCoins
app.use('/api', apiRouter);

// Manejo de errores: no mostrar detalles internos al visitante
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'Solicitud con formato inválido.' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: 'La solicitud es demasiado grande.' });
    return;
  }
  console.error('[CLICMaster] Error no controlado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor.' });
});

async function startServer() {
  if (!isProduction) {
    // Modo desarrollo: Vite sirve la página con recarga automática
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo producción: servir la versión compilada de la carpeta dist
    const distPath = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('[CLICMaster] No existe la carpeta "dist". Ejecuta "npm run build" antes de iniciar en producción.');
    }
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CLICMaster] Servidor funcionando en el puerto ${PORT} (${isProduction ? 'producción' : 'desarrollo'})`);
  });
}

startServer().catch((error) => {
  console.error('[CLICMaster] El servidor no pudo arrancar:', error);
  process.exit(1);
});
