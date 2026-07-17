'use client';

import { motion } from 'framer-motion';

const columns = [
  {
    title: 'New Leads', count: 47, dotColor: '#94a3b8', textColor: '#64748B',
    leads: [
      { name: 'Rohit Bansal', interest: '3BHK Skyline', value: '₹1.3 Cr', init: 'RB', bg: '#e2e8f0', col: '#475569' },
      { name: 'Simran Kaur', interest: '2BHK Crest', value: '₹82L', init: 'SK', bg: '#fce7f3', col: '#9d174d' },
      { name: 'Ajay Patel', interest: 'Villa Block D', value: '₹2.1 Cr', init: 'AP', bg: '#fed7aa', col: '#c2410c' },
    ],
  },
  {
    title: 'Contacted', count: 31, dotColor: '#3b82f6', textColor: '#2563EB',
    leads: [
      { name: 'Ankit Verma', interest: 'Plot 200 Sq Yd', value: '₹65L', init: 'AV', bg: '#dbeafe', col: '#1d4ed8' },
      { name: 'Meera Joshi', interest: '4BHK Penthouse', value: '₹2.4 Cr', init: 'MJ', bg: '#e0e7ff', col: '#4338ca' },
      { name: 'Vinay Sinha', interest: '3BHK Horizon', value: '₹1.1 Cr', init: 'VS', bg: '#cffafe', col: '#0e7490' },
    ],
  },
  {
    title: 'Site Visit', count: 18, dotColor: '#f59e0b', textColor: '#d97706',
    leads: [
      { name: 'Priya Mehta', interest: '2BHK Crest', value: '₹95L', init: 'PM', bg: '#fef3c7', col: '#92400e' },
      { name: 'Deepak Rao', interest: '3BHK Skyline', value: '₹1.6 Cr', init: 'DR', bg: '#fde68a', col: '#78350f' },
    ],
  },
  {
    title: 'Negotiation', count: 9, dotColor: '#8b5cf6', textColor: '#7c3aed',
    leads: [
      { name: 'Kavita Sharma', interest: 'Penthouse', value: '₹3.2 Cr', init: 'KS', bg: '#ede9fe', col: '#5b21b6' },
      { name: 'Arun Gupta', interest: '3BHK Horizon', value: '₹1.3 Cr', init: 'AG', bg: '#ddd6fe', col: '#4c1d95' },
    ],
  },
  {
    title: 'Booked ✓', count: 8, dotColor: '#10b981', textColor: '#059669',
    leads: [
      { name: 'Neha Saxena', interest: '2BHK Skyline', value: '₹88L', init: 'NS', bg: '#d1fae5', col: '#065f46' },
      { name: 'Vikram Nair', interest: '3BHK Villa', value: '₹1.9 Cr', init: 'VN', bg: '#a7f3d0', col: '#064e3b' },
    ],
  },
];

export default function SalesPipeline() {
  return (
    <section style={{ padding: '96px 0', background: '#ffffff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Sales Pipeline
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Track Every Deal From Lead to Booking
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
            style={{ fontSize: 16, color: '#64748B', maxWidth: 520, margin: '0 auto' }}>
            A visual Kanban pipeline with real-time updates and custom stages for your exact sales process.
          </motion.p>
        </div>

        {/* Kanban */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.18 }}
          style={{ overflowX: 'auto', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 16, minWidth: 900 }}>
            {columns.map((col) => (
              <div key={col.title} style={{ flex: 1, minWidth: 175 }}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.dotColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: col.textColor }}>{col.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', borderRadius: 999, padding: '2px 8px' }}>{col.count}</span>
                </div>
                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.leads.map((lead) => (
                    <div key={lead.name} style={{ background: '#ffffff', border: '1.5px solid #f1f5f9', borderRadius: 14, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: lead.bg, color: lead.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{lead.init}</div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{lead.name}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{lead.interest}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', background: '#eff6ff', padding: '2px 10px', borderRadius: 999 }}>{lead.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline value bar */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Total Pipeline Value: </span>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#2563EB' }}>₹12.4 Crore</span>
          <span style={{ fontSize: 14, color: '#94a3b8', marginLeft: 8 }}>across 113 active leads</span>
        </div>
      </div>
    </section>
  );
}
