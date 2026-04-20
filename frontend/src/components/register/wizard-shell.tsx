'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { apiFetch } from '@/lib/api/client';

interface WizardData {
  name: string;
  email: string;
  password: string;
  shopName: string;
  shopSlug: string;
  timezone: string;
  primaryColor: string;
  accentColor: string;
}

const STEPS = ['Account', 'Your shop', 'Look & feel', 'Done!'];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'Europe/London', 'Europe/Paris', 'Australia/Sydney',
];

const ACCENT_PRESETS = ['#D4A574', '#E8445A', '#22C9A8', '#8B5CF6', '#F59C20', '#3B82F6'];

export function WizardShell() {
  const router = useRouter();
  const { setAuth, setShop } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<WizardData>({
    name: '', email: '', password: '',
    shopName: '', shopSlug: '',
    timezone: 'America/New_York',
    primaryColor: '#1A1A1A', accentColor: '#D4A574',
  });

  const set = (k: keyof WizardData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setData((d) => ({
      ...d,
      [k]: val,
      ...(k === 'shopName' ? { shopSlug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}),
    }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Register user
      const { user, token } = await apiFetch<{ user: any; token: string }>('/api/auth/register', {
        method: 'POST',
        body: { email: data.email, password: data.password, name: data.name },
      });

      // 2. Create shop
      const { shop } = await apiFetch<{ shop: any }>('/api/owner/shops', {
        method: 'POST',
        token,
        body: {
          slug: data.shopSlug || data.shopName.toLowerCase().replace(/\s+/g, '-'),
          name: data.shopName,
          timezone: data.timezone,
          colors: { primary: data.primaryColor, accent: data.accentColor, background: '#FAFAFA' },
          fonts: { heading: 'Montserrat', body: 'Inter' },
          is_demo: false,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      setAuth(user, token);
      setShop({ id: shop.id, slug: shop.slug, name: shop.name, timezone: shop.timezone });
      next();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-brand-teal transition-colors';
  const labelCls = 'block text-xs font-medium text-white/50 mb-1.5';

  return (
    <div className="w-full max-w-md">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-brand-teal text-white' :
              i === step ? 'bg-white text-brand-ink' :
              'bg-white/10 text-white/30'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 transition-all ${i < step ? 'bg-brand-teal' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        {/* Step 0 — Account */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-white/40 text-sm mb-6">Takes 60 seconds. No card required.</p>
            <div><label className={labelCls}>Your name</label><input value={data.name} onChange={set('name')} placeholder="Marcus Johnson" className={inputCls} /></div>
            <div><label className={labelCls}>Email</label><input type="email" value={data.email} onChange={set('email')} placeholder="marcus@example.com" className={inputCls} /></div>
            <div><label className={labelCls}>Password</label><input type="password" value={data.password} onChange={set('password')} placeholder="••••••••" className={inputCls} /></div>
            <button onClick={next} disabled={!data.name || !data.email || !data.password} className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold text-sm hover:bg-brand-red/90 transition-colors disabled:opacity-40">
              Continue →
            </button>
          </div>
        )}

        {/* Step 1 — Shop details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Your shop</h2>
            <p className="text-white/40 text-sm mb-6">This becomes your public booking URL.</p>
            <div><label className={labelCls}>Shop name</label><input value={data.shopName} onChange={set('shopName')} placeholder="Marcus Cuts" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Booking URL slug</label>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs shrink-0">/book/</span>
                <input value={data.shopSlug} onChange={set('shopSlug')} placeholder="marcus-cuts" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Timezone</label>
              <select value={data.timezone} onChange={set('timezone')} className={inputCls}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 font-semibold text-sm hover:border-white/30 transition-colors">Back</button>
              <button onClick={next} disabled={!data.shopName} className="flex-1 py-3 rounded-xl bg-brand-red text-white font-semibold text-sm hover:bg-brand-red/90 transition-colors disabled:opacity-40">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Look & feel */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Look & feel</h2>
            <p className="text-white/40 text-sm mb-6">Pick your brand colors.</p>
            <div>
              <label className={labelCls}>Primary color</label>
              <input type="color" value={data.primaryColor} onChange={set('primaryColor')} className="w-full h-12 rounded-xl border border-white/10 bg-white/5 cursor-pointer" />
            </div>
            <div>
              <label className={labelCls}>Accent color</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {ACCENT_PRESETS.map((c) => (
                  <button key={c} onClick={() => setData((d) => ({ ...d, accentColor: c }))}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: data.accentColor === c ? 'white' : 'transparent' }}
                  />
                ))}
              </div>
              <input type="color" value={data.accentColor} onChange={set('accentColor')} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 cursor-pointer" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 font-semibold text-sm hover:border-white/30 transition-colors">Back</button>
              <button onClick={submit} disabled={loading} className="flex-1 py-3 rounded-xl bg-brand-red text-white font-semibold text-sm hover:bg-brand-red/90 transition-colors disabled:opacity-40">
                {loading ? 'Creating…' : 'Create shop →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center mx-auto text-3xl">✂️</div>
            <h2 className="font-heading text-2xl font-bold text-white">Your shop is live!</h2>
            <p className="text-white/40 text-sm">Share your booking link and start taking appointments.</p>
            <div className="bg-white/5 rounded-xl px-4 py-3 text-brand-teal text-sm font-mono">
              /book/{data.shopSlug}
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/dashboard/today')} className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold text-sm">
                Go to dashboard →
              </button>
              <button onClick={() => router.push(`/book/${data.shopSlug}`)} className="w-full py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm">
                Preview booking page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
