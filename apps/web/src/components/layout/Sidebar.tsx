'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/store';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// ─── User Dashboard Nav ─────────────────────────────────────────────────────
const USER_NAV = [
  {
    label: 'CRM',
    items: [
      { href: '/dashboard', icon: '📊', label: 'Dashboard', exact: true },
      { href: '/dashboard/leads', icon: '👥', label: 'Leads' },
      { href: '/dashboard/customers', icon: '✅', label: 'Customers' },
      { href: '/dashboard/follow-ups', icon: '📋', label: 'Follow-Ups' },
      { href: '/dashboard/tasks', icon: '☑️', label: 'My Tasks' },
    ],
  },
  {
    label: 'Properties',
    items: [
      { href: '/dashboard/properties', icon: '🏢', label: 'Properties' },
      { href: '/dashboard/inventory', icon: '🏠', label: 'Inventory' },
      { href: '/dashboard/builders', icon: '⚒️', label: 'Builders' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/dashboard/bookings', icon: '📅', label: 'Bookings' },
      { href: '/dashboard/payments', icon: '💳', label: 'Payments' },
      { href: '/dashboard/collections', icon: '🏦', label: 'Collections' },
    ],
  },
  {
    label: 'Engage',
    items: [
      { href: '/dashboard/whatsapp', icon: '💬', label: 'WhatsApp' },
      { href: '/dashboard/marketing', icon: '📣', label: 'Campaigns' },
      { href: '/dashboard/documents', icon: '📁', label: 'Documents' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/dashboard/ai', icon: '🤖', label: 'AI Copilot' },
      { href: '/dashboard/reports', icon: '📈', label: 'My Reports' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('tenant_id');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <aside style={{
      width: sidebarOpen ? 240 : 64,
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {sidebarOpen ? (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏠</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>RealFlow CRM</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>by AICLEX</div>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏠</div>
          </Link>
        )}
        <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4, fontSize: 12, flexShrink: 0 }}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {USER_NAV.map((section) => (
          <div key={section.label} style={{ marginBottom: 8 }}>
            {sidebarOpen && (
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 8px 4px' }}>
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
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: sidebarOpen ? '8px 10px' : '10px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    borderRadius: 9,
                    textDecoration: 'none',
                    marginBottom: 2,
                    background: active ? 'rgba(37,99,235,0.2)' : 'transparent',
                    color: active ? '#60A5FA' : 'rgba(255,255,255,0.55)',
                    fontWeight: active ? 700 : 400,
                    fontSize: 13,
                    transition: 'all 0.15s',
                    borderLeft: active ? '3px solid #2563EB' : '3px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </Link>
              );
            })}
            {sidebarOpen && <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '6px 4px' }} />}
          </div>
        ))}
      </nav>

      {/* Bottom — Admin switch + user info */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 8px' }}>
        {/* Admin Panel Button — only for admins */}
        {isAdmin && (
          <Link
            href="/admin"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarOpen ? '9px 10px' : '9px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: 9, textDecoration: 'none',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
              color: '#FCD34D', fontWeight: 700, fontSize: 12,
              marginBottom: 8,
            }}
            title={!sidebarOpen ? 'Admin Panel' : undefined}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>🛡️</span>
            {sidebarOpen && <span>Admin Panel</span>}
          </Link>
        )}

        {/* User Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</div>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, padding: 4 }}>
              🚪
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
