'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['Lead Pipeline', 'Inventory', 'WhatsApp', 'AI Calling', 'Reports'] as const;
type Tab = (typeof TABS)[number];

// ─── Lead Pipeline ─────────────────────────────────────────────────────────────
const COLS = [
  { label: 'New', dotColor: '#94a3b8', pillBg: '#f1f5f9', pillColor: '#64748B',
    leads: [{ name: 'Rajesh Kumar', interest: 'Villa 3BHK', value: '₹1.8 Cr' }, { name: 'Sunita Patel', interest: 'Apt 2BHK', value: '₹82L' }] },
  { label: 'Contacted', dotColor: '#3b82f6', pillBg: '#eff6ff', pillColor: '#2563EB',
    leads: [{ name: 'Ankit Verma', interest: 'Plot 200 Sq Yd', value: '₹65L' }, { name: 'Meera Joshi', interest: 'Villa 4BHK', value: '₹2.4 Cr' }, { name: 'Rohit Singh', interest: 'Apt 3BHK', value: '₹1.1 Cr' }] },
  { label: 'Site Visit', dotColor: '#f59e0b', pillBg: '#fffbeb', pillColor: '#d97706',
    leads: [{ name: 'Priya Mehta', interest: 'Apt 2BHK', value: '₹95L' }, { name: 'Deepak Rao', interest: 'Villa 3BHK', value: '₹1.6 Cr' }] },
  { label: 'Negotiation', dotColor: '#8b5cf6', pillBg: '#f5f3ff', pillColor: '#7c3aed',
    leads: [{ name: 'Kavita Sharma', interest: 'Penthouse', value: '₹3.2 Cr' }, { name: 'Arun Gupta', interest: 'Apt 3BHK', value: '₹1.3 Cr' }] },
  { label: 'Booked ✓', dotColor: '#10b981', pillBg: '#ecfdf5', pillColor: '#059669',
    leads: [{ name: 'Neha Saxena', interest: 'Apt 2BHK', value: '₹88L' }, { name: 'Vikram Nair', interest: 'Villa 3BHK', value: '₹1.9 Cr' }] },
];

