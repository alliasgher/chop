import Link from 'next/link';
import { Nav } from '@/components/shared/nav';
import { Footer } from '@/components/shared/footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-brand-ink text-white overflow-hidden relative">
          <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-brand-violet/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-60px] left-[20%] w-64 h-64 rounded-full bg-brand-red/20 blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-brand-teal text-xs font-semibold tracking-wide uppercase">Portfolio demo · Live</span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Appointment booking,<br />
              <span className="text-brand-red">built for barbershops.</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              A full booking system with Stripe payments, email reminders, and a live dashboard that updates the instant a customer books — all running right now.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/book/chop-barbers"
                className="inline-flex items-center justify-center gap-2 bg-brand-red text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-brand-red/90 transition-colors"
              >
                Try the booking flow
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/live"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/5 transition-colors"
              >
                See it update live
              </Link>
            </div>
          </div>
        </section>

        {/* Three-card simple flow */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-ink text-center mb-4">
            Three ways to explore.
          </h2>
          <p className="text-brand-muted text-center mb-12 max-w-xl mx-auto">
            Whether you&apos;re a shop owner, a customer, or here to see how it works — pick a door.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: '01 — Book a cut',
                title: 'Customer flow',
                body: 'Pick a barber, choose a service, grab a time. See what your clients would experience.',
                cta: 'Start booking',
                href: '/book/chop-barbers',
                color: '#E8445A',
              },
              {
                label: '02 — Live dashboard',
                title: 'Real-time view',
                body: 'Watch the owner dashboard update via WebSocket the moment someone books.',
                cta: 'Watch live',
                href: '/live',
                color: '#22C9A8',
              },
              {
                label: '03 — Run your own',
                title: 'Register',
                body: 'Spawn your own editable shop in 60 seconds. Share a booking link with real clients.',
                cta: 'Create shop',
                href: '/register',
                color: '#8B5CF6',
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative bg-white rounded-2xl border border-brand-border p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: card.color }}
                />
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: card.color }}>
                  {card.label}
                </p>
                <h3 className="font-heading text-2xl font-semibold text-brand-ink leading-tight">
                  {card.title}
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed flex-1">{card.body}</p>
                <span
                  className="inline-flex items-center gap-2 text-sm font-semibold mt-2"
                  style={{ color: card.color }}
                >
                  {card.cta}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-brand-surface border-t border-brand-border">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-ink mb-3">
              Want this for your shop?
            </h2>
            <p className="text-brand-muted text-base mb-8 max-w-lg mx-auto">
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
