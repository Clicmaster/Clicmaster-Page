// ============================================================================
// SERVIDOR LOCAL (para trabajar en tu computadora con "npm run dev")
// En Vercel NO se usa este archivo: allí la API corre desde api/index.ts.
// ============================================================================
// Cargar variables del archivo .env (si existe) antes que todo lo demás
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { app } from './src/server/app.js';

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 ? Number(args[portIndex + 1]) : null;
const PORT = cliPort || Number(process.env.PORT) || 3000;

const isProduction = process.env.NODE_ENV === 'production';

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
    // Modo producción local: servir la versión compilada de la carpeta dist
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
