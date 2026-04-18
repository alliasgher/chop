'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function KeepAlive() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const controller = new AbortController();

    fetch(`${API_URL}/health`, { signal: controller.signal })
      .then((r) => {
        if (Date.now() - start > 3000) setWaking(false);
      })
      .catch(() => {});

    // If no response within 3s, show the waking banner
    const timer = setTimeout(() => setWaking(true), 3000);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  if (!waking) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-brand-ink text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium border border-white/10">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Waking up the server — usually takes ~20s on free tier
    </div>
  );
}
