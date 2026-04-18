'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api/shops';

interface Props {
  shopSlug: string;
  staffId: string;
  serviceId: string;
  startsAt: string;
  shopColors: { primary: string; accent: string; background: string };
}

export function DetailsForm({ shopSlug, staffId, serviceId, startsAt, shopColors }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);
    setError('');
    try {
      const res = await createBooking(shopSlug, {
        staffId,
        serviceId,
        startsAt,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone || undefined,
        notes: form.notes || undefined,
      }) as { booking: { id: string } };
      router.push(`/book/${shopSlug}/confirmation/${res.booking.id}`);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderColor: `${shopColors.primary}20`,
    color: shopColors.primary,
  };

  const labelStyle = { color: `${shopColors.primary}70` };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Full name *</label>
        <input
          required
          value={form.name}
          onChange={set('name')}
          placeholder="James Wilson"
          className="w-full bg-white border-2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
          style={{ ...inputStyle, '--tw-ring-color': `${shopColors.accent}40` } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Email *</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="james@example.com"
          className="w-full bg-white border-2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Phone (optional)</label>
        <input
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="(917) 555-0100"
          className="w-full bg-white border-2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          placeholder="Anything we should know?"
          rows={3}
          className="w-full bg-white border-2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all resize-none"
          style={inputStyle}
        />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: shopColors.accent }}
      >
        {loading ? 'Confirming...' : 'Confirm booking →'}
      </button>
    </form>
  );
}
