import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-ink text-white/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-heading text-xl font-bold text-white">
            Chop<span className="text-brand-red">.</span>
          </span>
          <p className="text-sm mt-1">Real-time booking for modern barbershops.</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/book/chop-barbers" className="hover:text-white transition-colors">Try Demo</Link>
          <Link href="/live" className="hover:text-white transition-colors">Live View</Link>
          <a href="mailto:ali@kscope.ai" className="hover:text-white transition-colors">Contact Ali</a>
        </div>
        <p className="text-xs">Built by <a href="https://alliasgher.vercel.app" className="text-brand-teal hover:underline">Ali</a></p>
      </div>
    </footer>
  );
}
