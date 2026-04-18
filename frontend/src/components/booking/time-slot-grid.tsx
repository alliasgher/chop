'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSlots } from '@/lib/api/shops';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  shopSlug: string;
  staffId: string;
  serviceId: string;
  shopTimezone: string;
  shopColors: { primary: string; accent: string; background: string };
}

function buildDateRange(count = 14) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export function TimeSlotGrid({ shopSlug, staffId, serviceId, shopTimezone, shopColors }: Props) {
  const router = useRouter();
  const dates = buildDateRange();
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true);
    setSlots([]);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await getSlots(shopSlug, staffId, dateStr, serviceId);
      setSlots(res.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [shopSlug, staffId, serviceId]);

  useEffect(() => { fetchSlots(selectedDate); }, [selectedDate, fetchSlots]);

  const handleSlotSelect = (slotISO: string) => {
    const encoded = encodeURIComponent(slotISO);
    router.push(`/book/${shopSlug}/details?staffId=${staffId}&serviceId=${serviceId}&startsAt=${encoded}`);
  };

  const formatSlot = (iso: string) => {
    const d = parseISO(iso);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: shopTimezone,
    }).format(d);
  };

  return (
    <div className="space-y-6">
      {/* Date rail */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((date) => {
          const active = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className="flex flex-col items-center shrink-0 w-14 py-3 rounded-xl border-2 text-xs font-semibold transition-all"
              style={{
                borderColor: active ? shopColors.accent : `${shopColors.primary}15`,
                backgroundColor: active ? shopColors.accent : 'white',
                color: active ? 'white' : shopColors.primary,
              }}
            >
              <span className="uppercase opacity-70">{format(date, 'EEE')}</span>
              <span className="font-heading text-xl mt-0.5">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      {/* Slot grid */}
      <div>
        <p className="text-sm font-semibold mb-4" style={{ color: `${shopColors.primary}70` }}>
          {format(selectedDate, 'EEEE, MMMM d')}
        </p>

        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && slots.length === 0 && (
          <div className="py-12 text-center rounded-xl border-2 border-dashed" style={{ borderColor: `${shopColors.primary}15` }}>
            <p className="font-semibold" style={{ color: shopColors.primary }}>No availability</p>
            <p className="text-sm mt-1" style={{ color: `${shopColors.primary}60` }}>Try a different date.</p>
          </div>
        )}

        {!loading && slots.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => handleSlotSelect(slot)}
                className="py-3 rounded-xl border-2 text-sm font-semibold hover:shadow-md transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: `${shopColors.accent}30`,
                  color: shopColors.primary,
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = shopColors.accent;
                  (e.currentTarget as HTMLButtonElement).style.color = 'white';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = shopColors.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                  (e.currentTarget as HTMLButtonElement).style.color = shopColors.primary;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${shopColors.accent}30`;
                }}
              >
                {formatSlot(slot)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
