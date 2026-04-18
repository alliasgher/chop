'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiFetch } from '@/lib/api/client';
import Image from 'next/image';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface StaffMember {
  id: string; name: string; bio: string; photo_url: string | null; is_active: boolean;
}
interface Rule {
  id: string; day_of_week: number; start_time: string; end_time: string;
}

export default function StaffPage() {
  const { token, shop } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!shop || !token) return;
    const res = await apiFetch<{ staff: StaffMember[] }>(`/api/owner/shops/${shop.id}/staff`, { token });
    setStaff(res.staff);
    setLoading(false);
  };

  useEffect(() => { load(); }, [shop, token]);

  const selectMember = async (member: StaffMember) => {
    setSelected(member);
    if (!token) return;
    const res = await apiFetch<{ rules: Rule[] }>(`/api/owner/staff/${member.id}/availability`, { token });
    setRules(res.rules);
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    if (!token) return;
    const res = await apiFetch<{ staff: StaffMember }>(`/api/owner/staff/${id}`, {
      method: 'PATCH', token, body: { is_active },
    });
    setStaff((p) => p.map((s) => s.id === id ? res.staff : s));
    if (selected?.id === id) setSelected(res.staff);
  };

  const deleteRule = async (ruleId: string) => {
    if (!token) return;
    await apiFetch(`/api/owner/availability/${ruleId}`, { method: 'DELETE', token });
    setRules((p) => p.filter((r) => r.id !== ruleId));
  };

  const addRule = async (day: number) => {
    if (!selected || !token) return;
    const res = await apiFetch<{ rule: Rule }>(`/api/owner/staff/${selected.id}/availability`, {
      method: 'POST', token,
      body: { day_of_week: day, start_time: '10:00', end_time: '18:00' },
    });
    setRules((p) => [...p, res.rule]);
  };

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-brand-ink mb-8">Staff</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Staff list */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-brand-muted text-sm">Loading…</p>
          ) : staff.map((member) => (
            <button
              key={member.id}
              onClick={() => selectMember(member)}
              className="w-full text-left bg-white rounded-2xl border-2 p-4 flex items-center gap-4 transition-all hover:shadow-sm"
              style={{ borderColor: selected?.id === member.id ? '#E8445A' : '#E5DDD3' }}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-surface shrink-0">
                {member.photo_url ? (
                  <Image src={member.photo_url} alt={member.name} width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-heading font-bold text-brand-muted">
                    {member.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-brand-ink text-sm">{member.name}</div>
                <div className="text-brand-muted text-xs truncate">{member.bio}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive(member.id, !member.is_active); }}
                className={`w-8 h-5 rounded-full transition-colors shrink-0 ${member.is_active ? 'bg-brand-teal' : 'bg-gray-200'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full mx-0.5 transition-transform ${member.is_active ? 'translate-x-3' : ''}`} />
              </button>
            </button>
          ))}
        </div>

        {/* Availability panel */}
        {selected && (
          <div className="md:col-span-2 bg-white rounded-2xl border border-brand-border p-6">
            <h2 className="font-heading font-semibold text-brand-ink mb-4">
              {selected.name}&rsquo;s availability
            </h2>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {DAYS.map((day, i) => {
                const hasRule = rules.some((r) => r.day_of_week === i);
                return (
                  <button
                    key={day}
                    onClick={() => hasRule ? undefined : addRule(i)}
                    className="flex flex-col items-center py-3 rounded-xl border-2 text-xs font-semibold transition-all"
                    style={{
                      borderColor: hasRule ? '#22C9A8' : '#E5DDD3',
                      backgroundColor: hasRule ? '#22C9A810' : 'white',
                      color: hasRule ? '#22C9A8' : '#7A736A',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {rules.sort((a, b) => a.day_of_week - b.day_of_week).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-2 px-4 bg-brand-surface rounded-xl text-sm">
                  <span className="font-medium text-brand-ink">{DAYS[rule.day_of_week]}</span>
                  <span className="text-brand-muted">{rule.start_time} – {rule.end_time}</span>
                  <button onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-brand-muted text-sm text-center py-4">Click a day above to add availability.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
