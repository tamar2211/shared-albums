// Swagger UI בכתובת /api-docs, והמסמך עצמו בכתובת /openapi.json.
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

// הקובץ נמצא בתיקיית docs בשורש הפרויקט, גם כשהשרת רץ מתוך dist
const openApiPath = path.resolve(__dirname, '..', '..', 'docs', 'openapi.json');

export function loadOpenApi(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(openApiPath, 'utf8')) as Record<string, unknown>;
}

export function swaggerRouter(): Router {
  const document = loadOpenApi();
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(document);
  });

  router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(document, {
      customSiteTitle: 'Shared Albums API',
      swaggerOptions: { persistAuthorization: true },
    }),
  );

  return router;
}
