import { afterAll, describe, expect, it } from 'vitest';
import { api, disconnect } from './helpers';

afterAll(disconnect);

// כל ה-Endpoints שהשרת מממש. אם מוסיפים נתיב, צריך להוסיף אותו גם ל-docs/openapi.json.
const expectedOperations = [
  'GET /api/health',
  'POST /api/auth/register',
  'POST /api/auth/login',
  'GET /api/auth/me',
  'GET /api/albums',
  'POST /api/albums',
  'GET /api/albums/{albumId}',
  'PUT /api/albums/{albumId}',
  'DELETE /api/albums/{albumId}',
  'POST /api/albums/{albumId}/join-code',
  'GET /api/albums/{albumId}/participants',
  'DELETE /api/albums/{albumId}/participants/{participantId}',
  'GET /api/join/{code}',
  'POST /api/join/{code}',
  'GET /api/albums/{albumId}/photos',
  'POST /api/albums/{albumId}/photos',
  'POST /api/albums/{albumId}/photos/check',
  'DELETE /api/albums/{albumId}/photos/{photoId}',
  'POST /api/albums/{albumId}/photos/{photoId}/like',
  'DELETE /api/albums/{albumId}/photos/{photoId}/like',
];

describe('Swagger ו-OpenAPI', () => {
  it('openapi.json מתעד את כל ה-Endpoints', async () => {
    const res = await api().get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);

    const operations: string[] = [];
    for (const [path, item] of Object.entries(res.body.paths as Record<string, Record<string, unknown>>)) {
      for (const method of Object.keys(item)) {
        if (method !== 'parameters') operations.push(`${method.toUpperCase()} ${path}`);
      }
    }
    expect(operations.sort()).toEqual([...expectedOperations].sort());
  });

  it('מגדיר Bearer JWT, וכל נתיב מוגן דורש אותו', async () => {
    const res = await api().get('/openapi.json');
    expect(res.body.components.securitySchemes.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer' });

    // נתיבי ההצטרפות פתוחים למי שיש לו את הקישור
    const publicOps = ['/api/health', '/api/auth/register', '/api/auth/login', '/api/join/{code}'];
    for (const [path, item] of Object.entries(res.body.paths as Record<string, Record<string, { security?: unknown }>>)) {
      if (publicOps.includes(path)) continue;
      for (const [method, op] of Object.entries(item)) {
        if (method === 'parameters') continue;
        expect(op.security, `${method} ${path}`).toEqual([{ bearerAuth: [] }]);
      }
    }
  });

  it('Swagger UI נפתח ב-/api-docs', async () => {
    const res = await api().get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text.toLowerCase()).toContain('swagger');
  });
});

describe('בריאות ושגיאות כלליות', () => {
  it('GET /api/health', async () => {
    const res = await api().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('כתובת לא קיימת מחזירה 404 עם הודעת JSON', async () => {
    const res = await api().get('/api/no-such-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it('JSON לא תקין מחזיר 400', async () => {
    const res = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
  });
});
