'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  status: 'GENERATING' | 'READY' | 'FAILED';
  downloadUrl?: string;
}

const REPORT_TYPES = [
  { key: 'SALES', icon: '📈', title: 'Sales Report', description: 'Revenue, bookings, and conversion analytics', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  { key: 'LEADS', icon: '👥', title: 'Lead Report', description: 'Lead sources, status distribution, and performance', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  { key: 'PAYMENTS', icon: '💰', title: 'Payment Report', description: 'Collections, dues, and payment mode analysis', color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)' },
  { key: 'INVENTORY', icon: '🏗️', title: 'Inventory Report', description: 'Unit availability, booking status, and pricing', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
];

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get('/reports').then(r => r.data),
  });

  const reports: Report[] = data?.data || [];
  const formatDate = (d: string) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const inputStyle = {
    padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
    fontSize: 13, outline: 'none', background: '#fff', color: '#0F172A',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Reports" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Reports</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Generate and download CRM reports</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
            <span style={{ color: '#64748B', fontSize: 13 }}>to</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Report Type Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {REPORT_TYPES.map(r => (
            <div key={r.key} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ background: r.gradient, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36 }}>{r.icon}</div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14, lineHeight: 1.5 }}>{r.description}</div>
                <button style={{
                  width: '100%', padding: '9px', border: 'none', borderRadius: 8,
                  background: r.color, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}>Generate Report</button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Recent Reports</h2>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Name', 'Type', 'Generated At', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} style={{ padding: '14px 16px' }}>
                          <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: '70%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>No reports generated yet</div>
                      <div style={{ fontSize: 13 }}>Generate a report above to see it here</div>
                    </td>
                  </tr>
                ) : (
                  reports.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0F172A' }}>{r.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{r.type}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{formatDate(r.generatedAt)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: r.status === 'READY' ? '#D1FAE5' : r.status === 'FAILED' ? '#FEE2E2' : '#FEF3C7',
                          color: r.status === 'READY' ? '#065F46' : r.status === 'FAILED' ? '#991B1B' : '#92400E',
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {r.status === 'READY' && (
                          <a href={r.downloadUrl || '#'} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>⬇ Download</a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
