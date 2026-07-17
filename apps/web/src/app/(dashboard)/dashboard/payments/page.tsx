'use client';

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Payment {
  id: string;
  paymentNumber: string;
  customerName: string;
  propertyName: string;
  amount: number;
  mode: 'CASH' | 'CHEQUE' | 'NEFT' | 'UPI' | 'RTGS';
  status: 'PENDING' | 'RECEIVED' | 'BOUNCED' | 'OVERDUE';
  date: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  RECEIVED: { bg: '#D1FAE5', color: '#065F46' },
  BOUNCED: { bg: '#FEE2E2', color: '#991B1B' },
  OVERDUE: { bg: '#FEF3C7', color: '#B45309' },
};

const MODE_STYLE: Record<string, string> = {
  CASH: '#10B981', CHEQUE: '#3B82F6', NEFT: '#8B5CF6', UPI: '#EC4899', RTGS: '#F97316',
};

export default function PaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(r => r.data),
  });

  const payments: Payment[] = data?.data || [];
  const now = new Date();
  const thisMonth = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalCollected = payments.filter(p => p.status === 'RECEIVED').reduce((s, p) => s + (p.amount || 0), 0);
  const pending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + (p.amount || 0), 0);
  const overdue = payments.filter(p => p.status === 'OVERDUE').reduce((s, p) => s + (p.amount || 0), 0);

  const formatCurrency = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const stats = [
    { label: 'Total Collected', value: formatCurrency(totalCollected), emoji: '💰', color: '#10B981' },
    { label: 'This Month', value: thisMonth.length, emoji: '📅', color: '#3B82F6' },
    { label: 'Pending', value: formatCurrency(pending), emoji: '⏳', color: '#F59E0B' },
    { label: 'Overdue', value: formatCurrency(overdue), emoji: '🚨', color: '#EF4444' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Payments" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Payments</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Track all payment transactions</p>
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
                {['Payment #', 'Customer', 'Property', 'Amount', 'Mode', 'Status', 'Date'].map(h => (
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
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No payments recorded</div>
                    <div style={{ fontSize: 13 }}>Payments will appear here once added</div>
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#6366F1', fontSize: 14 }}>#{p.paymentNumber || p.id?.slice(-6)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0F172A' }}>{p.customerName}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{p.propertyName}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{formatCurrency(p.amount)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: MODE_STYLE[p.mode] + '22', color: MODE_STYLE[p.mode], padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {p.mode}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...STATUS_STYLE[p.status], padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{formatDate(p.date)}</td>
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
