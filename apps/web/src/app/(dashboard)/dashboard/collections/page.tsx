'use client';

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Collection {
  id: string;
  dueDate: string;
  customerName: string;
  installmentNumber: number;
  amountDue: number;
  amountReceived: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  propertyName?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  PARTIAL: { bg: '#DBEAFE', color: '#1D4ED8' },
  PAID: { bg: '#D1FAE5', color: '#065F46' },
  OVERDUE: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function CollectionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.get('/collections').then(r => r.data),
  });

  const collections: Collection[] = data?.data || [];
  const totalDue = collections.reduce((s, c) => s + (c.amountDue || 0), 0);
  const totalReceived = collections.reduce((s, c) => s + (c.amountReceived || 0), 0);
  const overdue = collections.filter(c => c.status === 'OVERDUE').length;

  const formatCurrency = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const stats = [
    { label: 'Total Due', value: formatCurrency(totalDue), emoji: '📊', color: '#3B82F6' },
    { label: 'Collected', value: formatCurrency(totalReceived), emoji: '✅', color: '#10B981' },
    { label: 'Overdue', value: overdue, emoji: '🚨', color: '#EF4444' },
    { label: 'Pending', value: collections.filter(c => c.status === 'PENDING').length, emoji: '⏳', color: '#F59E0B' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Collections" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Collections</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Scheduled installment collection tracker</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 28 }}>{s.emoji}</div>
              <div style={{ fontSize: typeof s.value === 'string' ? 18 : 24, fontWeight: 700, color: s.color, margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Due Date', 'Customer', 'Property', 'Installment #', 'Amount Due', 'Received', 'Status'].map(h => (
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
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📆</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No collections scheduled</div>
                    <div style={{ fontSize: 13 }}>Collection schedules will appear here</div>
                  </td>
                </tr>
              ) : (
                collections.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px', color: c.status === 'OVERDUE' ? '#EF4444' : '#475569', fontSize: 14, fontWeight: c.status === 'OVERDUE' ? 600 : 400 }}>{formatDate(c.dueDate)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0F172A' }}>{c.customerName}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{c.propertyName || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>#{c.installmentNumber}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{formatCurrency(c.amountDue)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#10B981' }}>{formatCurrency(c.amountReceived)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...STATUS_STYLE[c.status], padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {c.status}
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
