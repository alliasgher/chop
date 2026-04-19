const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3001'), 10),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:3000'),
  STRIPE_SECRET_KEY: optional('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: optional('STRIPE_WEBHOOK_SECRET', ''),
  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  RESEND_FROM: optional('RESEND_FROM', 'onboarding@resend.dev'),
  CRON_SECRET: optional('CRON_SECRET', 'dev-cron-secret'),
};
