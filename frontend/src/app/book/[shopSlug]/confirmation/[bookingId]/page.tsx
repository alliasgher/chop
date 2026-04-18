import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/client';

interface Props {
  params: Promise<{ shopSlug: string; bookingId: string }>;
}

interface BookingDetail {
  id: string;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_email: string;
  status: string;
  service_name: string;
  staff_name: string;
  shop_name: string;
  shop_slug: string;
  price_cents: number;
  deposit_paid_cents: number;
}

export default async function ConfirmationPage({ params }: Props) {
  const { shopSlug, bookingId } = await params;

  let booking: BookingDetail;
  try {
    const res = await apiFetch<{ booking: BookingDetail }>(`/api/bookings/${bookingId}`);
    booking = res.booking;
  } catch {
    notFound();
  }

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(booking.starts_at));

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-heading text-3xl font-bold text-brand-ink text-center mb-2">
          You&apos;re booked!
        </h1>
        <p className="text-brand-muted text-center text-sm mb-8">
          A confirmation email has been sent to {booking.customer_email}
        </p>

        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Name</span>
            <span className="font-medium text-brand-ink">{booking.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Barber</span>
            <span className="font-medium text-brand-ink">{booking.staff_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Service</span>
            <span className="font-medium text-brand-ink">{booking.service_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">When</span>
            <span className="font-medium text-brand-ink text-right">{formattedTime}</span>
          </div>
          <div className="border-t border-brand-border pt-4 flex justify-between text-sm">
            <span className="text-brand-muted">Status</span>
            <span className="font-semibold text-brand-teal capitalize">{booking.status}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href={`/book/${shopSlug}`}
            className="block text-center py-3 rounded-xl border-2 border-brand-border text-brand-ink font-semibold text-sm hover:bg-brand-surface transition-colors"
          >
            Book another appointment
          </Link>
          <Link
            href="/"
            className="block text-center py-3 text-brand-muted text-sm hover:text-brand-ink transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
