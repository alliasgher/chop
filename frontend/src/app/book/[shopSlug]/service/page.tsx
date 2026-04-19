'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getShop, type ShopData } from '@/lib/api/shops';
import { ServicePicker } from '@/components/booking/service-picker';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export default function ServicePage({ params }: Props) {
  const { shopSlug } = use(params);
  const searchParams = useSearchParams();
  const staffId = searchParams.get('staffId');
  const [data, setData] = useState<ShopData | null>(null);

  useEffect(() => {
    if (!staffId) return;
    getShop(shopSlug).then(setData).catch(() => {});
  }, [shopSlug, staffId]);

  if (!staffId) return <div className="min-h-screen flex items-center justify-center text-brand-muted">Missing staff selection.</div>;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <header className="border-b border-brand-border">
          <div className="max-w-4xl mx-auto px-6 py-5"><Skeleton className="h-8 w-48" /></div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-56" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </main>
      </div>
    );
  }

  const { shop, staff, services, staffServices } = data;
  const barber = staff.find((s) => s.id === staffId);
  if (!barber) return <div className="min-h-screen flex items-center justify-center text-brand-muted">Barber not found.</div>;

  const barberServiceIds = new Set(staffServices.filter((ss) => ss.staff_id === staffId).map((ss) => ss.service_id));
  const barberServices = services.filter((s) => barberServiceIds.has(s.id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: shop.colors.background }}>
      <header className="border-b" style={{ borderColor: `${shop.colors.primary}20` }}>
        <div className="max-w-4xl mx-auto px-6 py-5">
          <h1 className="font-heading text-2xl font-bold" style={{ color: shop.colors.primary, fontFamily: shop.fonts.heading }}>
            {shop.name}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href={`/book/${shopSlug}`}
          className="inline-flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: shop.colors.accent }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Change barber
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: shop.colors.accent }}>
            Step 2 of 4
          </p>
          <h2 className="font-heading text-3xl font-semibold" style={{ color: shop.colors.primary, fontFamily: shop.fonts.heading }}>
            Pick a service
          </h2>
          <p className="mt-2 text-sm" style={{ color: `${shop.colors.primary}80` }}>
            Booking with <strong>{barber.name}</strong>
          </p>
        </div>

        <ServicePicker
          services={barberServices}
          staffId={staffId}
          shopSlug={shopSlug}
          shopColors={shop.colors}
        />
      </main>
    </div>
  );
}
