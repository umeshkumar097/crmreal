'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'VIP';
  createdAt: string;
  _count?: { bookings: number };
  bookings?: { totalAmount: number }[];
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  });

  const customers: Customer[] = data?.data || [];
  const filtered = customers.filter(c => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase();
    const searchLower = search.toLowerCase();
    return fullName.includes(searchLower) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(searchLower);
  });

  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === 'ACTIVE').length;
  const vipCount = customers.filter(c => c.status === 'VIP').length;
  // This month (current month)
  const thisMonth = customers.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return { background: '#D1FAE5', color: '#065F46' };
    if (s === 'VIP') return { background: '#EDE9FE', color: '#5B21B6' };
    return { background: '#F1F5F9', color: '#475569' };
  };

  const stats = [
    { label: 'Total Customers', value: totalCustomers, emoji: '👥' },
    { label: 'Active', value: activeCount, emoji: '✅' },
    { label: 'VIP', value: vipCount, emoji: '⭐' },
    { label: 'This Month', value: thisMonth, emoji: '📅' },
  ];

  const formatCurrency = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Customers" />
      <div style={{ padding: '20px 24px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Customers</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage your customer database</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: 24 }}>{s.emoji}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', margin: '4px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name, phone or email..."
            style={{
              width: '100%', maxWidth: 400, padding: '10px 14px',
              border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14,
              outline: 'none', boxSizing: 'border-box', background: '#fff'
            }}
          />
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Name', 'Phone', 'Email', 'Total Bookings', 'Total Paid', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: `${60 + Math.random() * 30}%`, animation: 'pulse 1.5s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No customers found</div>
                    <div style={{ fontSize: 13 }}>Try adjusting your search</div>
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => {
                  const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim();
                  const totalBookings = c._count?.bookings || 0;
                  const totalPaid = c.bookings?.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) || 0;
                  return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 600, fontSize: 14, flexShrink: 0
                        }}>
                          {fullName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 500, color: '#0F172A' }}>{fullName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{c.phone}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{c.email || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>{totalBookings}</td>
                    <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 600 }}>{formatCurrency(totalPaid)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...statusColor(c.status), padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
