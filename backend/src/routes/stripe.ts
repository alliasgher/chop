import type { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { db } from '../db/client';
import { env } from '../config';

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
}

export async function stripeRoutes(fastify: FastifyInstance) {
  // POST /api/bookings/:id/checkout — create Stripe checkout session
  fastify.post('/api/bookings/:id/checkout', async (req, reply) => {
    const { id } = req.params as { id: string };
    const stripe = getStripe();

    const { rows: [booking] } = await db.query(`
      SELECT b.*, s.name AS service_name, s.deposit_cents, sh.slug
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      JOIN shops sh ON sh.id = b.shop_id
      WHERE b.id = $1
    `, [id]);

    if (!booking) return reply.code(404).send({ error: 'Booking not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: booking.customer_email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: booking.deposit_cents,
          product_data: {
            name: `Deposit — ${booking.service_name}`,
            description: `Booking ID: ${booking.id}`,
          },
        },
        quantity: 1,
      }],
      metadata: { booking_id: booking.id },
      success_url: `${env.FRONTEND_URL}/book/${booking.slug}/confirmation/${booking.id}?paid=1`,
      cancel_url: `${env.FRONTEND_URL}/book/${booking.slug}/details?cancelled=1`,
    });

    return { url: session.url };
  });

  // POST /api/stripe/webhook — handle payment success
  fastify.post('/api/stripe/webhook', {
    config: { rawBody: true },
  }, async (req, reply) => {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch {
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.CheckoutSession;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        await db.query(`
          UPDATE bookings
          SET status = 'confirmed',
              stripe_payment_intent_id = $1,
              deposit_paid_cents = $2,
              updated_at = now()
          WHERE id = $3
        `, [session.payment_intent, session.amount_total, bookingId]);
      }
    }

    return { received: true };
  });
}