function LeadPipeline() {
  return (
    <div style={{ padding: 20, overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 14, minWidth: 720 }}>
        {COLS.map((col) => (
          <div key={col.label} style={{ flex: 1, minWidth: 130 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: col.pillBg, borderRadius: 999, marginBottom: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.dotColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: col.pillColor }}>{col.label}</span>
              <span style={{ fontSize: 10, color: col.dotColor, opacity: 0.7 }}>{col.leads.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.leads.map((lead) => (
                <div key={lead.name} style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{lead.name}</p>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>{lead.interest}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', background: '#eff6ff', padding: '2px 8px', borderRadius: 999 }}>{lead.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inventory ─────────────────────────────────────────────────────────────────
const TOWERS = [
  { name: 'Tower A — Skyline', total: 48, available: 14, booked: 28, blocked: 6, floors: 12 },
  { name: 'Tower B — Crest', total: 64, available: 22, booked: 38, blocked: 4, floors: 16 },
  { name: 'Tower C — Horizon', total: 32, available: 5, booked: 24, blocked: 3, floors: 8 },
  { name: 'Villa Block D', total: 20, available: 8, booked: 11, blocked: 1, floors: 2 },
];

function Inventory() {
  return (
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {TOWERS.map((t) => {
        const ap = Math.round((t.available / t.total) * 100);
        const bp = Math.round((t.booked / t.total) * 100);
        return (
          <div key={t.name} style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{t.name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.floors} Floors · {t.total} Units</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>{ap}% Free</span>
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, display: 'flex', overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ width: `${ap}%`, background: '#34d399' }} />
              <div style={{ width: `${bp}%`, background: '#3b82f6' }} />
              <div style={{ flex: 1, background: '#fbbf24' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ color: '#34d399', label: `${t.available} Available` }, { color: '#3b82f6', label: `${t.booked} Booked` }, { color: '#fbbf24', label: `${t.blocked} Blocked` }].map((s) => (
                <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#64748B' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block' }} />{s.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── WhatsApp ──────────────────────────────────────────────────────────────────
const WA_MSGS = [
  { side: 'left', text: 'Hi, I saw your ad for 3BHK in Skyline Tower. Can you share more details?', time: '10:12 AM' },
  { side: 'right', text: 'Hello Priya! Thanks 😊 Skyline offers 3BHK from ₹1.4 Cr. Schedule a site visit?', time: '10:13 AM' },
  { side: 'left', text: 'Yes please. What amenities?', time: '10:14 AM' },
  { side: 'right', text: 'Infinity pool, clubhouse, co-working lounge & concierge. Sending brochure 📎', time: '10:15 AM' },
  { side: 'left', text: 'Looks great! Can I visit Saturday?', time: '10:16 AM' },
  { side: 'right', text: '✅ Booked! Saturday 11 AM. Our exec Ravi will meet you. See you! 🙌', time: '10:17 AM' },
];

function WhatsApp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
      <div style={{ background: '#075E54', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>P</div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Priya Mehta</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>online</p>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#25D366', color: 'white', padding: '2px 8px', borderRadius: 999 }}>WhatsApp</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: '#ECE5DD', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {WA_MSGS.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.side === 'right' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: msg.side === 'right' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', background: msg.side === 'right' ? '#DCF8C6' : '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: 11, color: '#1a1a1a', lineHeight: 1.5 }}>{msg.text}</p>
              <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 3, textAlign: 'right' }}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#F0F0F0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, background: 'white', borderRadius: 999, padding: '7px 14px', fontSize: 11, color: '#94a3b8' }}>Type a message...</div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#075E54', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </div>
      </div>
    </div>
  );
}

// ─── AI Calling ────────────────────────────────────────────────────────────────
const CALLS = [
  { name: 'Raj Sharma', number: '+91 98765 43210', duration: '3m 42s', status: 'Qualified', statusColor: '#059669', statusBg: '#ecfdf5', next: 'Schedule Visit' },
  { name: 'Ananya Bose', number: '+91 87654 32109', duration: '1m 18s', status: 'Callback', statusColor: '#d97706', statusBg: '#fffbeb', next: 'Call Tomorrow 10AM' },
  { name: 'Mohit Agarwal', number: '+91 76543 21098', duration: '4m 05s', status: 'Hot Lead', statusColor: '#dc2626', statusBg: '#fef2f2', next: 'Send Proposal' },
  { name: 'Pooja Nair', number: '+91 65432 10987', duration: '0m 52s', status: 'Not Interested', statusColor: '#64748B', statusBg: '#f1f5f9', next: 'Archive' },
  { name: 'Sanjay Tiwari', number: '+91 54321 09876', duration: '2m 31s', status: 'Qualified', statusColor: '#059669', statusBg: '#ecfdf5', next: 'Schedule Visit' },
];

function AICalling() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>AI Agent — Active · 5 calls today</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['Name', 'Number', 'Duration', 'Status', 'Next Action'].map((h) => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textAlign: 'left', padding: '0 16px 10px 0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CALLS.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '12px 16px 12px 0', fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#3b82f6' }}>📞</span>
                    {row.name}
                  </div>
                </td>
                <td style={{ padding: '12px 16px 12px 0', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{row.number}</td>
                <td style={{ padding: '12px 16px 12px 0', fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>⏱ {row.duration}</td>
                <td style={{ padding: '12px 16px 12px 0', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: row.statusColor, background: row.statusBg, padding: '3px 8px', borderRadius: 999 }}>{row.status}</span>
                </td>
                <td style={{ padding: '12px 0', fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>{row.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reports ───────────────────────────────────────────────────────────────────
const METRICS = [
  { label: 'Total Revenue', value: '₹14.8 Cr', change: '+22%', up: true },
  { label: 'Units Booked', value: '118', change: '+9%', up: true },
  { label: 'Active Leads', value: '2,430', change: '+34%', up: true },
  { label: 'Conversion Rate', value: '4.86%', change: '-0.3%', up: false },
];

const BARS = [
  { month: 'Feb', pct: 55 }, { month: 'Mar', pct: 68 }, { month: 'Apr', pct: 80 },
  { month: 'May', pct: 62 }, { month: 'Jun', pct: 90 }, { month: 'Jul', pct: 100 },
];

function Reports() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 14 }}>
            <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{m.value}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 10, fontWeight: 700, color: m.up ? '#059669' : '#dc2626' }}>
              <span>{m.up ? '↑' : '↓'}</span> {m.change} vs last month
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 16 }}>Revenue by Month (₹ in Lakhs)</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
          {BARS.map((b) => (
            <div key={b.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', background: '#3b82f6', borderRadius: '4px 4px 0 0', opacity: 0.5 + b.pct * 0.005, height: `${b.pct}%` }} />
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{b.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const TAB_CONTENT: Record<Tab, React.ReactNode> = {
  'Lead Pipeline': <LeadPipeline />,
  'Inventory': <Inventory />,
  'WhatsApp': <WhatsApp />,
  'AI Calling': <AICalling />,
  'Reports': <Reports />,
};

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('Lead Pipeline');

  return (
    <section style={{ padding: '96px 0', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Live Platform Preview
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Every Tool Your Sales Team Needs
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
            style={{ fontSize: 16, color: '#64748B', maxWidth: 500, margin: '0 auto' }}>
            Explore the actual platform — leads, inventory, WhatsApp, AI calls, and analytics in one place.
          </motion.p>
        </div>

        {/* Tab bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.18 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 6, display: 'inline-flex', flexWrap: 'wrap', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.18s',
                  background: activeTab === tab ? '#2563EB' : 'transparent',
                  color: activeTab === tab ? '#ffffff' : '#64748B',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.22 }}
          style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', minHeight: 400 }}>
            {/* Browser chrome */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#34d399' }} />
              </div>
              <div style={{ flex: 1, maxWidth: 320, margin: '0 auto' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                  app.realflowcrm.com/{activeTab.toLowerCase().replace(' ', '-')}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                {TAB_CONTENT[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
