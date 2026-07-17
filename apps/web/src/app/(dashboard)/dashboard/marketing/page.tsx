'use client';

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  sentCount: number;
  openRate: number;
  budget: number;
  createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: '#F1F5F9', color: '#475569' },
  ACTIVE: { bg: '#D1FAE5', color: '#065F46' },
  PAUSED: { bg: '#FEF3C7', color: '#92400E' },
  COMPLETED: { bg: '#DBEAFE', color: '#1D4ED8' },
};

const TYPE_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  EMAIL: { bg: '#FFF7ED', color: '#F97316', icon: '✉️' },
  WHATSAPP: { bg: '#F0FDF4', color: '#16A34A', icon: '💬' },
  SMS: { bg: '#EFF6FF', color: '#2563EB', icon: '📱' },
};

export default function MarketingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/marketing/campaigns').then(r => r.data),
  });

  const campaigns: Campaign[] = data?.data || [];
  const active = campaigns.filter(c => c.status === 'ACTIVE').length;
  const totalSent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
  const avgOpenRate = campaigns.length > 0
    ? (campaigns.reduce((s, c) => s + (c.openRate || 0), 0) / campaigns.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Total Campaigns', value: campaigns.length, emoji: '📊', color: '#3B82F6' },
    { label: 'Active', value: active, emoji: '🟢', color: '#10B981' },
    { label: 'Sent This Month', value: totalSent.toLocaleString(), emoji: '📤', color: '#8B5CF6' },
    { label: 'Avg Open Rate', value: `${avgOpenRate}%`, emoji: '👁️', color: '#F97316' },
  ];

  const formatCurrency = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Marketing" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Marketing</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage campaigns and outreach</p>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
          }}>+ New Campaign</button>
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

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0', height: 200 }}>
                <div style={{ height: 18, background: '#F1F5F9', borderRadius: 6, width: '60%', marginBottom: 10 }} />
                <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '40%', marginBottom: 8 }} />
                <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px', color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📣</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>No campaigns yet</div>
            <div style={{ fontSize: 14 }}>Create your first marketing campaign</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {campaigns.map(c => (
              <div key={c.id} style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', flex: 1, marginRight: 8 }}>{c.name}</div>
                  <span style={{ ...STATUS_STYLE[c.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <span style={{ background: TYPE_STYLE[c.type].bg, color: TYPE_STYLE[c.type].color, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                    {TYPE_STYLE[c.type].icon} {c.type}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>SENT</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{(c.sentCount || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>OPEN RATE</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>{c.openRate || 0}%</div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>BUDGET</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{formatCurrency(c.budget)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
