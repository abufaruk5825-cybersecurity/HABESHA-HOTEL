import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './routes/index.ts';
import { seedDatabase } from '../db/seeds/seed.ts';

dotenv.config({ override: true });

const projectRoot = process.cwd();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize and seed database
  try {
    await seedDatabase();
  } catch (err: any) {
    console.error('Failed to initialize database:', err);
    if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n❌ MySQL Authentication Error:');
      console.error(`   - Connected as user: '${process.env.DB_USER || 'root'}'`);
      console.error(`   - Target: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
      console.error(`   - Please verify DB_PASSWORD in your .env file matches your MySQL password.`);
    }
  }

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  // Static image assets and public folder (canonical source: client/public)
  app.use('/images', express.static(path.resolve(projectRoot, 'client', 'public', 'images')));
  app.use(express.static(path.resolve(projectRoot, 'client', 'public')));

  // Mount API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'HABESHA-HOTEL SHMS', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: projectRoot,
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(projectRoot, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(projectRoot, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n🏨 HABESHA-HOTEL SHMS is running!`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`   ➜ Network: http://127.0.0.1:${PORT}\n`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
