'use client';

import { motion } from 'framer-motion';

const features = [
  { icon: '👥', title: 'Lead Management', desc: 'Capture, score, and nurture leads from portals, ads, and referrals with intelligent automation.', accent: '#2563EB', light: '#eff6ff' },
  { icon: '🏢', title: 'Inventory Management', desc: 'Manage all towers, units, floor plans, and pricing in one structured inventory system.', accent: '#8B5CF6', light: '#f5f3ff' },
  { icon: '📋', title: 'Booking & Allotment', desc: 'Digital booking forms, cost sheets, and allotment letters with e-signature built-in.', accent: '#10B981', light: '#f0fdf4' },
  { icon: '💳', title: 'Payment Tracking', desc: 'Demand letters, payment schedules, collection tracking and instant receipt generation.', accent: '#F59E0B', light: '#fffbeb' },
  { icon: '💬', title: 'WhatsApp CRM', desc: 'Two-way WhatsApp messaging, broadcast campaigns, and automated smart follow-ups.', accent: '#059669', light: '#ecfdf5' },
  { icon: '🤖', title: 'AI Calling Agent', desc: 'AI voice agents that call, qualify, and schedule site visits 24/7 — zero human effort.', accent: '#6366F1', light: '#eef2ff' },
  { icon: '📍', title: 'Site Visit Management', desc: 'Schedule, track, and follow-up site visits with GPS check-in and automated reminders.', accent: '#EF4444', light: '#fef2f2' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Real-time sales funnels, team performance, and revenue forecasting dashboards.', accent: '#0EA5E9', light: '#f0f9ff' },
  { icon: '🌐', title: 'Multi-Branch Support', desc: 'Manage multiple projects, branches, and channel partners from a single account.', accent: '#475569', light: '#f8fafc' },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: '96px 0', background: '#ffffff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            All-in-One CRM Suite
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 640, margin: '0 auto', marginBottom: 16 }}>
            Engineered Specially for Large-Scale Real Estate
          </h2>
          <p style={{ fontSize: 16, color: '#64748B', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Eliminate Excel files and disconnected tools. RealFlow unifies your entire sales workflow.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="feat-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #f1f5f9',
                borderRadius: 20,
                padding: 28,
                cursor: 'default',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', borderColor: '#dbeafe' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .feat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .feat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
