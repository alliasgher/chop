'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { getOwnerBookings, updateBookingStatus, getOwnerStaff } from '@/lib/api/owner';
import { formatDateTime, tzAbbreviation } from '@/lib/tz';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-brand-amber bg-brand-amber/10',
  confirmed: 'text-brand-teal bg-brand-teal/10',
  completed: 'text-gray-500 bg-gray-100',
  cancelled: 'text-red-500 bg-red-50',
  no_show: 'text-gray-400 bg-gray-50',
};

interface StaffMember { id: string; name: string; }

export default function BookingsPage() {
  const { token, shop } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const tz = shop?.timezone ?? 'America/New_York';

  const load = useCallback(async () => {
    if (!shop || !token) return;
    setLoading(true);
    try {
      const [bookingsRes, staffRes] = await Promise.all([
        getOwnerBookings(shop.id, token, { status: statusFilter === 'all' ? undefined : statusFilter }),
        getOwnerStaff(shop.id, token),
      ]);
      setBookings(bookingsRes.bookings);
      setStaff(staffRes.staff);
    } catch {}
    setLoading(false);
  }, [shop, token, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    if (!token) return;
    const res = await updateBookingStatus(id, status, token);
    setBookings((prev) => prev.map((b) => b.id === id ? res.booking : b));
  };

  const filtered = staffFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.staff_id === staffFilter);

  return (
    <div className="p-8">
      <div className="flex items-baseline justify-between flex-wrap gap-4 mb-6">
        <h1 className="font-heading text-3xl font-bold text-brand-ink">All Bookings</h1>
        <span className="text-xs text-brand-muted">Times in {tzAbbreviation(tz)}</span>
      </div>

      {/* Barber filter */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Barber</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStaffFilter('all')}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              backgroundColor: staffFilter === 'all' ? '#E8445A' : 'white',
              color: staffFilter === 'all' ? 'white' : '#7A736A',
              border: `1px solid ${staffFilter === 'all' ? '#E8445A' : '#E5DDD3'}`,
            }}
          >
            All barbers
          </button>
          {staff.map((s) => {
            const count = bookings.filter((b) => b.staff_id === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setStaffFilter(s.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2"
                style={{
                  backgroundColor: staffFilter === s.id ? '#E8445A' : 'white',
                  color: staffFilter === s.id ? 'white' : '#7A736A',
                  border: `1px solid ${staffFilter === s.id ? '#E8445A' : '#E5DDD3'}`,
                }}
              >
                {s.name}
                <span className="text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status filter */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Status</p>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                backgroundColor: statusFilter === s ? '#1A1825' : 'white',
                color: statusFilter === s ? 'white' : '#7A736A',
                border: `1px solid ${statusFilter === s ? '#1A1825' : '#E5DDD3'}`,
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
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
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-brand-muted">No bookings found</td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="border-b border-brand-border/50 hover:bg-brand-surface/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-brand-ink whitespace-nowrap">
                    {formatDateTime(b.starts_at, tz)}
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
