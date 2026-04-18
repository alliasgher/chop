'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

const links = [
  { href: '/dashboard/today', label: 'Today', icon: '⚡' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: '📅' },
  { href: '/dashboard/bookings', label: 'All Bookings', icon: '📋' },
  { href: '/dashboard/services', label: 'Services', icon: '✂️' },
  { href: '/dashboard/staff', label: 'Staff', icon: '👤' },
  { href: '/dashboard/messages', label: 'Messages', icon: '💬' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, shop, logout } = useAuthStore();

  return (
    <aside className="w-60 flex flex-col bg-[#1A1825] shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="font-heading text-xl font-bold text-white">
          Chop<span className="text-[#E8445A]">.</span>
        </Link>
        {shop && (
          <p className="text-white/40 text-xs mt-1 truncate">{shop.name}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? '#E8445A15' : 'transparent',
                color: active ? '#E8445A' : 'rgba(255,255,255,0.6)',
              }}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#E8445A]/20 flex items-center justify-center text-[#E8445A] text-sm font-bold">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-white/30 hover:text-white/60 transition-colors px-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
