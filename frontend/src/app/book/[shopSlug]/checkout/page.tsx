'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    apiFetch<{ url: string }>(`/api/bookings/${bookingId}/checkout`, { method: 'POST' })
      .then((res) => { window.location.href = res.url; })
      .catch((err) => setError(err.message));
  }, [bookingId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-brand-muted text-sm">Redirecting to secure checkout…</p>
        <p className="text-brand-muted/50 text-xs">Demo mode — card 4242 4242 4242 4242, any expiry, any CVC</p>
      </div>
    </div>
  );
}
