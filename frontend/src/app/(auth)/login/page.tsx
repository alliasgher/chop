'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { loginOwner } from '@/lib/api/owner';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setShop } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user, token } = await loginOwner(form.email, form.password);
      setAuth(user, token);

      // Load first shop
      const { shops } = await apiFetch<{ shops: any[] }>('/api/owner/shops', { token });
      if (shops[0]) setShop({ id: shops[0].id, slug: shops[0].slug, name: shops[0].name });

      const next = searchParams.get('next') ?? '/dashboard/today';
      router.push(next);
    } catch (err: any) {
      setError(err.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-brand-teal transition-colors';

  return (
    <div className="min-h-screen bg-brand-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-heading text-2xl font-bold text-white block mb-8">
          Chop<span className="text-brand-red">.</span>
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Owner login</h1>
          <p className="text-white/40 text-sm mb-6">
            Demo: <span className="text-brand-teal font-mono">owner@chopbarbers.com</span> / <span className="text-brand-teal font-mono">chop-demo-2024</span>
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="owner@chopbarbers.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={set('password')} required placeholder="••••••••" className={inputCls} />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold text-sm hover:bg-brand-red/90 transition-colors disabled:opacity-40">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="text-white/30 text-xs text-center mt-6">
            New here?{' '}
            <Link href="/register" className="text-brand-teal hover:underline">Create a shop</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
