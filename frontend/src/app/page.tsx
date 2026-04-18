import Link from 'next/link';
import { Nav } from '@/components/shared/nav';
import { Footer } from '@/components/shared/footer';
import { ThreeCardGrid } from '@/components/marketing/three-card-grid';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-brand-ink text-white overflow-hidden relative">
          {/* Background accent blobs */}
          <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-brand-violet/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-60px] left-[20%] w-64 h-64 rounded-full bg-brand-red/20 blur-3xl pointer-events-none" />
          <div className="absolute top-[30%] right-[30%] w-48 h-48 rounded-full bg-brand-teal/10 blur-2xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-28 md:py-36 relative z-10">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-brand-teal text-xs font-semibold tracking-wide uppercase">Real bookings happening right now</span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.05] max-w-4xl mb-6">
              See a booking appear
              <span className="block">
                <span className="text-brand-red">live</span> on the dashboard
              </span>
              <span className="text-white/50 block">the instant you make it.</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
              A complete appointment booking system for barbershops — real-time WebSocket updates,
              Stripe payments, automated emails, and a drag-to-reschedule calendar. All in one demo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/live"
                className="inline-flex items-center justify-center gap-2 bg-brand-red text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-brand-red/90 transition-colors"
              >
                Watch it live
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/book/chop-barbers"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/5 transition-colors"
              >
                Try the booking flow
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '< 1s', label: 'WebSocket latency', color: 'text-brand-teal' },
                { value: '$0', label: 'Monthly cost to run', color: 'text-brand-amber' },
                { value: '8', label: 'Services per barber', color: 'text-brand-violet' },
                { value: '3', label: 'Barbers, live & bookable', color: 'text-brand-red' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className={`font-heading text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-white/40 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three cards */}
        <ThreeCardGrid />

        {/* Tech stack callout */}
        <section className="bg-brand-surface border-y border-brand-border">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="font-heading text-3xl font-semibold text-brand-ink mb-3">
                Built to impress clients, not just recruiters.
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Next.js 15 · Fastify · PostgreSQL on Neon · WebSockets · Stripe · Resend emails with ICS attachments.
                Every piece a real production decision, nothing bolted on for show.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Next.js', 'Fastify', 'Neon DB', 'WebSockets', 'Stripe', 'Resend'].map((tech) => (
                <span key={tech} className="bg-white border border-brand-border text-brand-ink text-xs font-semibold px-4 py-2 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-ink mb-4">
            Want this for your shop?
          </h2>
          <p className="text-brand-muted mb-8 text-lg max-w-lg mx-auto">
            I build custom booking systems for salons, barbershops, and clinics. Let&apos;s talk.
          </p>
          <a
            href="mailto:ali@kscope.ai"
            className="inline-flex items-center gap-2 bg-brand-ink text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-brand-ink/80 transition-colors"
          >
            Contact Ali
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
