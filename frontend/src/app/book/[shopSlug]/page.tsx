import { getShop } from '@/lib/api/shops';
import { StaffPicker } from '@/components/booking/staff-picker';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export default async function BookPage({ params }: Props) {
  const { shopSlug } = await params;

  let data;
  try {
    data = await getShop(shopSlug);
  } catch {
    notFound();
  }

  const { shop, staff, services, staffServices } = data;

  return (
    <div className="min-h-screen" style={{ backgroundColor: shop.colors.background }}>
      {/* Shop header */}
      <header className="border-b" style={{ borderColor: `${shop.colors.primary}20` }}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1
              className="font-heading text-2xl font-bold"
              style={{ color: shop.colors.primary, fontFamily: shop.fonts.heading }}
            >
              {shop.name}
            </h1>
            {shop.address && (
              <p className="text-sm mt-0.5" style={{ color: `${shop.colors.primary}80` }}>
                {shop.address}
              </p>
            )}
          </div>
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="text-sm font-medium hidden sm:block"
              style={{ color: shop.colors.accent }}
            >
              {shop.phone}
            </a>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: shop.colors.accent }}>
            Step 1 of 4
          </p>
          <h2
            className="font-heading text-3xl font-semibold"
            style={{ color: shop.colors.primary, fontFamily: shop.fonts.heading }}
          >
            Choose your barber
          </h2>
          <p className="mt-2 text-sm" style={{ color: `${shop.colors.primary}80` }}>
            Each barber has their own specialty. Pick who you&apos;d like to work with.
          </p>
        </div>

        <StaffPicker
          staff={staff}
          services={services}
          staffServices={staffServices}
          shopSlug={shopSlug}
          shopColors={shop.colors}
        />
      </main>
    </div>
  );
}
