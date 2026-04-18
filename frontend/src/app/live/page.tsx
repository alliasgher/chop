import { Nav } from '@/components/shared/nav';
import { SplitDemo } from '@/components/marketing/split-demo';

export const metadata = { title: 'Live Demo — Chop' };

export default function LivePage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-brand-ink">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-brand-teal text-xs font-semibold tracking-wide uppercase">Live right now</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
            Book on the left.<br />
            <span className="text-brand-teal">See it appear</span> on the right.
          </h1>
          <p className="text-white/50 text-base max-w-xl">
            These are real test bookings from other visitors. The dashboard updates instantly via WebSocket — no refresh, no polling.
          </p>
        </div>

        {/* Split screen */}
        <SplitDemo />

        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <p className="text-white/30 text-sm">
            Want this for your barbershop?{' '}
            <a href="mailto:ali@kscope.ai" className="text-brand-teal hover:underline">Contact Ali →</a>
          </p>
        </div>
      </main>
    </>
  );
}
