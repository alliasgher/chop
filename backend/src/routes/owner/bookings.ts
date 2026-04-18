import type { FastifyInstance } from 'fastify';
import { db } from '../../db/client';
import { verifyJwt } from '../../middleware/auth';
import { broadcast } from '../../ws/hub';

export async function ownerBookingRoutes(fastify: FastifyInstance) {
  // GET /api/owner/shops/:shopId/bookings?date=YYYY-MM-DD&status=...
  fastify.get('/api/owner/shops/:shopId/bookings', { preHandler: verifyJwt }, async (req, reply) => {
    const { shopId } = req.params as { shopId: string };
    const { date, status } = req.query as { date?: string; status?: string };
    const user = req.user as { sub: string };

    const { rows: [shop] } = await db.query(
      'SELECT id FROM shops WHERE id = $1 AND owner_id = $2', [shopId, user.sub]
    );
    if (!shop) return reply.code(403).send({ error: 'Forbidden' });

    let query = `
      SELECT b.*, s.name AS service_name, s.price_cents, s.duration_min,
             st.name AS staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      JOIN staff st ON st.id = b.staff_id
      WHERE b.shop_id = $1
    `;
    const params: any[] = [shopId];

    if (date) {
      params.push(date);
      query += ` AND b.starts_at::date = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }
    query += ' ORDER BY b.starts_at';

    const { rows } = await db.query(query, params);
    return { bookings: rows };
  });

  // PATCH /api/owner/bookings/:id/status
  fastify.patch('/api/owner/bookings/:id/status', { preHandler: verifyJwt }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const user = req.user as { sub: string };

    const validStatuses = ['confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) return reply.code(400).send({ error: 'Invalid status' });

    const { rows: [booking] } = await db.query(`
      UPDATE bookings SET status = $1, updated_at = now()
      WHERE id = $2
        AND shop_id IN (SELECT id FROM shops WHERE owner_id = $3)
      RETURNING *, (SELECT name FROM staff WHERE id = bookings.staff_id) AS staff_name,
                  (SELECT name FROM services WHERE id = bookings.service_id) AS service_name
    `, [status, id, user.sub]);

    if (!booking) return reply.code(404).send({ error: 'Booking not found' });

    broadcast(booking.shop_id, { type: 'booking.updated', booking });
    return { booking };
  });
}
