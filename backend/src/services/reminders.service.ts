import { db } from '../db/client';
import { sendReminderEmail } from './email.service';

export async function sendPendingReminders() {
  // Find confirmed bookings starting in 23–25 hours that haven't been reminded
  const { rows } = await db.query(`
    SELECT b.id, b.customer_name, b.customer_email, b.starts_at, b.ends_at,
           s.name AS service_name, st.name AS staff_name,
           sh.name AS shop_name, sh.address AS shop_address,
           sh.email AS shop_email
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    JOIN staff st ON st.id = b.staff_id
    JOIN shops sh ON sh.id = b.shop_id
    WHERE b.status = 'confirmed'
      AND b.starts_at BETWEEN now() + interval '23 hours' AND now() + interval '25 hours'
      AND NOT EXISTS (
        SELECT 1 FROM messages m
        WHERE m.booking_id = b.id AND m.kind = 'email' AND m.subject ILIKE '%reminder%'
      )
  `);

  for (const row of rows) {
    await sendReminderEmail({
      bookingId: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      staffName: row.staff_name,
      serviceName: row.service_name,
      shopName: row.shop_name,
      shopAddress: row.shop_address ?? '',
      shopEmail: row.shop_email ?? '',
      startsAt: new Date(row.starts_at),
      endsAt: new Date(row.ends_at),
      depositPaidCents: 0,
    }).catch((err) => console.error(`Reminder failed for booking ${row.id}:`, err));
  }

  console.log(`Reminders: checked ${rows.length} upcoming bookings`);
}
