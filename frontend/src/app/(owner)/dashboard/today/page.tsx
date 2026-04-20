'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { getOwnerBookings, updateBookingStatus } from '@/lib/api/owner';
import { format, isSameDay, addDays, startOfDay } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20',
  confirmed: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
  no_show: 'bg-gray-100 text-gray-400 border-gray-200',
};

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  starts_at: string;
  duration_min: number;
  status: string;
  service_name: string;
  staff_name: string;
}

function BookingRow({ b, onStatus }: { b: Booking; onStatus: (id: string, status: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border p-5 flex items-center gap-5 hover:shadow-sm transition-shadow">
      <div className="text-center w-16 shrink-0">
        <div className="font-heading text-xl font-bold text-brand-ink">
          {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(b.starts_at))}
        </div>
        <div className="text-xs text-brand-muted">{b.duration_min ?? '—'} min</div>
      </div>
      <div className="w-px h-12 bg-brand-border shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-brand-ink text-sm">{b.customer_name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[b.status] ?? ''}`}>
            {b.status}
          </span>
        </div>
        <p className="text-brand-muted text-xs">{b.service_name} · {b.staff_name}</p>
        {b.customer_phone && <p className="text-brand-muted text-xs mt-0.5">{b.customer_phone}</p>}
      </div>
      <div className="flex gap-2 shrink-0 flex-wrap justify-end">
        {b.status === 'pending' && (
          <button onClick={() => onStatus(b.id, 'confirmed')} className="text-xs px-3 py-1.5 rounded-lg bg-brand-amber/10 text-brand-amber font-medium hover:bg-brand-amber/20 transition-colors">Confirm</button>
        )}
        {b.status === 'confirmed' && (
          <>
            <button onClick={() => onStatus(b.id, 'completed')} className="text-xs px-3 py-1.5 rounded-lg bg-brand-teal/10 text-brand-teal font-medium hover:bg-brand-teal/20 transition-colors">Complete</button>
            <button onClick={() => onStatus(b.id, 'no_show')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors">No show</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { token, shop } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!shop || !token) return;
    try {
      const from = startOfDay(new Date()).toISOString();
      const to = addDays(startOfDay(new Date()), 8).toISOString();
      const res = await getOwnerBookings(shop.id, token, { from, to });
      setBookings(res.bookings);
    } catch {}
    setLoading(false);
  }, [shop, token]);

  useEffect(() => { load(); }, [load]);

  // WebSocket: listen for new / updated bookings
  useEffect(() => {
    if (!shop) return;
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/shop/${shop.id}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data);
      if (event.type === 'booking.created') {
        setBookings((prev) => [event.booking, ...prev]);
      }
      if (event.type === 'booking.updated') {
        setBookings((prev) => prev.map((b) => b.id === event.booking.id ? event.booking : b));
      }
    };
    return () => ws.close();
  }, [shop]);

  const changeStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      const res = await updateBookingStatus(id, status, token);
      setBookings((prev) => prev.map((b) => b.id === id ? res.booking : b));
    } catch {}
  };

  const today = new Date();
  const todayBookings = bookings
    .filter((b) => isSameDay(new Date(b.starts_at), today))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  // Group upcoming bookings (next 7 days, excluding today) by date
  const upcomingByDay: { date: Date; bookings: Booking[] }[] = [];
  for (let i = 1; i <= 7; i++) {
    const day = addDays(today, i);
    const dayBookings = bookings
      .filter((b) => isSameDay(new Date(b.starts_at), day))
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    if (dayBookings.length > 0) upcomingByDay.push({ date: day, bookings: dayBookings });
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-ink">Today</h1>
          <p className="text-brand-muted text-sm mt-1">{format(today, 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-teal bg-brand-teal/10 px-3 py-1.5 rounded-full border border-brand-teal/20">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
          Live updates on
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl border border-brand-border animate-pulse" />)}
        </div>
      )}

      {!loading && (
        <>
          {/* Today section */}
          {todayBookings.length === 0 ? (
            <div className="text-center py-10 text-brand-muted bg-white rounded-2xl border border-brand-border">
              <p className="text-3xl mb-2">✂️</p>
              <p className="font-semibold">No bookings today</p>
              <p className="text-xs mt-1">Upcoming bookings are listed below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((b) => <BookingRow key={b.id} b={b} onStatus={changeStatus} />)}
            </div>
          )}

          {/* Upcoming section */}
          {upcomingByDay.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading text-xl font-semibold text-brand-ink mb-1">Coming up</h2>
              <p className="text-brand-muted text-sm mb-6">Next 7 days</p>
              <div className="space-y-8">
                {upcomingByDay.map(({ date, bookings }) => (
                  <div key={date.toISOString()}>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-heading text-base font-semibold text-brand-ink">{format(date, 'EEEE')}</span>
                      <span className="text-brand-muted text-sm">{format(date, 'MMM d')}</span>
                      <span className="text-xs text-brand-muted">· {bookings.length} booking{bookings.length === 1 ? '' : 's'}</span>
                    </div>
                    <div className="space-y-3">
                      {bookings.map((b) => <BookingRow key={b.id} b={b} onStatus={changeStatus} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingByDay.length === 0 && todayBookings.length > 0 && (
            <p className="text-brand-muted text-sm mt-12 text-center">No bookings in the next 7 days.</p>
          )}
        </>
      )}
    </div>
  );
}
