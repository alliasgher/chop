'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Staff, Service } from '@/lib/api/shops';

interface Props {
  staff: Staff[];
  services: Service[];
  staffServices: { staff_id: string; service_id: string }[];
  shopSlug: string;
  shopColors: { primary: string; accent: string; background: string };
}

export function StaffPicker({ staff, services, staffServices, shopSlug, shopColors }: Props) {
  const router = useRouter();

  const serviceCountFor = (staffId: string) =>
    staffServices.filter((ss) => ss.staff_id === staffId).length;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {staff.map((barber) => (
        <button
          key={barber.id}
          onClick={() => router.push(`/book/${shopSlug}/service?staffId=${barber.id}`)}
          className="group text-left bg-white rounded-2xl border-2 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          style={{ borderColor: `${shopColors.primary}15` }}
        >
          {/* Photo */}
          <div className="relative h-52 w-full bg-gray-100">
            {barber.photo_url ? (
              <Image
                src={barber.photo_url}
                alt={barber.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-5xl font-heading font-bold"
                style={{ backgroundColor: `${shopColors.accent}20`, color: shopColors.accent }}
              >
                {barber.name[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3
                className="font-heading text-lg font-semibold"
                style={{ color: shopColors.primary }}
              >
                {barber.name}
              </h3>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${shopColors.accent}15`, color: shopColors.accent }}
              >
                {serviceCountFor(barber.id)} services
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: `${shopColors.primary}70` }}>
              {barber.bio}
            </p>
            <div
              className="mt-4 flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
              style={{ color: shopColors.accent }}
            >
              Book with {barber.name.split(' ')[0]}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
