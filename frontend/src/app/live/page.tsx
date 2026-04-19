import { Nav } from '@/components/shared/nav';
import { LiveDashboard } from '@/components/marketing/live-dashboard';
import Link from 'next/link';

export const metadata = { title: 'Live Demo — Chop' };

export default function LivePage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-brand-ink pt-8">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-brand-teal text-xs font-semibold tracking-wide uppercase">Live right now</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Real bookings, appearing here <span className="text-brand-teal">in real time.</span>
          </h1>
          <p className="text-white/60 text-base max-w-xl mb-8 leading-relaxed">
            This dashboard is subscribed via WebSocket to the demo shop. When anyone books an appointment, the new card appears instantly — no refresh, no polling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/book/chop-barbers"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-brand-red text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-red/90 transition-colors"
            >
              Open booking page in new tab
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              Sign in as owner
            </Link>
          </div>

          <LiveDashboard />

          <p className="text-white/30 text-xs text-center mt-12">
            Tip: keep this tab open. Book from the other tab. Watch this page update.
          </p>
        </div>
      </main>
    </>
  );
}
