'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiFetch } from '@/lib/api/client';

interface Service {
  id: string; name: string; description: string; duration_min: number;
  price_cents: number; deposit_cents: number; category: string; is_active: boolean;
}

export default function ServicesPage() {
  const { token, shop } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', duration_min: 30, price_cents: 0, deposit_cents: 0, category: 'cuts' });

  const load = async () => {
    if (!shop || !token) return;
    const res = await apiFetch<{ services: Service[] }>(`/api/owner/shops/${shop.id}/services`, { token });
    setServices(res.services);
    setLoading(false);
  };

  useEffect(() => { load(); }, [shop, token]);

  const save = async () => {
    if (!shop || !token) return;
    if (editing === 'new') {
      const res = await apiFetch<{ service: Service }>(`/api/owner/shops/${shop.id}/services`, {
        method: 'POST', token, body: form,
      });
      setServices((p) => [...p, res.service]);
    } else if (editing) {
      const res = await apiFetch<{ service: Service }>(`/api/owner/services/${editing}`, {
        method: 'PATCH', token, body: form,
      });
      setServices((p) => p.map((s) => s.id === editing ? res.service : s));
    }
    setEditing(null);
  };

  const toggle = async (id: string, is_active: boolean) => {
    if (!token) return;
    const res = await apiFetch<{ service: Service }>(`/api/owner/services/${id}`, {
      method: 'PATCH', token, body: { is_active },
    });
    setServices((p) => p.map((s) => s.id === id ? res.service : s));
  };

  const startEdit = (svc: Service) => {
    setForm({ name: svc.name, description: svc.description ?? '', duration_min: svc.duration_min, price_cents: svc.price_cents, deposit_cents: svc.deposit_cents, category: svc.category ?? 'cuts' });
    setEditing(svc.id);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-ink">Services</h1>
        <button
          onClick={() => { setForm({ name: '', description: '', duration_min: 30, price_cents: 0, deposit_cents: 0, category: 'cuts' }); setEditing('new'); }}
          className="bg-brand-ink text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-ink/80 transition-colors"
        >
          + Add service
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border border-brand-border p-6 mb-6">
          <h2 className="font-heading font-semibold text-brand-ink mb-4">{editing === 'new' ? 'New service' : 'Edit service'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Duration (min)', key: 'duration_min', type: 'number' },
              { label: 'Price (cents)', key: 'price_cents', type: 'number' },
              { label: 'Deposit (cents)', key: 'deposit_cents', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-brand-muted mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? +e.target.value : e.target.value }))}
                  className="w-full border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink outline-none"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="bg-brand-teal text-white px-4 py-2 rounded-xl text-sm font-semibold">Save</button>
            <button onClick={() => setEditing(null)} className="border border-brand-border text-brand-muted px-4 py-2 rounded-xl text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Name', 'Duration', 'Price', 'Deposit', 'Active', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-brand-muted">Loading…</td></tr>
            ) : services.map((svc) => (
              <tr key={svc.id} className="border-b border-brand-border/50 hover:bg-brand-surface/30">
                <td className="px-5 py-4">
                  <div className="font-medium text-brand-ink">{svc.name}</div>
                  <div className="text-brand-muted text-xs capitalize">{svc.category}</div>
                </td>
                <td className="px-5 py-4 text-brand-ink">{svc.duration_min} min</td>
                <td className="px-5 py-4 font-medium text-brand-ink">${(svc.price_cents / 100).toFixed(2)}</td>
                <td className="px-5 py-4 text-brand-muted">${(svc.deposit_cents / 100).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggle(svc.id, !svc.is_active)}
                    className={`w-10 h-6 rounded-full transition-colors ${svc.is_active ? 'bg-brand-teal' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${svc.is_active ? 'translate-x-4' : ''}`} />
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => startEdit(svc)} className="text-xs text-brand-violet font-medium hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
