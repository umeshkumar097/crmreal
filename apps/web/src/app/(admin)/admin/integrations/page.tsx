'use client';
export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '18px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Admin Panel</span>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>→</span>
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Integrations</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>🔌 Integrations</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>WhatsApp, AI, SMS, email and third-party API configuration</p>
      </div>
      <div style={{ padding: '60px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Coming Soon</h2>
        <p style={{ fontSize: 14, color: '#64748B', maxWidth: 400 }}>Integration configuration panel for all third-party providers.</p>
        <div style={{ marginTop: 24, padding: '8px 20px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13, color: '#92400E', fontWeight: 600 }}>🛡️ Admin Only</div>
      </div>
    </div>
  );
}
