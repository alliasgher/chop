'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { parseISO } from 'date-fns';
import { getShop, type ShopData } from '@/lib/api/shops';
import { DetailsForm } from '@/components/booking/details-form';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export default function DetailsPage({ params }: Props) {
  const { shopSlug } = use(params);
  const searchParams = useSearchParams();
  const staffId = searchParams.get('staffId');
  const serviceId = searchParams.get('serviceId');
  const startsAt = searchParams.get('startsAt');
  const [data, setData] = useState<ShopData | null>(null);

  useEffect(() => {
    if (!staffId || !serviceId || !startsAt) return;
    getShop(shopSlug).then(setData).catch(() => {});
  }, [shopSlug, staffId, serviceId, startsAt]);

  if (!staffId || !serviceId || !startsAt) {
    return <div className="min-h-screen flex items-center justify-center text-brand-muted">Missing booking info.</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <header className="border-b border-brand-border">
          <div className="max-w-4xl mx-auto px-6 py-5"><Skeleton className="h-8 w-48" /></div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-8">
          <Skeleton className="md:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="md:col-span-3 h-96 rounded-2xl" />
        </main>
      </div>
    );
  }

  const { shop, staff, services } = data;
  const barber = staff.find((s) => s.id === staffId);
  const service = services.find((s) => s.id === serviceId);
  if (!barber || !service) return <div className="min-h-screen flex items-center justify-center text-brand-muted">Not found.</div>;

  const startDate = parseISO(startsAt);
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: shop.timezone,
  }).format(startDate);

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
          href={`/book/${shopSlug}/time?staffId=${staffId}&serviceId=${serviceId}`}
          className="inline-flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: shop.colors.accent }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Change time
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: shop.colors.accent }}>
            Step 4 of 4
          </p>
          <h2 className="font-heading text-3xl font-semibold" style={{ color: shop.colors.primary, fontFamily: shop.fonts.heading }}>
            Your details
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border-2 p-6 space-y-4" style={{ borderColor: `${shop.colors.primary}12` }}>
              <h3 className="font-heading font-semibold" style={{ color: shop.colors.primary }}>Booking summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span style={{ color: `${shop.colors.primary}60` }}>Barber</span><span className="font-medium" style={{ color: shop.colors.primary }}>{barber.name}</span></div>
                <div className="flex justify-between"><span style={{ color: `${shop.colors.primary}60` }}>Service</span><span className="font-medium" style={{ color: shop.colors.primary }}>{service.name}</span></div>
                <div className="flex justify-between"><span style={{ color: `${shop.colors.primary}60` }}>Duration</span><span className="font-medium" style={{ color: shop.colors.primary }}>{service.duration_min} min</span></div>
                <div className="flex justify-between"><span style={{ color: `${shop.colors.primary}60` }}>Time</span><span className="font-medium text-right" style={{ color: shop.colors.primary }}>{formattedTime}</span></div>
                <div className="border-t pt-3" style={{ borderColor: `${shop.colors.primary}15` }}>
                  <div className="flex justify-between font-semibold"><span style={{ color: shop.colors.primary }}>Deposit due</span><span style={{ color: shop.colors.accent }}>${(service.deposit_cents / 100).toFixed(2)}</span></div>
                  <div className="flex justify-between mt-1 text-xs" style={{ color: `${shop.colors.primary}50` }}><span>Total price</span><span>${(service.price_cents / 100).toFixed(2)}</span></div>
                </div>
              </div>
              <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: `${shop.colors.accent}10`, color: shop.colors.accent }}>
                Demo mode — no money moves.
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <DetailsForm shopSlug={shopSlug} staffId={staffId} serviceId={serviceId} startsAt={startsAt} shopColors={shop.colors} />
          </div>
        </div>
      </main>
    </div>
  );
}
