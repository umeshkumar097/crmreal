'use client';

import { useAuthStore } from '@/store';
import Link from 'next/link';

const QUICK_STATS = [
  { label: 'Total Users', value: '—', icon: '👤', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Active Leads', value: '—', icon: '👥', color: '#10B981', bg: '#ECFDF5' },
  { label: 'Monthly Revenue', value: '—', icon: '💰', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Bookings Today', value: '—', icon: '📅', color: '#8B5CF6', bg: '#F5F3FF' },
];

const ADMIN_MODULES = [
  { href: '/admin/users', icon: '👤', title: 'User Management', desc: 'Add, edit, remove users. Assign roles and permissions to team members.', color: '#2563EB', bg: '#EFF6FF' },
  { href: '/admin/roles', icon: '🛡️', title: 'Roles & Permissions', desc: 'Define what each role can access. Control feature-level permissions.', color: '#8B5CF6', bg: '#F5F3FF' },
  { href: '/admin/settings', icon: '⚙️', title: 'System Settings', desc: 'Configure CRM name, branding, timezone, currency, and notifications.', color: '#0EA5E9', bg: '#F0F9FF' },
  { href: '/admin/feature-flags', icon: '🚩', title: 'Feature Flags', desc: 'Enable or disable features like AI, WhatsApp, Customer Portal per plan.', color: '#F59E0B', bg: '#FFFBEB' },
  { href: '/admin/billing', icon: '💳', title: 'Billing & Plans', desc: 'Manage subscription plan, payment methods, and billing history.', color: '#10B981', bg: '#ECFDF5' },
  { href: '/admin/hr', icon: '🏢', title: 'HR & Employees', desc: 'Manage employee records, departments, designations and attendance.', color: '#EF4444', bg: '#FEF2F2' },
  { href: '/admin/audit-logs', icon: '📋', title: 'Audit Logs', desc: 'Full audit trail of all user actions, logins, and data changes.', color: '#64748B', bg: '#F8FAFC' },
  { href: '/admin/reports', icon: '📈', title: 'System Reports', desc: 'Platform-wide analytics — lead conversion, revenue, agent performance.', color: '#6366F1', bg: '#EEF2FF' },
  { href: '/admin/channel-partners', icon: '🤝', title: 'Channel Partners', desc: 'Manage channel partner accounts, commissions, and referral tracking.', color: '#EC4899', bg: '#FDF2F8' },
  { href: '/admin/integrations', icon: '🔌', title: 'Integrations', desc: 'WhatsApp, AI providers, SMS, email, storage and third-party APIs.', color: '#14B8A6', bg: '#F0FDFA' },
  { href: '/admin/activity', icon: '⚡', title: 'Activity Feed', desc: 'Real-time stream of all platform events and system notifications.', color: '#F97316', bg: '#FFF7ED' },
  { href: '/admin/analytics', icon: '📊', title: 'Platform Analytics', desc: 'Advanced usage metrics, cohort analysis, and performance KPIs.', color: '#0284C7', bg: '#F0F9FF' },
];

export default function AdminHomePage() {
  const { user } = useAuthStore();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4, letterSpacing: '-0.02em' }}>
            {greeting}, {user?.firstName} 👋
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{ padding: '8px 16px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            ← User Dashboard
          </Link>
          <div style={{ padding: '8px 14px', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
            🛡️ {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div style={{ padding: '28px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {QUICK_STATS.map((stat) => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{stat.icon}</div>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Today</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Modules Grid */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Admin Modules</h2>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>All administrative controls in one place — only visible to ADMIN & SUPER_ADMIN roles.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {ADMIN_MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16,
                padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: mod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {mod.icon}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{mod.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{mod.desc}</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4, color: mod.color, fontSize: 12, fontWeight: 600 }}>
                  <span>Open</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Danger zone */}
        <div style={{ marginTop: 32, background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#991B1B' }}>Restricted Area</h3>
          </div>
          <p style={{ fontSize: 13, color: '#B91C1C', lineHeight: 1.6 }}>
            You are in the Admin Panel. Actions here affect all users in the organization.
            Changes to roles, settings, and feature flags take effect immediately.
            Only <strong>ADMIN</strong> and <strong>SUPER_ADMIN</strong> users can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
