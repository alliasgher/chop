import type { FastifyInstance } from 'fastify';
import { db } from '../../db/client';
import { verifyJwt } from '../../middleware/auth';

export async function ownerShopRoutes(fastify: FastifyInstance) {
  // GET /api/owner/shops — list owner's shops
  fastify.get('/api/owner/shops', { preHandler: verifyJwt }, async (req) => {
    const user = req.user as { sub: string };
    const { rows } = await db.query(
      'SELECT * FROM shops WHERE owner_id = $1 ORDER BY created_at',
      [user.sub]
    );
    return { shops: rows };
  });

  // POST /api/owner/shops — create a new shop (called from wizard)
  fastify.post('/api/owner/shops', { preHandler: verifyJwt }, async (req, reply) => {
    const user = req.user as { sub: string };
    const b = req.body as any;
    const { rows: [shop] } = await db.query(`
      INSERT INTO shops (owner_id, slug, name, timezone, colors, fonts, description, is_demo, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      user.sub, b.slug, b.name, b.timezone ?? 'America/New_York',
      JSON.stringify(b.colors ?? {}), JSON.stringify(b.fonts ?? {}),
      b.description ?? null, b.is_demo ?? false, b.expires_at ?? null,
    ]);
    return reply.code(201).send({ shop });
  });

  // GET /api/owner/shops/:shopId
  fastify.get('/api/owner/shops/:shopId', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };
    const { rows: [shop] } = await db.query(
      'SELECT * FROM shops WHERE id = $1 AND owner_id = $2', [shopId, user.sub]
    );
    if (!shop) return reply.code(404).send({ error: 'Not found' });
    return { shop };
  });

  // PATCH /api/owner/shops/:shopId
  fastify.patch('/api/owner/shops/:shopId', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };
    const updates = req.body as Record<string, any>;

    const allowed = ['name', 'description', 'phone', 'email', 'address', 'timezone', 'colors', 'fonts', 'logo_url'];
    const sets: string[] = [];
    const values: any[] = [shopId, user.sub];

    for (const key of allowed) {
      if (key in updates) {
        values.push(updates[key]);
        sets.push(`${key} = $${values.length}`);
      }
    }

    if (sets.length === 0) return reply.code(400).send({ error: 'No valid fields' });

    const { rows: [shop] } = await db.query(`
      UPDATE shops SET ${sets.join(', ')}, updated_at = now()
      WHERE id = $1 AND owner_id = $2
      RETURNING *
    `, values);

    if (!shop) return reply.code(404).send({ error: 'Not found' });
    return { shop };
  });
}
