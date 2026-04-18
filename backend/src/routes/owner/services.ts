import type { FastifyInstance } from 'fastify';
import { db } from '../../db/client';
import { verifyJwt } from '../../middleware/auth';

export async function ownerServiceRoutes(fastify: FastifyInstance) {
  const ownerCheck = async (shopId: string, userId: string, reply: any) => {
    const { rows: [shop] } = await db.query(
      'SELECT id FROM shops WHERE id = $1 AND owner_id = $2', [shopId, userId]
    );
    if (!shop) { reply.code(403).send({ error: 'Forbidden' }); return false; }
    return true;
  };

  fastify.get('/api/owner/shops/:shopId/services', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };
    if (!await ownerCheck(shopId, user.sub, reply)) return;
    const { rows } = await db.query(
      'SELECT * FROM services WHERE shop_id = $1 ORDER BY sort_order', [shopId]
    );
    return { services: rows };
  });

  fastify.post('/api/owner/shops/:shopId/services', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };
    if (!await ownerCheck(shopId, user.sub, reply)) return;
    const b = req.body as any;
    const { rows: [svc] } = await db.query(`
      INSERT INTO services (shop_id, name, description, duration_min, price_cents, deposit_cents, category)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [shopId, b.name, b.description ?? null, b.duration_min, b.price_cents, b.deposit_cents ?? 0, b.category ?? null]);
    return reply.code(201).send({ service: svc });
  });

  fastify.patch('/api/owner/services/:id', { preHandler: verifyJwt }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = req.user as { sub: string };
    const b = req.body as any;
    const allowed = ['name', 'description', 'duration_min', 'price_cents', 'deposit_cents', 'category', 'is_active', 'sort_order'];
    const sets: string[] = [];
    const vals: any[] = [id, user.sub];
    for (const k of allowed) {
      if (k in b) { vals.push(b[k]); sets.push(`${k} = $${vals.length}`); }
    }
    if (!sets.length) return reply.code(400).send({ error: 'Nothing to update' });
    const { rows: [svc] } = await db.query(`
      UPDATE services SET ${sets.join(', ')}
      WHERE id = $1 AND shop_id IN (SELECT id FROM shops WHERE owner_id = $2)
      RETURNING *
    `, vals);
    if (!svc) return reply.code(404).send({ error: 'Not found' });
    return { service: svc };
  });

  fastify.delete('/api/owner/services/:id', { preHandler: verifyJwt }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = req.user as { sub: string };
    await db.query(`
      DELETE FROM services WHERE id = $1
        AND shop_id IN (SELECT id FROM shops WHERE owner_id = $2)
    `, [id, user.sub]);
    return { ok: true };
  });
}
