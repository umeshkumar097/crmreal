'use client';

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface ChannelPartner {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  totalLeadsReferred: number;
  commissionRate: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  city?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: '#D1FAE5', color: '#065F46' },
  INACTIVE: { bg: '#F1F5F9', color: '#475569' },
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
};

export default function ChannelPartnersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['channel-partners'],
    queryFn: () => api.get('/channel-partners').then(r => r.data),
  });

  const partners: ChannelPartner[] = data?.data || [];
  const active = partners.filter(p => p.status === 'ACTIVE').length;
  const totalLeads = partners.reduce((s, p) => s + (p.totalLeadsReferred || 0), 0);

  const stats = [
    { label: 'Total Partners', value: partners.length, emoji: '🤝', color: '#3B82F6' },
    { label: 'Active', value: active, emoji: '✅', color: '#10B981' },
    { label: 'Leads Referred', value: totalLeads, emoji: '👥', color: '#8B5CF6' },
    { label: 'Pending', value: partners.filter(p => p.status === 'PENDING').length, emoji: '⏳', color: '#F59E0B' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Channel Partners" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Channel Partners</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage your referral network and brokers</p>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
          }}>+ Add Partner</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 28 }}>{s.emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['CP Name', 'Company', 'Phone', 'Email', 'Leads Referred', 'Commission Rate', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🤝</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No channel partners yet</div>
                    <div style={{ fontSize: 13 }}>Add your first referral partner</div>
                  </td>
                </tr>
              ) : (
                partners.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {p.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 500, color: '#0F172A' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{p.company || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{p.phone}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{p.email || '—'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>{p.totalLeadsReferred || 0}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{p.commissionRate || 0}%</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...STATUS_STYLE[p.status], padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
