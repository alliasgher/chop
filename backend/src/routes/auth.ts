import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { env } from '../config';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/auth/register', async (req, reply) => {
    const { email, password, name } = req.body as { email: string; password: string; name: string };
    if (!email || !password || !name) return reply.code(400).send({ error: 'All fields required' });

    const hash = await bcrypt.hash(password, 12);
    const { rows: [user] } = await db.query(`
      INSERT INTO users (email, password_hash, name, is_guest)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, name, is_guest
    `, [email, hash, name]);

    if (!user) return reply.code(409).send({ error: 'Email already registered' });

    const token = fastify.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: '7d' });
    return { user, token };
  });

  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };

    const { rows: [user] } = await db.query(
      'SELECT id, email, name, password_hash, is_guest FROM users WHERE email = $1',
      [email]
    );
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = fastify.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: '7d' });
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  });
}
