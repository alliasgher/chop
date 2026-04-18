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

export function SplitDemo() {
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bookingFrameRef = useRef<HTMLIFrameElement>(null);

  // Fetch today's bookings for the right panel
  useEffect(() => {
    fetch(`${API_URL}/api/shops/${SHOP_SLUG}/bookings/today`)
      .then((r) => r.json())
      .then(({ bookings }) => setBookings(bookings ?? []))
      .catch(() => {});
  }, []);

  // WebSocket for live updates
  useEffect(() => {
    // First, get the shop ID
    fetch(`${API_URL}/api/shops/${SHOP_SLUG}`)
      .then((r) => r.json())
      .then(({ shop }) => {
        if (!shop) return;
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
      })
      .catch(() => {});

    return () => wsRef.current?.close();
  }, []);

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));

  return (
    <div className="max-w-7xl mx-auto px-6 pb-4">
      <div className="grid md:grid-cols-2 gap-4 h-[600px]">
        {/* Left — booking iframe */}
        <div className="rounded-2xl overflow-hidden border border-white/10 flex flex-col">
          <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-white/40 text-xs font-mono truncate">
              /book/chop-barbers
            </span>
          </div>
          <iframe
            ref={bookingFrameRef}
            src={`/book/${SHOP_SLUG}`}
            className="flex-1 w-full bg-white"
            title="Customer booking view"
          />
        </div>

        {/* Right — live dashboard */}
        <div className="rounded-2xl overflow-hidden border border-white/10 flex flex-col bg-[#1A1825]">
          <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-white/40 text-xs font-mono">Owner dashboard — Today</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-brand-teal animate-pulse' : 'bg-gray-500'}`} />
              <span className={connected ? 'text-brand-teal' : 'text-gray-500'}>
                {connected ? 'Live' : 'Connecting…'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white/30 text-sm">
                <p>No bookings today yet.</p>
                <p className="text-xs mt-1">Make a booking on the left to see it appear here.</p>
              </div>
            )}
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl p-4 border transition-all duration-500"
                style={{
                  backgroundColor: b.isNew ? '#22C9A815' : '#252232',
                  borderColor: b.isNew ? '#22C9A840' : '#2E2A3A',
                }}
              >
                {b.isNew && (
                  <div className="text-brand-teal text-xs font-semibold mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                    New booking!
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
        </div>
      </div>
    </div>
  );
}
