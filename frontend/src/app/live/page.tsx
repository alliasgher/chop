import { Nav } from '@/components/shared/nav';
import { SplitDemo } from '@/components/marketing/split-demo';

export const metadata = { title: 'Live Demo — Chop' };

export default function LivePage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-brand-ink pt-8">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-brand-teal text-xs font-semibold tracking-wide uppercase">Live right now</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Book on the left.<br />
            <span className="text-brand-teal">See it appear</span> on the right.
          </h1>
          <p className="text-white/60 text-base max-w-2xl mb-10 leading-relaxed">
            The left pane is the real customer booking page. When you complete a booking, a WebSocket event fires and the right pane — the owner dashboard — updates instantly. No refresh, no polling.
          </p>

          <SplitDemo />

          <p className="text-white/30 text-xs text-center mt-10">
            Tip: complete the booking flow on the left. Watch the right side the moment you hit confirm.
          </p>
        </div>
      </main>
    </>
  );
}
