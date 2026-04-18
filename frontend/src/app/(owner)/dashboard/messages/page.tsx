'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiFetch } from '@/lib/api/client';
import { format } from 'date-fns';

interface Message {
  id: string; kind: 'email' | 'sms'; recipient: string; subject: string | null;
  body: string; sent_at: string; is_real: boolean; customer_name: string;
}

export default function MessagesPage() {
  const { token, shop } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop || !token) return;
    apiFetch<{ messages: Message[] }>(`/api/owner/shops/${shop.id}/messages`, { token })
      .then((res) => setMessages(res.messages))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shop, token]);

  const filtered = messages.filter((m) => filter === 'all' || m.kind === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-ink">Messages</h1>
          <p className="text-brand-muted text-sm mt-1">Email log + SMS preview (real version would send via Twilio)</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'email', 'sms'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={{
              backgroundColor: filter === f ? '#1A1825' : 'white',
              color: filter === f ? 'white' : '#7A736A',
              border: `1px solid ${filter === f ? '#1A1825' : '#E5DDD3'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-brand-muted text-sm">Loading…</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-brand-muted">
              <p>No messages yet.</p>
            </div>
          )}
          {filtered.map((msg) => (
            <div key={msg.id} className="bg-white rounded-2xl border border-brand-border p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  {/* Kind badge */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    msg.kind === 'email'
                      ? 'bg-brand-violet/10 text-brand-violet'
                      : 'bg-brand-amber/10 text-brand-amber'
                  }`}>
                    {msg.kind === 'email' ? '✉️' : '📱'} {msg.kind.toUpperCase()}
                    {!msg.is_real && msg.kind === 'sms' && (
                      <span className="ml-1 text-xs opacity-60">(preview)</span>
                    )}
                  </span>
                  <span className="font-semibold text-brand-ink text-sm">{msg.customer_name}</span>
                </div>
                <span className="text-brand-muted text-xs shrink-0">
                  {format(new Date(msg.sent_at), 'MMM d, h:mma')}
                </span>
              </div>
              <p className="text-brand-muted text-xs mb-1">{msg.recipient}</p>
              {msg.subject && (
                <p className="text-brand-ink text-sm font-medium mb-1">{msg.subject}</p>
              )}
              <p className="text-brand-muted text-sm leading-relaxed">{msg.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
