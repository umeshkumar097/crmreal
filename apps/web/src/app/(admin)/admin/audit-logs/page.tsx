'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface AuditLog {
  id: string; action: string; entityType: string; entityId: string;
  ipAddress?: string; userAgent?: string; createdAt: string;
  user?: { firstName: string; lastName: string; email: string; role: string };
}

const ACTION_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  CREATE: { color: '#059669', bg: '#ECFDF5', icon: '➕' },
  UPDATE: { color: '#2563EB', bg: '#EFF6FF', icon: '✏️' },
  DELETE: { color: '#DC2626', bg: '#FEF2F2', icon: '🗑️' },
  LOGIN: { color: '#7C3AED', bg: '#F5F3FF', icon: '🔑' },
  LOGOUT: { color: '#64748B', bg: '#F8FAFC', icon: '🚪' },
  EXPORT: { color: '#D97706', bg: '#FFFBEB', icon: '📤' },
  IMPORT: { color: '#0EA5E9', bg: '#F0F9FF', icon: '📥' },
};

const DEMO_LOGS: AuditLog[] = [
  { id: '1', action: 'LOGIN', entityType: 'User', entityId: 'u1', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 2 * 60000).toISOString(), user: { firstName: 'Admin', lastName: 'User', email: 'admin@realflow.com', role: 'ADMIN' } },
  { id: '2', action: 'CREATE', entityType: 'Lead', entityId: 'l1', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 15 * 60000).toISOString(), user: { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@realflow.com', role: 'AGENT' } },
  { id: '3', action: 'UPDATE', entityType: 'Lead', entityId: 'l2', ipAddress: '192.168.1.2', createdAt: new Date(Date.now() - 45 * 60000).toISOString(), user: { firstName: 'Priya', lastName: 'Mehta', email: 'priya@realflow.com', role: 'MANAGER' } },
  { id: '4', action: 'IMPORT', entityType: 'Lead', entityId: 'bulk', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), user: { firstName: 'Admin', lastName: 'User', email: 'admin@realflow.com', role: 'ADMIN' } },
  { id: '5', action: 'DELETE', entityType: 'Lead', entityId: 'l3', ipAddress: '192.168.1.3', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), user: { firstName: 'Suresh', lastName: 'Kumar', email: 'suresh@realflow.com', role: 'MANAGER' } },
  { id: '6', action: 'CREATE', entityType: 'Booking', entityId: 'b1', ipAddress: '192.168.1.2', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), user: { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@realflow.com', role: 'AGENT' } },
  { id: '7', action: 'UPDATE', entityType: 'User', entityId: 'u3', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 86400000).toISOString(), user: { firstName: 'Admin', lastName: 'User', email: 'admin@realflow.com', role: 'ADMIN' } },
  { id: '8', action: 'EXPORT', entityType: 'Report', entityId: 'r1', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), user: { firstName: 'Admin', lastName: 'User', email: 'admin@realflow.com', role: 'ADMIN' } },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['audit-logs', actionFilter],
    queryFn: () => api.get('/audit-logs', { params: { action: actionFilter || undefined, limit: 100 } }).then(r => r.data),
    retry: false,
  });

  const logs: AuditLog[] = (data as { data?: AuditLog[] })?.data ?? (Array.isArray(data) ? data as AuditLog[] : DEMO_LOGS);

  const filtered = logs.filter(log => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return log.user?.email?.toLowerCase().includes(q) || log.entityType?.toLowerCase().includes(q) || log.action?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '18px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Admin Panel</span>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>→</span>
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Audit Logs</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>📋 Audit Logs</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Complete trail of all user actions and system events</p>
      </div>

      <div style={{ padding: '20px 28px' }}>
        {/* Action stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setActionFilter('')} style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${!actionFilter ? '#2563EB' : '#E2E8F0'}`, background: !actionFilter ? '#EFF6FF' : '#fff', color: !actionFilter ? '#2563EB' : '#64748B', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            All ({logs.length})
          </button>
          {Object.entries(ACTION_COLORS).map(([action, style]) => {
            const count = logs.filter(l => l.action === action).length;
            if (count === 0) return null;
            return (
              <button key={action} onClick={() => setActionFilter(actionFilter === action ? '' : action)}
                style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${actionFilter === action ? style.color : '#E2E8F0'}`, background: actionFilter === action ? style.bg : '#fff', color: actionFilter === action ? style.color : '#64748B', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                {style.icon} {action} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', marginBottom: 16 }}>
          <span style={{ color: '#94A3B8' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, entity or action..." style={{ border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', background: 'transparent', width: '100%' }} />
        </div>

        {/* Timeline */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Action', 'User', 'Entity', 'IP Address', 'Time'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', fontSize: 11, fontWeight: 700, color: '#64748B', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const ac = ACTION_COLORS[log.action] ?? { color: '#64748B', bg: '#F8FAFC', icon: '•' };
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F8FAFC', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: ac.color, background: ac.bg }}>
                        <span>{ac.icon}</span>
                        <span>{log.action}</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{log.user?.firstName} {log.user?.lastName}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{log.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{log.entityType}</div>
                      <div style={{ fontSize: 10, color: '#CBD5E1', fontFamily: 'monospace' }}>{log.entityId.slice(0, 12)}…</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B', fontFamily: 'monospace' }}>{log.ipAddress ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{timeAgo(log.createdAt)}</div>
                      <div style={{ fontSize: 10, color: '#CBD5E1' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>No audit logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
