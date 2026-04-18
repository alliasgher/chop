import { DateTime } from 'luxon';
import { db } from '../db/client';

interface SlotParams {
  staffId: string;
  date: string; // YYYY-MM-DD in shop's timezone
  shopTimezone: string;
  durationMin: number;
}

export async function computeSlots({ staffId, date, shopTimezone, durationMin }: SlotParams): Promise<string[]> {
  const dt = DateTime.fromISO(date, { zone: shopTimezone });
  const dayOfWeek = dt.weekday % 7; // luxon: 1=Mon..7=Sun → convert to 0=Sun..6=Sat

  // 1. Load availability rules for this day
  const { rows: rules } = await db.query(
    `SELECT start_time, end_time FROM availability_rules
     WHERE staff_id = $1 AND day_of_week = $2`,
    [staffId, dayOfWeek]
  );
  if (rules.length === 0) return [];

  // 2. Build windows as UTC intervals
  type Interval = { start: DateTime; end: DateTime };
  let windows: Interval[] = rules.map(r => ({
    start: dt.set({ hour: parseInt(r.start_time.split(':')[0]), minute: parseInt(r.start_time.split(':')[1]), second: 0 }),
    end: dt.set({ hour: parseInt(r.end_time.split(':')[0]), minute: parseInt(r.end_time.split(':')[1]), second: 0 }),
  }));

  const dayStart = dt.startOf('day').toUTC();
  const dayEnd = dt.endOf('day').toUTC();

  // 3. Load time blocks for this day
  const { rows: blocks } = await db.query(
    `SELECT starts_at, ends_at FROM time_blocks
     WHERE staff_id = $1 AND starts_at < $2 AND ends_at > $3`,
    [staffId, dayEnd.toISO(), dayStart.toISO()]
  );

  // 4. Load existing bookings for this day
  const { rows: existing } = await db.query(
    `SELECT starts_at, ends_at FROM bookings
     WHERE staff_id = $1 AND starts_at < $2 AND ends_at > $3
       AND status NOT IN ('cancelled')`,
    [staffId, dayEnd.toISO(), dayStart.toISO()]
  );

  const busy: Interval[] = [
    ...blocks.map(b => ({ start: DateTime.fromJSDate(b.starts_at), end: DateTime.fromJSDate(b.ends_at) })),
    ...existing.map(b => ({ start: DateTime.fromJSDate(b.starts_at), end: DateTime.fromJSDate(b.ends_at) })),
  ];

  // 5. Subtract busy intervals from windows
  function subtract(windows: Interval[], busy: Interval): Interval[] {
    const result: Interval[] = [];
    for (const w of windows) {
      if (busy.end <= w.start || busy.start >= w.end) {
        result.push(w);
      } else {
        if (busy.start > w.start) result.push({ start: w.start, end: busy.start });
        if (busy.end < w.end) result.push({ start: busy.end, end: w.end });
      }
    }
    return result;
  }

  for (const b of busy) windows = subtract(windows, b);

  // 6. Slice into slots on 15-min grid
  const slots: string[] = [];
  const now = DateTime.now();
  const cutoff = now.plus({ minutes: 30 });

  for (const w of windows) {
    let cursor = w.start;
    // Snap to next 15-min boundary
    const mins = cursor.minute;
    const snap = Math.ceil(mins / 15) * 15;
    if (snap !== mins) cursor = cursor.set({ minute: snap, second: 0 });

    while (cursor.plus({ minutes: durationMin }) <= w.end) {
      // Only future slots (at least 30min out)
      if (cursor > cutoff) {
        slots.push(cursor.toUTC().toISO()!);
      }
      cursor = cursor.plus({ minutes: 15 });
    }
  }

  return slots;
}
