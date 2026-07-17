'use client';

import { motion } from 'framer-motion';

const features = [
  'Real-time lead updates and push notifications',
  'Offline sync — works without internet on site visits',
  'Integrated call dialer and WhatsApp from one app',
  'GPS check-in for site visits with photo upload',
];

const leads = [
  { name: 'Priya Mehta', status: 'Site Visit Sched.', dot: '#f59e0b' },
  { name: 'Rohit Bansal', status: 'New Lead', dot: '#3b82f6' },
  { name: 'Ankit V.', status: 'Callback Due', dot: '#ef4444' },
];

export default function MobileApp() {
  return (
    <section style={{ padding: '96px 0', background: '#0f172a' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="mob-grid">
          {/* LEFT */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              Mobile App
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 20 }}>
              Manage Your Entire Business{' '}
              <span style={{ color: '#60a5fa' }}>from Your Phone</span>
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.75, marginBottom: 36 }}>
              The RealFlow mobile app for iOS and Android puts your complete CRM in your pocket — perfect for agents on the go, site visits, and weekend deals.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#93c5fd', fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#cbd5e1' }}>{f}</span>
                </div>
              ))}
            </div>
            {/* App store buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['App Store', 'Google Play'].map((store) => (
                <div key={store} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 22 }}>{store === 'App Store' ? '🍎' : '▶️'}</span>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>Coming Soon</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginTop: 2 }}>{store}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Phone Mockup */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              {/* Phone frame */}
              <div style={{ width: 240, background: '#1e293b', borderRadius: 40, padding: 10, border: '4px solid #334155', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
                {/* Notch */}
                <div style={{ background: '#0f172a', borderRadius: '30px 30px 0 0', padding: '10px 16px', display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                  <div style={{ width: 60, height: 5, background: '#334155', borderRadius: 999 }} />
                </div>
                {/* Screen */}
                <div style={{ background: '#0f172a', borderRadius: '0 0 30px 30px', padding: '12px 10px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>RealFlow</span>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>AK</div>
                  </div>
                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(37,99,235,0.2)', borderRadius: 12, padding: '10px 10px' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#60a5fa' }}>42</div>
                      <div style={{ fontSize: 10, color: '#60a5fa', opacity: 0.7 }}>My Leads</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.2)', borderRadius: 12, padding: '10px 10px' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#34d399' }}>8</div>
                      <div style={{ fontSize: 10, color: '#34d399', opacity: 0.7 }}>Today Calls</div>
                    </div>
                  </div>
                  {/* Leads list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {leads.map((l) => (
                      <div key={l.name} style={{ background: '#1e293b', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>{l.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{l.name}</div>
                          <div style={{ fontSize: 9, color: '#64748B' }}>{l.status}</div>
                        </div>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.dot, flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                  {/* Bottom nav */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', background: '#1e293b', borderRadius: 16, padding: '8px 0', marginTop: 10 }}>
                    {['🏠', '👥', '📞', '📊', '⚙️'].map((icon, i) => (
                      <span key={i} style={{ fontSize: 16, opacity: i === 0 ? 1 : 0.35, cursor: 'pointer' }}>{icon}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Badge */}
              <div style={{ position: 'absolute', top: -12, right: -12, background: '#2563EB', color: 'white', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 999, boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                Coming Soon
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { .mob-grid { grid-template-columns: 1fr !important; gap: 56px !important; } }`}</style>
    </section>
  );
}
