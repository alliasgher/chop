import type { FastifyInstance } from 'fastify';
import { db } from '../db/client';

export async function publicRoutes(fastify: FastifyInstance) {
  // GET /api/shops/:slug — shop info + staff + services
  fastify.get('/api/shops/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };

    const { rows: [shop] } = await db.query(
      `SELECT id, slug, name, timezone, logo_url, colors, fonts, description, phone, email, address
       FROM shops WHERE slug = $1`,
      [slug]
    );
    if (!shop) return reply.code(404).send({ error: 'Shop not found' });

    const { rows: staff } = await db.query(
      `SELECT id, name, bio, photo_url, sort_order FROM staff
       WHERE shop_id = $1 AND is_active = true ORDER BY sort_order`,
      [shop.id]
    );

    const { rows: services } = await db.query(
      `SELECT id, name, description, duration_min, price_cents, deposit_cents, category, sort_order
       FROM services WHERE shop_id = $1 AND is_active = true ORDER BY sort_order`,
      [shop.id]
    );

    // Staff-service assignments
    const { rows: assignments } = await db.query(
      `SELECT ss.staff_id, ss.service_id FROM staff_services ss
       JOIN staff s ON s.id = ss.staff_id WHERE s.shop_id = $1`,
      [shop.id]
    );

    return { shop, staff, services, staffServices: assignments };
  });

  // GET /api/shops/:slug/bookings/today — public for live demo panel
  fastify.get('/api/shops/:slug/bookings/today', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const { rows: [shop] } = await db.query('SELECT id FROM shops WHERE slug = $1', [slug]);
    if (!shop) return reply.code(404).send({ error: 'Not found' });
    const { rows } = await db.query(`
      SELECT b.id, b.customer_name, b.starts_at, b.status,
             s.name AS service_name, st.name AS staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      JOIN staff st ON st.id = b.staff_id
      WHERE b.shop_id = $1 AND b.starts_at::date = CURRENT_DATE
      ORDER BY b.starts_at
    `, [shop.id]);
    return { bookings: rows };
  });

  // GET /api/shops/:slug/staff/:staffId/slots?date=YYYY-MM-DD&serviceId=uuid
  fastify.get('/api/shops/:slug/staff/:staffId/slots', async (req, reply) => {
    const { slug, staffId } = req.params as { slug: string; staffId: string };
    const { date, serviceId } = req.query as { date: string; serviceId: string };

    if (!date || !serviceId) return reply.code(400).send({ error: 'date and serviceId required' });

    // Get shop timezone + service duration
    const { rows: [shop] } = await db.query(
      'SELECT id, timezone FROM shops WHERE slug = $1', [slug]
    );
    if (!shop) return reply.code(404).send({ error: 'Shop not found' });

    const { rows: [service] } = await db.query(
      'SELECT duration_min FROM services WHERE id = $1 AND shop_id = $2',
      [serviceId, shop.id]
    );
    if (!service) return reply.code(404).send({ error: 'Service not found' });

    // Import availability service dynamically to keep route file clean
    const { computeSlots } = await import('../services/availability.service');
    const slots = await computeSlots({ staffId, date, shopTimezone: shop.timezone, durationMin: service.duration_min });

    return { slots };
  });
}
