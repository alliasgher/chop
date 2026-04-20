'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { getOwnerBookings, updateBookingStatus } from '@/lib/api/owner';
import { format } from 'date-fns';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-brand-amber bg-brand-amber/10',
  confirmed: 'text-brand-teal bg-brand-teal/10',
  completed: 'text-gray-500 bg-gray-100',
  cancelled: 'text-red-500 bg-red-50',
  no_show: 'text-gray-400 bg-gray-50',
};

export default function BookingsPage() {
  const { token, shop } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!shop || !token) return;
    setLoading(true);
    try {
      const res = await getOwnerBookings(shop.id, token, { status: filter === 'all' ? undefined : filter });
      setBookings(res.bookings);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [shop, token, filter]);

  const changeStatus = async (id: string, status: string) => {
    if (!token) return;
    const res = await updateBookingStatus(id, status, token);
    setBookings((prev) => prev.map((b) => b.id === id ? res.booking : b));
  };

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-brand-ink mb-6">All Bookings</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={{
              backgroundColor: filter === s ? '#1A1825' : 'white',
              color: filter === s ? 'white' : '#7A736A',
              border: `1px solid ${filter === s ? '#1A1825' : '#E5DDD3'}`,
            }}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Time', 'Customer', 'Service', 'Barber', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-brand-muted">Loading…</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-brand-muted">No bookings found</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-brand-border/50 hover:bg-brand-surface/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-brand-ink whitespace-nowrap">
                    {format(new Date(b.starts_at), 'MMM d, h:mma')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-brand-ink">{b.customer_name}</div>
                    <div className="text-brand-muted text-xs">{b.customer_email}</div>
                  </td>
                  <td className="px-5 py-4 text-brand-ink">{b.service_name}</td>
                  <td className="px-5 py-4 text-brand-ink">{b.staff_name}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[b.status] ?? ''}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      {b.status === 'pending' && (
                        <button onClick={() => changeStatus(b.id, 'confirmed')} className="text-xs px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal font-medium hover:bg-brand-teal/20">Confirm</button>
                      )}
                      {b.status === 'confirmed' && (
                        <>
                          <button onClick={() => changeStatus(b.id, 'completed')} className="text-xs px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal font-medium hover:bg-brand-teal/20">Done</button>
                          <button onClick={() => changeStatus(b.id, 'no_show')} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 font-medium hover:bg-gray-200">No show</button>
                        </>
                      )}
                      {!['completed', 'cancelled'].includes(b.status) && (
                        <button onClick={() => changeStatus(b.id, 'cancelled')} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-500 font-medium hover:bg-red-100">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
