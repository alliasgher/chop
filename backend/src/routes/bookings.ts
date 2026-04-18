import type { FastifyInstance } from 'fastify';
import { db } from '../db/client';
import { broadcast } from '../ws/hub';

export async function bookingRoutes(fastify: FastifyInstance) {
  // POST /api/shops/:slug/bookings — customer creates a booking
  fastify.post('/api/shops/:slug/bookings', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const body = req.body as {
      staffId: string;
      serviceId: string;
      startsAt: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      notes?: string;
    };

    const { rows: [shop] } = await db.query('SELECT id FROM shops WHERE slug = $1', [slug]);
    if (!shop) return reply.code(404).send({ error: 'Shop not found' });

    const { rows: [service] } = await db.query(
      'SELECT duration_min, deposit_cents, name, price_cents FROM services WHERE id = $1 AND shop_id = $2',
      [body.serviceId, shop.id]
    );
    if (!service) return reply.code(404).send({ error: 'Service not found' });

    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.duration_min * 60 * 1000);

    try {
      const { rows: [booking] } = await db.query(`
        INSERT INTO bookings (shop_id, staff_id, service_id, starts_at, ends_at,
          customer_name, customer_email, customer_phone, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
        RETURNING *
      `, [shop.id, body.staffId, body.serviceId, startsAt.toISOString(), endsAt.toISOString(),
          body.customerName, body.customerEmail, body.customerPhone ?? null, body.notes ?? null]);

      // Attach service/staff info for the broadcast
      const { rows: [staff] } = await db.query('SELECT name FROM staff WHERE id = $1', [body.staffId]);

      broadcast(shop.id, {
        type: 'booking.created',
        booking: {
          ...booking,
          service_name: service.name,
          service_price_cents: service.price_cents,
          staff_name: staff?.name,
        },
      });

      return reply.code(201).send({ booking });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'That slot was just taken — please pick another time.' });
      }
      throw err;
    }
  });

  // GET /api/bookings/:id — single booking for confirmation page
  fastify.get('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { rows: [booking] } = await db.query(`
      SELECT b.*, s.name AS service_name, s.price_cents, s.duration_min,
             st.name AS staff_name, sh.name AS shop_name, sh.slug AS shop_slug
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      JOIN staff st ON st.id = b.staff_id
      JOIN shops sh ON sh.id = b.shop_id
      WHERE b.id = $1
    `, [id]);
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    return { booking };
  });

  // GET /api/bookings?email=... — customer self-lookup
  fastify.get('/api/bookings', async (req, reply) => {
    const { email } = req.query as { email: string };
    if (!email) return reply.code(400).send({ error: 'email required' });

    const { rows } = await db.query(`
      SELECT b.*, s.name AS service_name, st.name AS staff_name, sh.name AS shop_name, sh.slug AS shop_slug
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      JOIN staff st ON st.id = b.staff_id
      JOIN shops sh ON sh.id = b.shop_id
      WHERE b.customer_email = $1
      ORDER BY b.starts_at DESC
      LIMIT 50
    `, [email]);

    return { bookings: rows };
  });
}
