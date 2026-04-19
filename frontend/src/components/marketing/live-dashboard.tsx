'use client';

import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';
const SHOP_SLUG = 'chop-barbers';

interface LiveBooking {
  id: string;
  customer_name: string;
  service_name: string;
  staff_name: string;
  starts_at: string;
  status: string;
  isNew?: boolean;
}

export function LiveDashboard() {
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const shopRes = await fetch(`${API_URL}/api/shops/${SHOP_SLUG}`);
        if (!shopRes.ok) return;
        const { shop } = await shopRes.json();
        if (!shop || cancelled) return;

        const bookRes = await fetch(`${API_URL}/api/shops/${SHOP_SLUG}/bookings/today`);
        if (bookRes.ok && !cancelled) {
          const { bookings } = await bookRes.json();
          setBookings(bookings ?? []);
        }

        const ws = new WebSocket(`${WS_URL}/ws/shop/${shop.id}`);
        wsRef.current = ws;
        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onmessage = (e) => {
          const event = JSON.parse(e.data);
          if (event.type === 'booking.created') {
            const b = event.booking;
            const bookingDate = b.starts_at?.slice(0, 10);
            const today = new Date().toISOString().slice(0, 10);
            if (bookingDate === today) {
              setBookings((prev) => [{ ...b, isNew: true }, ...prev]);
              setTimeout(() => {
                setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, isNew: false } : bk));
              }, 3000);
            }
          }
          if (event.type === 'booking.updated') {
            setBookings((prev) => prev.map((b) => b.id === event.booking.id ? event.booking : b));
          }
        };
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, []);

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));

  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1A1825] shadow-xl">
      {/* Terminal-like header */}
      <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-white/50 text-sm font-medium">Chop Barbers — Today, {todayLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-brand-teal animate-pulse' : 'bg-yellow-500'}`} />
          <span className={connected ? 'text-brand-teal' : 'text-yellow-500'}>
            {connected ? 'Live · WebSocket connected' : 'Connecting…'}
          </span>
        </div>
      </div>

      {/* Booking list */}
      <div className="p-6 min-h-[320px]">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[260px] text-white/30 text-center">
            <p className="text-3xl mb-3">✂️</p>
            <p className="text-sm font-medium mb-1">No bookings today yet.</p>
            <p className="text-xs">Open the booking page in another tab and make one — watch it appear here.</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl p-4 border transition-all duration-500"
                style={{
                  backgroundColor: b.isNew ? 'rgba(34,201,168,0.08)' : '#252232',
                  borderColor: b.isNew ? 'rgba(34,201,168,0.4)' : '#2E2A3A',
                }}
              >
                {b.isNew && (
                  <div className="text-brand-teal text-xs font-semibold mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                    Just booked!
                  </div>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm">{b.customer_name}</span>
                  <span className="text-white/40 text-xs">{b.starts_at ? formatTime(b.starts_at) : ''}</span>
                </div>
                <p className="text-white/50 text-xs">{b.service_name} · {b.staff_name}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium capitalize
                  ${b.status === 'confirmed' ? 'bg-brand-teal/10 text-brand-teal' :
                    b.status === 'pending' ? 'bg-brand-amber/10 text-brand-amber' :
                    'bg-white/5 text-white/30'}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
