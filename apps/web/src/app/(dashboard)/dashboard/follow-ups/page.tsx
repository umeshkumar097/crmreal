'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import AddFollowUpModal from '@/components/follow-ups/AddFollowUpModal';

interface FollowUp {
  id: string;
  leadName: string;
  phone: string;
  type: 'CALL' | 'SITE_VISIT' | 'WHATSAPP' | 'EMAIL';
  scheduledAt: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  assignedTo?: string;
  notes?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  COMPLETED: { bg: '#D1FAE5', color: '#065F46' },
  OVERDUE: { bg: '#FEE2E2', color: '#991B1B' },
  CANCELLED: { bg: '#F1F5F9', color: '#475569' },
};

const TYPE_EMOJI: Record<string, string> = {
  CALL: '📞', SITE_VISIT: '🏠', WHATSAPP: '💬', EMAIL: '✉️',
};

const TYPE_COLOR: Record<string, string> = {
  CALL: '#3B82F6', SITE_VISIT: '#10B981', WHATSAPP: '#25D366', EMAIL: '#F97316',
};

export default function FollowUpsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['follow-ups'],
    queryFn: () => api.get('/follow-ups').then(r => r.data),
  });

  const followUps: FollowUp[] = data?.data || [];
  const now = new Date();
  const today = followUps.filter(f => {
    const d = new Date(f.scheduledAt);
    return d.toDateString() === now.toDateString();
  }).length;

  const stats = [
    { label: 'Total', value: followUps.length, emoji: '📋', color: '#3B82F6' },
    { label: 'Pending', value: followUps.filter(f => f.status === 'PENDING').length, emoji: '⏳', color: '#F59E0B' },
    { label: 'Overdue', value: followUps.filter(f => f.status === 'OVERDUE').length, emoji: '🚨', color: '#EF4444' },
    { label: 'Today', value: today, emoji: '📅', color: '#10B981' },
  ];

  const formatDateTime = (d: string) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Follow-Ups" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Follow-Ups</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage lead follow-ups and reminders</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(59,130,246,0.3)' }}
          >
            + Add Follow-up
          </button>
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
                {['Lead Name', 'Phone', 'Type', 'Scheduled At', 'Status', 'Assigned To'].map(h => (
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
                        <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📞</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No follow-ups scheduled</div>
                    <div style={{ fontSize: 13 }}>Create follow-ups from lead detail pages</div>
                  </td>
                </tr>
              ) : (
                followUps.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0F172A' }}>{f.leadName}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{f.phone}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: TYPE_COLOR[f.type] + '22', color: TYPE_COLOR[f.type], padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {TYPE_EMOJI[f.type]} {f.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{formatDateTime(f.scheduledAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...STATUS_STYLE[f.status], padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{f.assignedTo || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <AddFollowUpModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['follow-ups'] })} 
        />
      )}
    </div>
  );
}
