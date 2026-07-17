'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';

type SettingsTab = 'company' | 'users' | 'integrations' | 'notifications' | 'billing';

const TABS: { key: SettingsTab; label: string; icon: string }[] = [
  { key: 'company', label: 'Company', icon: '🏢' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'integrations', label: 'Integrations', icon: '🔌' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'billing', label: 'Billing', icon: '💳' },
];

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10,
  fontSize: 14, outline: 'none', color: '#0F172A', background: '#fff', boxSizing: 'border-box' as const,
};

function CompanyTab() {
  const [form, setForm] = useState({
    companyName: '', address: '', gstin: '', rera: '', email: '', phone: '',
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Company Settings</h2>

      {/* Logo Upload */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Company Logo</label>
        <div
          style={{
            width: 100, height: 100, borderRadius: 16, border: '2px dashed #CBD5E1',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: '#F8FAFC', transition: 'all 0.2s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6366F1'; }}
          onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#CBD5E1'; }}
        >
          <div style={{ fontSize: 28 }}>🏢</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Upload Logo</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <FieldGroup label="Company Name">
          <input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} style={inputStyle} placeholder="e.g. PropCRM Realty" />
        </FieldGroup>
        <FieldGroup label="Email">
          <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="admin@company.com" type="email" />
        </FieldGroup>
      </div>

      <FieldGroup label="Address">
        <textarea
          value={form.address}
          onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          placeholder="Company address..."
        />
      </FieldGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <FieldGroup label="GSTIN">
          <input value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} style={inputStyle} placeholder="22AAAAA0000A1Z5" />
        </FieldGroup>
        <FieldGroup label="RERA Number">
          <input value={form.rera} onChange={e => setForm(p => ({ ...p, rera: e.target.value }))} style={inputStyle} placeholder="RERA12345678" />
        </FieldGroup>
      </div>

      <FieldGroup label="Phone">
        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ ...inputStyle, width: '50%' }} placeholder="+91 98765 43210" />
      </FieldGroup>

      <button style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
        padding: '12px 32px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
        boxShadow: '0 4px 12px rgba(102,126,234,0.3)', marginTop: 8,
      }}>Save Changes</button>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94A3B8' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>This section is coming soon</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  const tabStyle = (isActive: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
    borderRadius: 10, cursor: 'pointer', border: 'none', textAlign: 'left' as const,
    background: isActive ? '#EFF6FF' : 'transparent',
    color: isActive ? '#3B82F6' : '#64748B',
    fontWeight: isActive ? 600 : 400, fontSize: 14, width: '100%',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Settings" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Settings</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Configure your CRM workspace</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          {/* Sidebar Tabs */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: 'fit-content' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabStyle(activeTab === t.key)}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {activeTab === 'company' && <CompanyTab />}
            {activeTab === 'users' && <PlaceholderTab label="User Management" />}
            {activeTab === 'integrations' && <PlaceholderTab label="Integrations" />}
            {activeTab === 'notifications' && <PlaceholderTab label="Notification Settings" />}
            {activeTab === 'billing' && <PlaceholderTab label="Billing & Subscription" />}
          </div>
        </div>
      </div>
    </div>
  );
}
