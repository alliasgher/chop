import { getShop } from '@/lib/api/shops';
import { TimeSlotGrid } from '@/components/booking/time-slot-grid';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ staffId?: string; serviceId?: string }>;
}

export default async function TimePage({ params, searchParams }: Props) {
  const { shopSlug } = await params;
  const { staffId, serviceId } = await searchParams;

  if (!staffId || !serviceId) notFound();

  let data;
  try {
    data = await getShop(shopSlug);
  } catch {
    notFound();
  }

  const { shop, staff, services } = data;
  const barber = staff.find((s) => s.id === staffId);
  const service = services.find((s) => s.id === serviceId);
  if (!barber || !service) notFound();

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
          href={`/book/${shopSlug}/service?staffId=${staffId}`}
          className="inline-flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: shop.colors.accent }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Change service
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: shop.colors.accent }}>
            Step 3 of 4
          </p>
          <h2 className="font-heading text-3xl font-semibold" style={{ color: shop.colors.primary, fontFamily: shop.fonts.heading }}>
            Pick a time
          </h2>
          <p className="mt-2 text-sm" style={{ color: `${shop.colors.primary}80` }}>
            {barber.name} &middot; {service.name} &middot; {service.duration_min} min
          </p>
        </div>

        <TimeSlotGrid
          shopSlug={shopSlug}
          staffId={staffId}
          serviceId={serviceId}
          shopTimezone={shop.timezone}
          shopColors={shop.colors}
        />
      </main>
    </div>
  );
}
