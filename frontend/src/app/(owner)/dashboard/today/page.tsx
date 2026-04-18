'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { getOwnerBookings, updateBookingStatus } from '@/lib/api/owner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20',
  confirmed: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
  no_show: 'bg-gray-100 text-gray-400 border-gray-200',
};

export default function TodayPage() {
  const { token, shop } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  const load = async () => {
    if (!shop || !token) return;
    try {
      const res = await getOwnerBookings(shop.id, token, today);
      setBookings(res.bookings);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [shop, token]);

  // WebSocket: listen for new bookings
  useEffect(() => {
    if (!shop) return;
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/shop/${shop.id}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data);
      if (event.type === 'booking.created') {
        const b = event.booking;
        const bookingDate = format(new Date(b.starts_at), 'yyyy-MM-dd');
        if (bookingDate === today) {
          setBookings((prev) => [b, ...prev]);
        }
      }
      if (event.type === 'booking.updated') {
        setBookings((prev) =>
          prev.map((b) => b.id === event.booking.id ? event.booking : b)
        );
      }
    };
    return () => ws.close();
  }, [shop, today]);

  const changeStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      const res = await updateBookingStatus(id, status, token);
      setBookings((prev) => prev.map((b) => b.id === id ? res.booking : b));
    } catch {}
  };

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-ink">Today</h1>
          <p className="text-brand-muted text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-teal bg-brand-teal/10 px-3 py-1.5 rounded-full border border-brand-teal/20">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
          Live updates on
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-brand-border animate-pulse" />
          ))}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="text-center py-20 text-brand-muted">
          <p className="text-4xl mb-3">✂️</p>
          <p className="font-semibold">No bookings today</p>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-brand-border p-5 flex items-center gap-5 hover:shadow-sm transition-shadow"
            >
              {/* Time */}
              <div className="text-center w-16 shrink-0">
                <div className="font-heading text-xl font-bold text-brand-ink">
                  {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(b.starts_at))}
                </div>
                <div className="text-xs text-brand-muted">{b.duration_min ?? '—'} min</div>
              </div>

              <div className="w-px h-12 bg-brand-border shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-brand-ink text-sm">{b.customer_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[b.status] ?? ''}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-brand-muted text-xs">{b.service_name} · {b.staff_name}</p>
                {b.customer_phone && (
                  <p className="text-brand-muted text-xs mt-0.5">{b.customer_phone}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {b.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => changeStatus(b.id, 'completed')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-brand-teal/10 text-brand-teal font-medium hover:bg-brand-teal/20 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => changeStatus(b.id, 'no_show')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors"
                    >
                      No show
                    </button>
                  </>
                )}
                {b.status === 'pending' && (
                  <button
                    onClick={() => changeStatus(b.id, 'confirmed')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand-amber/10 text-brand-amber font-medium hover:bg-brand-amber/20 transition-colors"
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
