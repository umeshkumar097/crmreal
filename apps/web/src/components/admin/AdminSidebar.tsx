'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ADMIN_NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', icon: '🏠', label: 'Admin Home', exact: true },
      { href: '/admin/analytics', icon: '📊', label: 'Platform Analytics' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { href: '/admin/users', icon: '👤', label: 'User Management' },
      { href: '/admin/roles', icon: '🛡️', label: 'Roles & Permissions' },
      { href: '/admin/hr', icon: '🏢', label: 'HR & Employees' },
      { href: '/admin/channel-partners', icon: '🤝', label: 'Channel Partners' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/settings', icon: '⚙️', label: 'System Settings' },
      { href: '/admin/feature-flags', icon: '🚩', label: 'Feature Flags' },
      { href: '/admin/integrations', icon: '🔌', label: 'Integrations' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/billing', icon: '💳', label: 'Billing & Plans' },
      { href: '/admin/subscriptions', icon: '📦', label: 'Subscriptions' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { href: '/admin/audit-logs', icon: '📋', label: 'Audit Logs' },
      { href: '/admin/reports', icon: '📈', label: 'System Reports' },
      { href: '/admin/activity', icon: '⚡', label: 'Activity Feed' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('tenant_id');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const w = collapsed ? 64 : 256;

  return (
    <aside style={{
      width: w, minHeight: '100vh', background: '#0F172A',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease',
      flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto', overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🛡️</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>Admin Panel</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>RealFlow CRM</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, margin: '0 auto' }}>🛡️</div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4, fontSize: 12, flexShrink: 0 }}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div style={{ margin: '10px 12px 0', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>⭐</span>
          <span style={{ fontSize: 11, color: '#FCD34D', fontWeight: 700 }}>{user?.role?.replace('_', ' ')}</span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {ADMIN_NAV.map((section) => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 3px' }}>
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '9px 0' : '8px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 9, textDecoration: 'none', marginBottom: 2,
                    background: active ? 'rgba(245,158,11,0.15)' : 'transparent',
                    color: active ? '#FCD34D' : 'rgba(255,255,255,0.5)',
                    fontWeight: active ? 700 : 400, fontSize: 13, transition: 'all 0.15s',
                    borderLeft: active ? '3px solid #F59E0B' : '3px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </Link>
              );
            })}
            {!collapsed && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '4px 4px' }} />}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 8px' }}>
        {/* Back to Dashboard */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 9, textDecoration: 'none', marginBottom: 6,
            background: 'rgba(37,99,235,0.12)',
            border: '1px solid rgba(37,99,235,0.2)',
            color: '#60A5FA', fontSize: 12, fontWeight: 600,
          }}
          title={collapsed ? 'Back to Dashboard' : undefined}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>← </span>
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{user?.email}</div>
              </div>
              <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, padding: 4 }}>
                🚪
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
