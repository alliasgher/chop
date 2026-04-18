'use client';

import { useRouter } from 'next/navigation';
import type { Service } from '@/lib/api/shops';

interface Props {
  services: Service[];
  staffId: string;
  shopSlug: string;
  shopColors: { primary: string; accent: string; background: string };
}

const categoryLabel: Record<string, string> = {
  cuts: 'Cuts',
  beard: 'Beard',
  combo: 'Combos',
  color: 'Color',
};

export function ServicePicker({ services, staffId, shopSlug, shopColors }: Props) {
  const router = useRouter();

  const grouped = services.reduce<Record<string, Service[]>>((acc, svc) => {
    const cat = svc.category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const handleSelect = (serviceId: string) => {
    router.push(`/book/${shopSlug}/time?staffId=${staffId}&serviceId=${serviceId}`);
  };

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, svcs]) => (
        <div key={cat}>
          <h3
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: `${shopColors.primary}50` }}
          >
            {categoryLabel[cat] ?? cat}
          </h3>
          <div className="space-y-3">
            {svcs.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleSelect(svc.id)}
                className="group w-full text-left bg-white rounded-xl border-2 px-6 py-5 flex items-center justify-between hover:shadow-md transition-all duration-200"
                style={{ borderColor: `${shopColors.primary}12` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-base" style={{ color: shopColors.primary }}>
                      {svc.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${shopColors.accent}15`, color: shopColors.accent }}
                    >
                      {svc.duration_min} min
                    </span>
                  </div>
                  {svc.description && (
                    <p className="text-sm truncate" style={{ color: `${shopColors.primary}60` }}>
                      {svc.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right">
                    <div className="font-heading font-bold text-lg" style={{ color: shopColors.primary }}>
                      ${(svc.price_cents / 100).toFixed(0)}
                    </div>
                    {svc.deposit_cents > 0 && (
                      <div className="text-xs" style={{ color: `${shopColors.primary}50` }}>
                        ${(svc.deposit_cents / 100).toFixed(0)} deposit
                      </div>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    style={{ color: shopColors.accent }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
