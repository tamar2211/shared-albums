// הרכבת אפליקציית Express: הגדרות כלליות, נתיבים, Swagger וטיפול בשגיאות.
import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { swaggerRouter } from './docs/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { albumRouter } from './routes/album.routes';
import { authRouter } from './routes/auth.routes';
import { joinRouter } from './routes/join.routes';

export function createApp() {
  const app = express();

  // Render מעביר בקשות דרך proxy
  app.set('trust proxy', 1);

  // CORS: רק כתובות הלקוח שהוגדרו ב-CORS_ORIGINS רשאיות לפנות מהדפדפן
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || env.corsOrigins.includes(origin));
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/albums', albumRouter);
  app.use('/api/join', joinRouter);
  app.use(swaggerRouter());

  app.get('/', (_req, res) => {
    res.redirect('/api-docs');
  });

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
