import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { env } from './config';
import { db } from './db/client';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { publicRoutes } from './routes/public';
import { bookingRoutes } from './routes/bookings';
import { ownerShopRoutes } from './routes/owner/shops';
import { ownerBookingRoutes } from './routes/owner/bookings';
import { ownerServiceRoutes } from './routes/owner/services';
import { ownerStaffRoutes } from './routes/owner/staff';
import { stripeRoutes } from './routes/stripe';
import { demoRoutes } from './routes/demo';
import { wsRoutes } from './ws/routes';

const fastify = Fastify({ logger: true });

async function bootstrap() {
  await fastify.register(cors, {
    origin: [env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
  });

  await fastify.register(jwt, { secret: env.JWT_SECRET });
  await fastify.register(websocket);

  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(publicRoutes);
  await fastify.register(bookingRoutes);
  await fastify.register(ownerShopRoutes);
  await fastify.register(ownerBookingRoutes);
  await fastify.register(ownerServiceRoutes);
  await fastify.register(ownerStaffRoutes);
  await fastify.register(stripeRoutes);
  await fastify.register(demoRoutes);
  await fastify.register(wsRoutes);

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
}

bootstrap().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
