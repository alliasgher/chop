'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiFetch } from '@/lib/api/client';

export default function SettingsPage() {
  const { token, shop, setShop } = useAuthStore();
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!shop || !token) return;
    apiFetch<{ shop: any }>(`/api/owner/shops/${shop.id}`, { token })
      .then(({ shop: s }) => {
        setForm({ name: s.name, description: s.description ?? '', phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '' });
        setLoading(false);
      });
  }, [shop, token]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!shop || !token) return;
    setSaving(true);
    const { shop: updated } = await apiFetch<{ shop: any }>(`/api/owner/shops/${shop.id}`, {
      method: 'PATCH', token, body: form,
    });
    setShop({ id: updated.id, slug: updated.slug, name: updated.name });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = 'w-full border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-teal transition-colors bg-white';

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-brand-ink mb-8">Settings</h1>

      {loading ? <p className="text-brand-muted text-sm">Loading…</p> : (
        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-5">
          <h2 className="font-heading font-semibold text-brand-ink">Shop details</h2>

          {[
            { label: 'Shop name', key: 'name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Address', key: 'address', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={set(key as any)} className={inputCls} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving} className="bg-brand-ink text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-ink/80 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="text-brand-teal text-sm font-medium">Saved ✓</span>}
          </div>
        </div>
      )}

      {/* Public link */}
      {shop && (
        <div className="mt-6 bg-brand-violet/5 border border-brand-violet/20 rounded-2xl p-5">
          <h3 className="font-semibold text-brand-ink text-sm mb-2">Your booking link</h3>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-brand-violet text-sm font-mono bg-white px-3 py-2 rounded-lg border border-brand-border truncate">
              /book/{shop.slug}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${shop.slug}`)}
              className="text-xs font-semibold text-brand-violet bg-brand-violet/10 px-3 py-2 rounded-lg hover:bg-brand-violet/20 transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
