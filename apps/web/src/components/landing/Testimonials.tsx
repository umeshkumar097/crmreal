'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: 'RealFlow CRM transformed our sales process completely. Lead conversion went up 34% in just 3 months. The WhatsApp integration alone saves our team 4 hours daily.',
    name: 'Aakash Kumar',
    title: 'VP Sales, DLF Residential',
    company: 'DLF Limited',
    init: 'AK', bg: '#dbeafe', col: '#1d4ed8',
  },
  {
    quote: 'The AI calling agent is a complete game changer. It calls our portal leads instantly and qualifies them before our team even picks up the phone. ROI visible in the first week.',
    name: 'Sunita Mehta',
    title: 'Head of CRM, Godrej Properties',
    company: 'Godrej Properties',
    init: 'SM', bg: '#d1fae5', col: '#065f46',
  },
  {
    quote: 'Inventory management, payment tracking, and document generation all in one place. Our broker network coordination improved drastically. Highly recommended for large developers.',
    name: 'Rohit Bansal',
    title: 'Director Sales, Tata Housing',
    company: 'Tata Housing',
    init: 'RB', bg: '#ede9fe', col: '#4c1d95',
  },
];

const outcomes = [
  { value: '34%', label: 'Higher Conversion' },
  { value: '4 hrs', label: 'Saved Daily Per Agent' },
  { value: '3×', label: 'Faster Lead Response' },
];

export default function Testimonials() {
  return (
    <section style={{ padding: '96px 0', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Customer Stories
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Trusted by India's Leading Real Estate Firms
          </motion.h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 56 }} className="test-grid">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                {[0,1,2,3,4].map((s) => <span key={s} style={{ fontSize: 16, color: '#f59e0b' }}>★</span>)}
              </div>
              {/* Quote */}
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, fontStyle: 'italic', flex: 1, marginBottom: 28 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.bg, color: t.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{t.init}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{t.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', marginTop: 2 }}>{t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Outcome strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64, flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {outcomes.map((o) => (
            <div key={o.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>{o.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginTop: 6 }}>{o.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .test-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 640px) and (max-width: 1024px) { .test-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </section>
  );
}
