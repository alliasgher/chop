'use client';

import Link from 'next/link';

const cards = [
  {
    tag: 'For business owners',
    tagColor: 'bg-brand-violet text-white',
    title: 'I run a barbershop.',
    body: "Set up your shop in 60 seconds. Get a shareable booking link, a live dashboard, and pre-seeded data so it looks lived-in from day one.",
    cta: 'Create my shop',
    href: '/register',
    accent: '#8B5CF6',
    decorLines: ['bg-brand-violet', 'bg-brand-violet/40', 'bg-brand-violet/20'],
  },
  {
    tag: 'For customers',
    tagColor: 'bg-brand-red text-white',
    title: 'I want a fresh cut.',
    body: 'Pick your barber, choose your service, grab a time slot. Stripe test checkout included — see exactly what your clients will experience.',
    cta: 'Book now',
    href: '/book/chop-barbers',
    accent: '#E8445A',
    decorLines: ['bg-brand-red', 'bg-brand-red/40', 'bg-brand-red/20'],
  },
  {
    tag: 'Live right now',
    tagColor: 'bg-brand-teal text-white',
    title: 'Show me it in action.',
    body: 'Watch the split-screen: book on the left, see it appear on the owner dashboard on the right — live, in real time. No refresh needed.',
    cta: 'Open live demo',
    href: '/live',
    accent: '#22C9A8',
    decorLines: ['bg-brand-teal', 'bg-brand-teal/40', 'bg-brand-teal/20'],
  },
];

export function ThreeCardGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.href}
            className="group relative bg-white rounded-2xl border border-brand-border p-8 flex flex-col gap-6 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Decorative corner lines */}
            <div className="absolute top-0 right-0 flex flex-col items-end gap-1 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              {card.decorLines.map((cls, i) => (
                <div key={i} className={`h-0.5 rounded-full ${cls}`} style={{ width: `${(3 - i) * 20}px` }} />
              ))}
            </div>

            <div>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${card.tagColor}`}>
                {card.tag}
              </span>
            </div>

            <div className="flex-1">
              <h2 className="font-heading text-2xl font-semibold text-brand-ink mb-3 leading-snug">
                {card.title}
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">{card.body}</p>
            </div>

            <Link
              href={card.href}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all"
              style={{ color: card.accent }}
            >
              {card.cta}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
