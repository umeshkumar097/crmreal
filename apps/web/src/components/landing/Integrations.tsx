'use client';

import { motion } from 'framer-motion';

const integrations = [
  { name: 'Meta Ads', color: '#1877F2', icon: '📘' },
  { name: 'Google Ads', color: '#EA4335', icon: '🔴' },
  { name: '99acres', color: '#E65C00', icon: '🏠' },
  { name: 'MagicBricks', color: '#C0392B', icon: '🧱' },
  { name: 'Housing.com', color: '#7B2D8B', icon: '🏡' },
  { name: 'Razorpay', color: '#2D6BE4', icon: '💳' },
  { name: 'Cashfree', color: '#059669', icon: '💰' },
  { name: 'PayU', color: '#EA4335', icon: '💵' },
  { name: 'WhatsApp', color: '#25D366', icon: '💬' },
  { name: 'Twilio', color: '#F22F46', icon: '📞' },
  { name: 'Zoom', color: '#2D8CFF', icon: '📹' },
  { name: 'Tally', color: '#3F51B5', icon: '📒' },
  { name: 'Google Sheets', color: '#0F9D58', icon: '📊' },
  { name: 'Zapier', color: '#FF4A00', icon: '⚡' },
  { name: 'Slack', color: '#4A154B', icon: '💼' },
  { name: 'IndiaMART', color: '#0A5A8A', icon: '🛒' },
  { name: 'PropTiger', color: '#1A3C6E', icon: '🐯' },
  { name: 'Excel', color: '#217346', icon: '📈' },
];

export default function Integrations() {
  return (
    <section id="integrations" style={{ padding: '96px 0', background: '#ffffff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Integrations
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 16 }}>
            40+ Integrations That Work Day One
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
            style={{ fontSize: 16, color: '#64748B', maxWidth: 520, margin: '0 auto' }}>
            Connect your portals, payment gateways, ad platforms, and communication tools without writing a single line of code.
          </motion.p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, maxWidth: 960, margin: '0 auto' }} className="int-grid">
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #f1f5f9',
                borderRadius: 16,
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'default',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              whileHover={{ borderColor: '#dbeafe', boxShadow: '0 4px 16px rgba(37,99,235,0.08)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', textAlign: 'center', lineHeight: 1.3 }}>{item.name}</span>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: 36, fontSize: 14, color: '#94a3b8' }}>
          And 22+ more integrations coming soon — including Salesforce, HubSpot, Zoho &amp; more
        </motion.p>
      </div>
      <style>{`
        @media (max-width: 768px) { .int-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 480px) { .int-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>
    </section>
  );
}
