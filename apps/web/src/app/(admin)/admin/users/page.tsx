'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface User {
  id: string; email: string; firstName: string; lastName: string;
  role: string; isActive: boolean; phone?: string;
  lastLoginAt?: string; createdAt: string;
}

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'CHANNEL_PARTNER'];
const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  SUPER_ADMIN: { color: '#7C3AED', bg: '#F5F3FF' },
  ADMIN: { color: '#DC2626', bg: '#FEF2F2' },
  MANAGER: { color: '#2563EB', bg: '#EFF6FF' },
  AGENT: { color: '#059669', bg: '#ECFDF5' },
  CHANNEL_PARTNER: { color: '#D97706', bg: '#FFFBEB' },
};

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'AGENT', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', form);
      toast.success(`User ${form.firstName} ${form.lastName} created!`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create user';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', outline: 'none', width: '100%', boxSizing: 'border-box', background: '#F8FAFC' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)', padding: '20px 24px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>➕ Add New User</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Create a team member account</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>First Name *</label>
              <input style={inp} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required placeholder="Rahul" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Last Name *</label>
              <input style={inp} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required placeholder="Sharma" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Email *</label>
            <input style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="rahul@company.com" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Phone</label>
            <input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Password *</label>
            <input style={inp} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 characters" minLength={8} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Role *</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : '✓ Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => api.get('/users', { params: { search, role: roleFilter || undefined, limit: 50 } }).then(r => r.data),
  });

  const users: User[] = (data as { data?: User[] })?.data ?? (Array.isArray(data) ? data as User[] : []);

  const toggleActive = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      toast.success(`${user.firstName} ${user.isActive ? 'deactivated' : 'activated'}`);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Admin Panel</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>→</span>
            <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>User Management</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>👤 User Management</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Manage team members, roles and access levels</p>
        </div>
        <button onClick={() => setShowInvite(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          ➕ Add User
        </button>
      </div>

      <div style={{ padding: '20px 28px' }}>
        {/* Role summary pills */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {ROLES.map(role => {
            const count = users.filter(u => u.role === role).length;
            const rc = ROLE_COLORS[role];
            return (
              <button key={role} onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${roleFilter === role ? rc.color : '#E2E8F0'}`, background: roleFilter === role ? rc.bg : '#fff', color: roleFilter === role ? rc.color : '#64748B', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                {role.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', flex: 1 }}>
            <span style={{ color: '#94A3B8' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', background: 'transparent', width: '100%' }} />
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', whiteSpace: 'nowrap' }}>{users.length} users</div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['User', 'Email', 'Phone', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#64748B', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 14, width: [120, 160, 100, 80, 60, 90, 60][j], background: '#F1F5F9', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const rc = ROLE_COLORS[user.role] ?? { color: '#64748B', bg: '#F8FAFC' };
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{user.firstName} {user.lastName}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>ID: {user.id.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{user.email}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{user.phone ?? '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: rc.color, background: rc.bg }}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: user.isActive ? '#059669' : '#DC2626', background: user.isActive ? '#ECFDF5' : '#FEF2F2' }}>
                          {user.isActive ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#94A3B8' }}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => toggleActive(user)} style={{ padding: '5px 12px', border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: user.isActive ? '#DC2626' : '#059669' }}>
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['admin-users'] })} />}
    </div>
  );
}
