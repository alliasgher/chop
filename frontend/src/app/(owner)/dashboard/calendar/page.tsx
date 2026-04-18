'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { getOwnerBookings } from '@/lib/api/owner';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am–7pm

export default function CalendarPage() {
  const { token, shop } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!shop || !token) return;
    getOwnerBookings(shop.id, token).then((r) => setBookings(r.bookings)).catch(() => {});
  }, [shop, token]);

  const bookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.starts_at), day));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold text-brand-ink">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekStart((w) => addDays(w, -7))} className="p-2 rounded-lg border border-brand-border hover:bg-brand-surface transition-colors text-brand-ink">
            ←
          </button>
          <span className="text-sm font-medium text-brand-ink">
            {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button onClick={() => setWeekStart((w) => addDays(w, 7))} className="p-2 rounded-lg border border-brand-border hover:bg-brand-surface transition-colors text-brand-ink">
            →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-brand-border">
          <div className="p-3" />
          {days.map((day) => (
            <div key={day.toISOString()} className={`p-3 text-center border-l border-brand-border ${isSameDay(day, new Date()) ? 'bg-brand-red/5' : ''}`}>
              <div className="text-xs font-semibold text-brand-muted uppercase">{format(day, 'EEE')}</div>
              <div className={`text-lg font-heading font-bold mt-0.5 ${isSameDay(day, new Date()) ? 'text-brand-red' : 'text-brand-ink'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[500px]">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-brand-border/50 min-h-[60px]">
              <div className="p-2 text-right text-xs text-brand-muted font-medium pr-3 pt-2">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
              {days.map((day) => {
                const slotBookings = bookingsForDay(day).filter((b) => {
                  const h = new Date(b.starts_at).getHours();
                  return h === hour;
                });
                return (
                  <div key={day.toISOString()} className={`border-l border-brand-border/50 p-1 ${isSameDay(day, new Date()) ? 'bg-brand-red/3' : ''}`}>
                    {slotBookings.map((b) => (
                      <div key={b.id} className="rounded-lg bg-brand-teal/10 border border-brand-teal/20 p-1.5 text-xs mb-1">
                        <div className="font-semibold text-brand-teal truncate">{b.customer_name}</div>
                        <div className="text-brand-muted truncate">{b.service_name}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
