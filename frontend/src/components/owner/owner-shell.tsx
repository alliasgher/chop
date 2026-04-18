'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Sidebar } from './sidebar';

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [token, user, router, pathname]);

  if (!token || !user) return null;

  return (
    <div className="flex h-screen bg-[#0F0E14] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#FAF7F2]">
        {children}
      </main>
    </div>
  );
}
