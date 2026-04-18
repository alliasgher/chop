import type { FastifyInstance } from 'fastify';
import { db } from '../../db/client';
import { verifyJwt } from '../../middleware/auth';

export async function ownerStaffRoutes(fastify: FastifyInstance) {
  const ownerCheck = async (shopId: string, userId: string, reply: any) => {
    const { rows: [shop] } = await db.query(
      'SELECT id FROM shops WHERE id = $1 AND owner_id = $2', [shopId, userId]
    );
    if (!shop) { reply.code(403).send({ error: 'Forbidden' }); return false; }
    return true;
  };

  fastify.get('/api/owner/shops/:shopId/staff', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };
    if (!await ownerCheck(shopId, user.sub, reply)) return;
    const { rows } = await db.query(
      'SELECT * FROM staff WHERE shop_id = $1 ORDER BY sort_order', [shopId]
    );
    return { staff: rows };
  });

  fastify.post('/api/owner/shops/:shopId/staff', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };
    if (!await ownerCheck(shopId, user.sub, reply)) return;
    const b = req.body as any;
    const { rows: [member] } = await db.query(`
      INSERT INTO staff (shop_id, name, bio, photo_url)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [shopId, b.name, b.bio ?? null, b.photo_url ?? null]);
    return reply.code(201).send({ staff: member });
  });

  fastify.patch('/api/owner/staff/:id', { preHandler: verifyJwt }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = req.user as { sub: string };
    const b = req.body as any;
    const allowed = ['name', 'bio', 'photo_url', 'is_active', 'sort_order'];
    const sets: string[] = [];
    const vals: any[] = [id, user.sub];
    for (const k of allowed) {
      if (k in b) { vals.push(b[k]); sets.push(`${k} = $${vals.length}`); }
    }
    if (!sets.length) return reply.code(400).send({ error: 'Nothing to update' });
    const { rows: [member] } = await db.query(`
      UPDATE staff SET ${sets.join(', ')}
      WHERE id = $1 AND shop_id IN (SELECT id FROM shops WHERE owner_id = $2)
      RETURNING *
    `, vals);
    if (!member) return reply.code(404).send({ error: 'Not found' });
    return { staff: member };
  });

  // PUT /api/owner/staff/:id/services — set which services this barber offers
  fastify.put('/api/owner/staff/:staffId/services', { preHandler: verifyJwt }, async (req, reply) => {
    const { staffId } = req.params as { staffId: string };
    const { serviceIds } = req.body as { serviceIds: string[] };
    const user = req.user as { sub: string };

    // Verify ownership
    const { rows: [member] } = await db.query(
      `SELECT s.id FROM staff s JOIN shops sh ON sh.id = s.shop_id
       WHERE s.id = $1 AND sh.owner_id = $2`, [staffId, user.sub]
    );
    if (!member) return reply.code(403).send({ error: 'Forbidden' });

    await db.query('DELETE FROM staff_services WHERE staff_id = $1', [staffId]);
    if (serviceIds.length > 0) {
      const vals = serviceIds.map((sid, i) => `($1, $${i + 2})`).join(',');
      await db.query(`INSERT INTO staff_services (staff_id, service_id) VALUES ${vals}`, [staffId, ...serviceIds]);
    }
    return { ok: true };
  });

  // GET/POST/DELETE availability rules
  fastify.get('/api/owner/staff/:staffId/availability', { preHandler: verifyJwt }, async (req) => {
    const { staffId } = req.params as { staffId: string };
    const { rows } = await db.query(
      'SELECT * FROM availability_rules WHERE staff_id = $1 ORDER BY day_of_week', [staffId]
    );
    return { rules: rows };
  });

  fastify.post('/api/owner/staff/:staffId/availability', { preHandler: verifyJwt }, async (req, reply) => {
    const { staffId } = req.params as { staffId: string };
    const b = req.body as any;
    const { rows: [rule] } = await db.query(`
      INSERT INTO availability_rules (staff_id, day_of_week, start_time, end_time)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [staffId, b.day_of_week, b.start_time, b.end_time]);
    return reply.code(201).send({ rule });
  });

  fastify.delete('/api/owner/availability/:id', { preHandler: verifyJwt }, async (req) => {
    const { id } = req.params as { id: string };
    await db.query('DELETE FROM availability_rules WHERE id = $1', [id]);
    return { ok: true };
  });
}
