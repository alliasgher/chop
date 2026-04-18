import type { FastifyInstance } from 'fastify';
import { db } from '../../db/client';
import { verifyJwt } from '../../middleware/auth';

export async function ownerMessageRoutes(fastify: FastifyInstance) {
  fastify.get('/api/owner/shops/:shopId/messages', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const user = req.user as { sub: string };

    const { rows: [shop] } = await db.query(
      'SELECT id FROM shops WHERE id = $1 AND owner_id = $2', [shopId, user.sub]
    );
    if (!shop) return reply.code(403).send({ error: 'Forbidden' });

    const { rows } = await db.query(`
      SELECT m.*, b.customer_name, b.customer_email
      FROM messages m
      JOIN bookings b ON b.id = m.booking_id
      WHERE b.shop_id = $1
      ORDER BY m.sent_at DESC
      LIMIT 100
    `, [shopId]);

    return { messages: rows };
  });
}
