'use client';
export default function AnalyticsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '18px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Admin Panel</span>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>→</span>
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Analytics</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>📊 Platform Analytics</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Advanced usage metrics, cohort analysis and KPIs</p>
      </div>
      <div style={{ padding: '60px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Coming Soon</h2>
        <p style={{ fontSize: 14, color: '#64748B', maxWidth: 400 }}>This admin module is being built. Check back soon.</p>
        <div style={{ marginTop: 24, padding: '8px 20px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13, color: '#92400E', fontWeight: 600 }}>🛡️ Admin Only</div>
      </div>
    </div>
  );
}
