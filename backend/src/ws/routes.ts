import type { FastifyInstance } from 'fastify';
import { subscribe } from './hub';

export async function wsRoutes(fastify: FastifyInstance) {
  fastify.get('/ws/shop/:shopId', { websocket: true }, (socket, req) => {
    const { shopId } = req.params as { shopId: string };
    subscribe(shopId, socket);
    socket.send(JSON.stringify({ type: 'connected', shopId }));
  });
}
