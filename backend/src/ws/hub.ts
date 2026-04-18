import type { WebSocket } from '@fastify/websocket';

const channels = new Map<string, Set<WebSocket>>();

export function subscribe(shopId: string, ws: WebSocket) {
  if (!channels.has(shopId)) channels.set(shopId, new Set());
  channels.get(shopId)!.add(ws);
  ws.on('close', () => channels.get(shopId)?.delete(ws));
}

export function broadcast(shopId: string, event: object) {
  const subs = channels.get(shopId);
  if (!subs) return;
  const payload = JSON.stringify(event);
  subs.forEach((ws) => {
    if (ws.readyState === 1) ws.send(payload);
  });
}
