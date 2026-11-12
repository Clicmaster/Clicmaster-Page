import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { apiRouter } from './src/server/routes.ts';

const app = express();

// Dev server must run on port 3000 according to platform constraints
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 ? Number(args[portIndex + 1]) : null;
const PORT = cliPort || 3000;

const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON request bodies
app.use(express.json());

// Enable CORS and headers for iframe and cross-origin compatibility
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CLICMaster Virtual Economy API', version: '2026.1' });
});

// Mount the ClicCoins Virtual Economy API routes
app.use('/api', apiRouter);

// Global error handler for API routes
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ success: false, message: err?.message || 'Error interno del servidor' });
});

async function startServer() {
  if (!isProduction) {
    // In development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode: Serve pre-built static assets from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    // Server running on port 3000
  });
}

startServer().catch(() => {
  process.exit(1);
});
