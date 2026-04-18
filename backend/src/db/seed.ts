import 'dotenv/config';
import bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import { db } from './client';

async function seed() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Owner account
    const passwordHash = await bcrypt.hash('chop-demo-2024', 12);
    const { rows: [owner] } = await client.query(`
      INSERT INTO users (email, password_hash, name, is_guest)
      VALUES ($1, $2, $3, false)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['owner@chopbarbers.com', passwordHash, 'Chop Barbers Owner']);

    // Demo shop
    const { rows: [shop] } = await client.query(`
      INSERT INTO shops (owner_id, slug, name, timezone, colors, fonts, description, phone, email, address, is_demo)
      VALUES ($1, 'chop-barbers', 'Chop Barbers', 'America/New_York',
        '{"primary":"#1A1A1A","accent":"#D4A574","background":"#FAFAFA"}',
        '{"heading":"Montserrat","body":"Inter"}',
        'Premium barbershop in the heart of the city. Walk-ins welcome, appointments preferred.',
        '(212) 555-0190', 'hello@chopbarbers.com', '247 W 36th St, New York, NY 10018', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [owner.id]);

    const shopId = shop.id;

    // Staff
    const staffData = [
      { name: 'Marcus', bio: '10 years experience. Specializes in fades, tapers, and classic cuts.', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', sort_order: 0 },
      { name: 'Jin', bio: 'Master of beard sculpting and hot towel shaves. Precision is his passion.', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', sort_order: 1 },
      { name: 'Devon', bio: 'Modern cuts, color treatments, and creative styling. Always on trend.', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', sort_order: 2 },
    ];

    const staffIds: string[] = [];
    for (const s of staffData) {
      const { rows: [existing] } = await client.query(
        'SELECT id FROM staff WHERE shop_id = $1 AND name = $2',
        [shopId, s.name]
      );
      if (existing) {
        staffIds.push(existing.id);
        continue;
      }
      const { rows: [row] } = await client.query(`
        INSERT INTO staff (shop_id, name, bio, photo_url, sort_order)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [shopId, s.name, s.bio, s.photo_url, s.sort_order]);
      staffIds.push(row.id);
    }
    const [marcusId, jinId, devonId] = staffIds;

    // Services
    const servicesData = [
      { name: 'Classic Cut', description: 'Scissors or clippers — a timeless cut tailored to you.', duration_min: 45, price_cents: 3500, deposit_cents: 1000, category: 'cuts', sort_order: 0 },
      { name: 'Fade + Style', description: 'High, mid, or low fade with your choice of style on top.', duration_min: 60, price_cents: 4500, deposit_cents: 1500, category: 'cuts', sort_order: 1 },
      { name: 'Beard Trim', description: 'Shape, edge, and define your beard to perfection.', duration_min: 20, price_cents: 2000, deposit_cents: 500, category: 'beard', sort_order: 2 },
      { name: 'Hot Towel Shave', description: 'Traditional straight-razor shave with hot towel treatment.', duration_min: 45, price_cents: 5000, deposit_cents: 1500, category: 'beard', sort_order: 3 },
      { name: 'Cut + Beard Combo', description: 'Full cut and beard treatment — the complete package.', duration_min: 75, price_cents: 6000, deposit_cents: 2000, category: 'combo', sort_order: 4 },
      { name: "Kids Cut (under 12)", description: 'Patient, fun haircuts for the little ones.', duration_min: 30, price_cents: 2500, deposit_cents: 1000, category: 'cuts', sort_order: 5 },
      { name: 'Color Service', description: 'Full color, highlights, or toning. Consultation included.', duration_min: 90, price_cents: 12000, deposit_cents: 4000, category: 'color', sort_order: 6 },
      { name: 'Buzz Cut', description: 'Quick, clean, all-one-length buzz. No fuss.', duration_min: 15, price_cents: 1500, deposit_cents: 500, category: 'cuts', sort_order: 7 },
    ];

    const serviceIds: string[] = [];
    for (const svc of servicesData) {
      const { rows: [existing] } = await client.query(
        'SELECT id FROM services WHERE shop_id = $1 AND name = $2',
        [shopId, svc.name]
      );
      if (existing) {
        serviceIds.push(existing.id);
        continue;
      }
      const { rows: [row] } = await client.query(`
        INSERT INTO services (shop_id, name, description, duration_min, price_cents, deposit_cents, category, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
      `, [shopId, svc.name, svc.description, svc.duration_min, svc.price_cents, svc.deposit_cents, svc.category, svc.sort_order]);
      serviceIds.push(row.id);
    }

    const [classicCutId, fadePlusStyleId, beardTrimId, hotTowelId, combId, kidsId, colorId, buzzId] = serviceIds;

    // Staff-service assignments
    const assignments = [
      // Marcus: cuts, fades, combo, kids, buzz (no color, limited beard)
      [marcusId, classicCutId], [marcusId, fadePlusStyleId], [marcusId, beardTrimId],
      [marcusId, combId], [marcusId, kidsId], [marcusId, buzzId],
      // Jin: beard specialist, hot towel, cuts, combo
      [jinId, classicCutId], [jinId, beardTrimId], [jinId, hotTowelId],
      [jinId, combId], [jinId, buzzId],
      // Devon: all services
      [devonId, classicCutId], [devonId, fadePlusStyleId], [devonId, beardTrimId],
      [devonId, hotTowelId], [devonId, combId], [devonId, kidsId],
      [devonId, colorId], [devonId, buzzId],
    ];

    for (const [staffId, serviceId] of assignments) {
      await client.query(`
        INSERT INTO staff_services (staff_id, service_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [staffId, serviceId]);
    }

    // Availability rules: Mon–Sat per staff
    // day_of_week: 0=Sun, 1=Mon, ..., 6=Sat
    const workDays = [1, 2, 3, 4, 5]; // Mon-Fri
    const satDay = [6];

    for (const staffId of staffIds) {
      for (const day of workDays) {
        await client.query(`
          INSERT INTO availability_rules (staff_id, day_of_week, start_time, end_time)
          VALUES ($1, $2, '10:00', '19:00')
          ON CONFLICT DO NOTHING
        `, [staffId, day]);
      }
      await client.query(`
        INSERT INTO availability_rules (staff_id, day_of_week, start_time, end_time)
        VALUES ($1, 6, '09:00', '17:00')
        ON CONFLICT DO NOTHING
      `, [staffId]);
    }

    // Lunch blocks: add time_blocks for next 14 days, 1pm-2pm per barber
    const now = DateTime.now().setZone('America/New_York');
    for (let daysAhead = 0; daysAhead < 14; daysAhead++) {
      const day = now.plus({ days: daysAhead });
      if (day.weekday === 7) continue; // skip Sunday
      const lunchStart = day.set({ hour: 13, minute: 0, second: 0, millisecond: 0 }).toUTC().toISO()!;
      const lunchEnd = day.set({ hour: 14, minute: 0, second: 0, millisecond: 0 }).toUTC().toISO()!;
      for (const staffId of staffIds) {
        await client.query(`
          INSERT INTO time_blocks (staff_id, starts_at, ends_at, reason)
          VALUES ($1, $2, $3, 'Lunch break')
          ON CONFLICT DO NOTHING
        `, [staffId, lunchStart, lunchEnd]);
      }
    }

    // Pre-seeded bookings — 20 spread over next 7 days
    const customers = [
      { name: 'James Wilson', email: 'james@example.com', phone: '(917) 555-0101' },
      { name: 'Carlos Rivera', email: 'carlos@example.com', phone: '(929) 555-0102' },
      { name: 'Noah Thompson', email: 'noah@example.com', phone: '(646) 555-0103' },
      { name: 'Ethan Brown', email: 'ethan@example.com', phone: '(718) 555-0104' },
      { name: 'Liam Davis', email: 'liam@example.com', phone: '(917) 555-0105' },
      { name: 'Alex Chen', email: 'alex@example.com', phone: '(212) 555-0106' },
      { name: 'Michael Scott', email: 'michael@example.com', phone: '(646) 555-0107' },
      { name: 'Ryan Adams', email: 'ryan@example.com', phone: '(929) 555-0108' },
    ];

    // Slot schedule: (daysAhead, hour, minute, staffIndex, serviceIndex)
    const bookingSlots = [
      [0, 10, 0, 0, 0, 'confirmed'],
      [0, 11, 0, 0, 1, 'confirmed'],
      [0, 10, 0, 1, 2, 'confirmed'],
      [0, 10, 30, 2, 7, 'confirmed'],
      [0, 12, 0, 2, 4, 'completed'],
      [1, 10, 0, 0, 0, 'confirmed'],
      [1, 11, 0, 1, 3, 'confirmed'],
      [1, 10, 0, 2, 6, 'confirmed'],
      [1, 14, 0, 0, 7, 'confirmed'],
      [2, 10, 0, 0, 1, 'confirmed'],
      [2, 10, 0, 1, 2, 'confirmed'],
      [2, 10, 0, 2, 0, 'confirmed'],
      [3, 10, 0, 0, 4, 'confirmed'],
      [3, 10, 0, 1, 0, 'confirmed'],
      [4, 10, 0, 2, 5, 'confirmed'],
      [4, 11, 0, 0, 0, 'confirmed'],
      [5, 9, 0, 0, 1, 'confirmed'],
      [5, 9, 0, 1, 7, 'confirmed'],
      [6, 10, 0, 0, 0, 'confirmed'],
      [6, 10, 0, 2, 3, 'confirmed'],
    ] as const;

    let customerIndex = 0;
    for (const [daysAhead, hour, minute, staffIdx, svcIdx, status] of bookingSlots) {
      const day = now.plus({ days: daysAhead });
      if (day.weekday === 7) continue; // skip Sunday
      const staffId = staffIds[staffIdx];
      const serviceId = serviceIds[svcIdx];
      const service = servicesData[svcIdx];
      const customer = customers[customerIndex % customers.length];
      customerIndex++;

      const startsAt = day.set({ hour, minute, second: 0, millisecond: 0 }).toUTC().toISO()!;
      const endsAt = day.set({ hour, minute, second: 0, millisecond: 0 })
        .plus({ minutes: service.duration_min }).toUTC().toISO()!;

      await client.query(`
        INSERT INTO bookings (shop_id, staff_id, service_id, starts_at, ends_at,
          customer_name, customer_email, customer_phone, status, deposit_paid_cents)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (staff_id, starts_at) DO NOTHING
      `, [shopId, staffId, serviceId, startsAt, endsAt,
          customer.name, customer.email, customer.phone, status, service.deposit_cents]);
    }

    await client.query('COMMIT');
    console.log('Seed complete ✓');
    console.log(`  Shop:  chop-barbers (id: ${shopId})`);
    console.log(`  Owner: owner@chopbarbers.com / chop-demo-2024`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await db.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
