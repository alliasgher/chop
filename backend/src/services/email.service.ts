import { Resend } from 'resend';
import { env } from '../config';
import { buildICS } from '../lib/ics';
import { db } from '../db/client';

function getResend() {
  return new Resend(env.RESEND_API_KEY || 're_test_placeholder');
}

interface BookingEmailParams {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  staffName: string;
  serviceName: string;
  shopName: string;
  shopAddress: string;
  shopEmail: string;
  startsAt: Date;
  endsAt: Date;
  depositPaidCents: number;
}

export async function sendConfirmationEmail(p: BookingEmailParams) {
  const resend = getResend();

  const ics = buildICS({
    summary: `${p.serviceName} at ${p.shopName}`,
    description: `Your appointment with ${p.staffName}`,
    location: p.shopAddress,
    startsAt: p.startsAt,
    endsAt: p.endsAt,
    organizerEmail: p.shopEmail,
    organizerName: p.shopName,
    attendeeEmail: p.customerEmail,
    attendeeName: p.customerName,
  });

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(p.startsAt);

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAF7F2;border-radius:16px;">
      <h1 style="font-size:24px;font-weight:700;color:#1A1825;margin:0 0 4px;">You're booked! ✂️</h1>
      <p style="color:#7A736A;font-size:14px;margin:0 0 24px;">Here's everything you need to know.</p>

      <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #E5DDD3;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#7A736A;padding:6px 0;">Barber</td><td style="color:#1A1825;font-weight:600;text-align:right;">${p.staffName}</td></tr>
          <tr><td style="color:#7A736A;padding:6px 0;">Service</td><td style="color:#1A1825;font-weight:600;text-align:right;">${p.serviceName}</td></tr>
          <tr><td style="color:#7A736A;padding:6px 0;">When</td><td style="color:#1A1825;font-weight:600;text-align:right;">${formattedTime}</td></tr>
          <tr><td style="color:#7A736A;padding:6px 0;">Shop</td><td style="color:#1A1825;font-weight:600;text-align:right;">${p.shopName}</td></tr>
          ${p.shopAddress ? `<tr><td style="color:#7A736A;padding:6px 0;">Address</td><td style="color:#1A1825;font-weight:600;text-align:right;">${p.shopAddress}</td></tr>` : ''}
        </table>
      </div>

      <p style="font-size:12px;color:#7A736A;text-align:center;">The .ics calendar file is attached — tap it to add this to your calendar.</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM,
    to: p.customerEmail,
    subject: `Confirmed: ${p.serviceName} at ${p.shopName}`,
    html,
    attachments: [{
      filename: 'booking.ics',
      content: Buffer.from(ics).toString('base64'),
    }],
  });

  // Log to messages table
  await db.query(`
    INSERT INTO messages (booking_id, kind, recipient, subject, body, is_real)
    VALUES ($1, 'email', $2, $3, $4, $5)
  `, [
    p.bookingId,
    p.customerEmail,
    `Confirmed: ${p.serviceName} at ${p.shopName}`,
    `Booking confirmation sent to ${p.customerEmail}`,
    !error,
  ]);

  if (error) console.error('Resend error:', error);
}

export async function sendReminderEmail(p: BookingEmailParams) {
  const resend = getResend();

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(p.startsAt);

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAF7F2;border-radius:16px;">
      <h1 style="font-size:24px;font-weight:700;color:#1A1825;margin:0 0 4px;">See you tomorrow! ✂️</h1>
      <p style="color:#7A736A;font-size:14px;margin:0 0 24px;">Just a reminder about your appointment at ${p.shopName}.</p>
      <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E5DDD3;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#7A736A;padding:6px 0;">Barber</td><td style="color:#1A1825;font-weight:600;text-align:right;">${p.staffName}</td></tr>
          <tr><td style="color:#7A736A;padding:6px 0;">Service</td><td style="color:#1A1825;font-weight:600;text-align:right;">${p.serviceName}</td></tr>
          <tr><td style="color:#7A736A;padding:6px 0;">When</td><td style="color:#1A1825;font-weight:600;text-align:right;">${formattedTime}</td></tr>
        </table>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: env.RESEND_FROM,
    to: p.customerEmail,
    subject: `Reminder: ${p.serviceName} tomorrow at ${p.shopName}`,
    html,
  });

  await db.query(`
    INSERT INTO messages (booking_id, kind, recipient, subject, body, is_real)
    VALUES ($1, 'email', $2, $3, $4, true)
  `, [
    p.bookingId,
    p.customerEmail,
    `Reminder: ${p.serviceName} tomorrow at ${p.shopName}`,
    `24h reminder sent to ${p.customerEmail}`,
  ]);
}
