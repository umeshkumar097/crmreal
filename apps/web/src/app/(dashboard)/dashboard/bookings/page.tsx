'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import AddBookingModal from '@/components/bookings/AddBookingModal';

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  propertyName: string;
  unitNumber: string;
  bookingDate: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  CONFIRMED: { bg: '#DBEAFE', color: '#1D4ED8' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B' },
  COMPLETED: { bg: '#D1FAE5', color: '#065F46' },
};

export default function BookingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then(r => r.data),
  });

  const bookings: Booking[] = data?.data || [];
  const now = new Date();
  const thisMonthBookings = bookings.filter(b => {
    const d = new Date(b.bookingDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const totalRevenue = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.totalAmount || 0), 0);

  const formatCurrency = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const stats = [
    { label: 'Total Bookings', value: bookings.length, emoji: '📋', color: '#3B82F6' },
    { label: 'This Month', value: thisMonthBookings.length, emoji: '📅', color: '#10B981' },
    { label: 'Pending', value: pendingCount, emoji: '⏳', color: '#F59E0B' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), emoji: '💰', color: '#8B5CF6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Bookings" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Bookings</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Track and manage property bookings</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}
          >
            + Add Booking
          </button>
        </div>

        {/* Stats */}
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

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Booking #', 'Customer', 'Property', 'Unit', 'Booking Date', 'Amount', 'Status'].map(h => (
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
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No bookings yet</div>
                    <div style={{ fontSize: 13 }}>Bookings will appear here once created</div>
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#6366F1', fontSize: 14 }}>#{b.bookingNumber || b.id?.slice(-6)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0F172A' }}>{b.customerName}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{b.propertyName}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{b.unitNumber}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{formatDate(b.bookingDate)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{formatCurrency(b.totalAmount)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: STATUS_STYLE[b.status]?.bg, color: STATUS_STYLE[b.status]?.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <AddBookingModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })} 
        />
      )}
    </div>
  );
}
