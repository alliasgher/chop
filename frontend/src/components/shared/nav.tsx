'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand-ink border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading text-2xl font-bold text-white tracking-tight">
          Chop<span className="text-brand-red">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/book/chop-barbers" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            Book a Cut
          </Link>
          <Link href="/live" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            Live Demo
          </Link>
          <Link href="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            Owner Login
          </Link>
          <Link
            href="/register"
            className="bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red/90 transition-colors"
          >
            Get Your Shop
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-white/70 hover:text-white" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-brand-ink px-6 py-4 flex flex-col gap-4">
          <Link href="/book/chop-barbers" className="text-white/70 text-sm font-medium" onClick={() => setOpen(false)}>Book a Cut</Link>
          <Link href="/live" className="text-white/70 text-sm font-medium" onClick={() => setOpen(false)}>Live Demo</Link>
          <Link href="/login" className="text-white/70 text-sm font-medium" onClick={() => setOpen(false)}>Owner Login</Link>
          <Link href="/register" className="bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold text-center" onClick={() => setOpen(false)}>Get Your Shop</Link>
        </div>
      )}
    </nav>
  );
}
