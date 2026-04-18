import type { FastifyInstance } from 'fastify';
import { db } from '../db/client';
import { env } from '../config';
import { sendPendingReminders } from '../services/reminders.service';

export async function demoRoutes(fastify: FastifyInstance) {
  const verifyCron = (req: any, reply: any) => {
    const secret = req.headers['x-cron-secret'];
    if (secret !== env.CRON_SECRET) return reply.code(403).send({ error: 'Forbidden' });
  };

  // POST /api/cron/reminders — send 24h reminder emails
  fastify.post('/api/cron/reminders', async (req, reply) => {
    verifyCron(req, reply);
    await sendPendingReminders();
    return { ok: true };
  });

  // POST /api/cron/reset-demo — reset chop-barbers bookings (Monday 3am UTC)
  fastify.post('/api/cron/reset-demo', async (req, reply) => {
    verifyCron(req, reply);
    await db.query(`
      DELETE FROM bookings
      WHERE shop_id = (SELECT id FROM shops WHERE slug = 'chop-barbers')
        AND starts_at < now()
    `);
    return { ok: true, message: 'Demo shop reset' };
  });
}
