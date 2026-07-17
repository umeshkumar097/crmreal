'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface FeatureFlag {
  id: string; key: string; description: string; isEnabled: boolean; updatedAt: string;
}

const FLAG_ICONS: Record<string, string> = {
  whatsapp_integration: '💬',
  ai_copilot: '🤖',
  customer_portal: '🌐',
  advanced_reports: '📊',
  bulk_import: '📥',
  api_access: '🔌',
  sms_notifications: '📱',
  email_campaigns: '📧',
};

export default function FeatureFlagsPage() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => api.get('/feature-flags').then(r => r.data),
  });

  const flags: FeatureFlag[] = (data as { data?: FeatureFlag[] })?.data ?? (Array.isArray(data) ? data as FeatureFlag[] : []);

  const toggle = async (flag: FeatureFlag) => {
    setSaving(flag.id);
    try {
      await api.patch(`/feature-flags/${flag.id}`, { isEnabled: !flag.isEnabled });
      toast.success(`${flag.key} ${flag.isEnabled ? 'disabled' : 'enabled'}!`);
      qc.invalidateQueries({ queryKey: ['feature-flags'] });
    } catch {
      toast.error('Failed to update flag');
    } finally { setSaving(null); }
  };

  // Demo flags if API not ready
  const demoFlags: FeatureFlag[] = [
    { id: '1', key: 'whatsapp_integration', description: 'Enable WhatsApp messaging for lead communication', isEnabled: true, updatedAt: new Date().toISOString() },
    { id: '2', key: 'ai_copilot', description: 'AI-powered lead scoring, suggestions and automation', isEnabled: false, updatedAt: new Date().toISOString() },
    { id: '3', key: 'customer_portal', description: 'Self-service portal for customers to track their bookings', isEnabled: true, updatedAt: new Date().toISOString() },
    { id: '4', key: 'advanced_reports', description: 'Advanced analytics with cohort analysis and custom reports', isEnabled: false, updatedAt: new Date().toISOString() },
    { id: '5', key: 'bulk_import', description: 'Import leads and customers via Excel/CSV files', isEnabled: true, updatedAt: new Date().toISOString() },
    { id: '6', key: 'api_access', description: 'REST API access for third-party integrations', isEnabled: false, updatedAt: new Date().toISOString() },
    { id: '7', key: 'sms_notifications', description: 'SMS alerts for lead assignments and follow-up reminders', isEnabled: true, updatedAt: new Date().toISOString() },
    { id: '8', key: 'email_campaigns', description: 'Email drip campaigns for lead nurturing', isEnabled: false, updatedAt: new Date().toISOString() },
  ];

  const displayFlags = flags.length > 0 ? flags : demoFlags;
  const enabledCount = displayFlags.filter(f => f.isEnabled).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '18px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Admin Panel</span>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>→</span>
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Feature Flags</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>🚩 Feature Flags</h1>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Toggle features on/off without code deployment</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>{enabledCount}</div>
              <div style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>Enabled</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626' }}>{displayFlags.length - enabledCount}</div>
              <div style={{ fontSize: 11, color: '#991B1B', fontWeight: 600 }}>Disabled</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {(isLoading ? demoFlags : displayFlags).map(flag => (
            <div key={flag.id} style={{ background: '#fff', border: `1.5px solid ${flag.isEnabled ? '#BBF7D0' : '#E2E8F0'}`, borderRadius: 16, padding: '20px 22px', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: flag.isEnabled ? '#ECFDF5' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `1px solid ${flag.isEnabled ? '#BBF7D0' : '#E2E8F0'}` }}>
                    {FLAG_ICONS[flag.key] ?? '🔧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                      {flag.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{flag.description}</div>
                    <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 8 }}>
                      Key: <code style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: 4 }}>{flag.key}</code>
                    </div>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => toggle(flag)}
                  disabled={saving === flag.id}
                  style={{
                    width: 52, height: 28, borderRadius: 999, border: 'none', cursor: saving === flag.id ? 'not-allowed' : 'pointer',
                    background: flag.isEnabled ? '#10B981' : '#CBD5E1',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, left: flag.isEnabled ? 27 : 3,
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: flag.isEnabled ? '#059669' : '#94A3B8' }}>
                  {flag.isEnabled ? '● Active' : '○ Inactive'}
                </span>
                <span style={{ fontSize: 10, color: '#CBD5E1' }}>
                  Updated {new Date(flag.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
