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
  const [iframeLoaded, setIframeLoaded] = useState(false);
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
            setBookings((prev) => [{ ...b, isNew: true }, ...prev].slice(0, 30));
            setTimeout(() => {
              setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, isNew: false } : bk));
            }, 3000);
          }
          if (event.type === 'booking.updated') {
            setBookings((prev) => prev.map((b) => b.id === event.booking.id ? event.booking : b));
          }
        };
      } catch {}
    }

    init();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, []);

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
    return `${dateStr} · ${timeStr}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* LEFT — booking flow iframe */}
      <div className="rounded-2xl overflow-hidden border border-white/10 flex flex-col bg-white relative h-[600px]">
        <div className="bg-[#1A1825] border-b border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-white/50 text-xs font-mono truncate">/book/chop-barbers — customer view</span>
        </div>

        {!iframeLoaded && (
          <div className="absolute inset-0 top-[45px] flex items-center justify-center bg-[#FAF7F2] z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin mx-auto mb-3" />
              <p className="text-brand-muted text-xs">Loading booking page…</p>
            </div>
          </div>
        )}

        <iframe
          src={`/book/${SHOP_SLUG}`}
          className="flex-1 w-full border-0"
          title="Customer booking view"
          onLoad={() => setIframeLoaded(true)}
        />
      </div>

      {/* RIGHT — live dashboard */}
      <div className="rounded-2xl overflow-hidden border border-white/10 flex flex-col bg-[#1A1825] h-[600px]">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-white/50 text-xs font-mono truncate">owner dashboard — live</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-brand-teal animate-pulse' : 'bg-yellow-500'}`} />
            <span className={connected ? 'text-brand-teal' : 'text-yellow-500'}>
              {connected ? 'Live' : 'Connecting…'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/30 text-center px-4">
              <p className="text-2xl mb-2">✂️</p>
              <p className="text-sm font-medium mb-1">No bookings yet.</p>
              <p className="text-xs">Make a booking on the left — it&apos;ll appear here.</p>
            </div>
          )}
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl p-3 border transition-all duration-500"
              style={{
                backgroundColor: b.isNew ? 'rgba(34,201,168,0.08)' : '#252232',
                borderColor: b.isNew ? 'rgba(34,201,168,0.4)' : '#2E2A3A',
              }}
            >
              {b.isNew && (
                <div className="text-brand-teal text-xs font-semibold mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                  Just booked!
                </div>
              )}
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-semibold text-white text-sm truncate">{b.customer_name}</span>
                <span className="text-white/40 text-xs whitespace-nowrap">{b.starts_at ? formatWhen(b.starts_at) : ''}</span>
              </div>
              <p className="text-white/50 text-xs truncate">{b.service_name} · {b.staff_name}</p>
              <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium capitalize
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
  );
}
