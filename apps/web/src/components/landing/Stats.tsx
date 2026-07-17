'use client';

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const metrics = [
  { value: '1M+', label: 'Leads Managed', desc: 'Across premium residential & commercial projects' },
  { value: '500+', label: 'Real Estate Builders', desc: 'Top-tier builders using RealFlow for inventory management' },
  { value: '50K+', label: 'Successful Bookings', desc: 'Deals closed with automated allotment workflows' },
  { value: '99.99%', label: 'Platform Uptime', desc: 'Backed by Azure enterprise-grade cloud infrastructure' },
];

const brands = ['DLF Limited', 'Godrej Properties', 'Tata Housing', 'Lodha Group', 'Sobha Realty', 'Prestige Group'];

export default function Stats() {
  return (
    <section style={{ padding: '64px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Trusted by label */}
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>
          Trusted by 1000+ builders, brokers &amp; channel partners
        </p>

        {/* Brand logos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px 32px', marginBottom: 48 }}>
          {brands.map((brand) => (
            <div key={brand} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
              <Building2 size={14} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{brand}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e2e8f0', marginBottom: 48 }} />

        {/* Metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }} className="metrics-grid">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 900, color: '#2563EB', lineHeight: 1, marginBottom: 6 }}>{m.value}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) { .metrics-grid { grid-template-columns: repeat(4, 1fr) !important; } }
      `}</style>
    </section>
  );
}
