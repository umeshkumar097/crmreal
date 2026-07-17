'use client';

import { motion } from 'framer-motion';

const bullets = [
  { title: 'AI Lead Scoring', desc: 'Automatically ranks your hottest leads by behaviour, source, and engagement.' },
  { title: 'Smart Follow-up Engine', desc: 'AI schedules the next touchpoint — call, WhatsApp, or email — based on lead signals.' },
  { title: 'AI Calling Agent', desc: 'Voice AI calls and qualifies inbound leads 24/7 without human involvement.' },
  { title: 'Predictive Deal Insights', desc: 'Forecast which deals are likely to close this month with up to 87% accuracy.' },
];

const feed = [
  { text: 'AI called Raj Sharma — Qualified Lead', badge: 'Qualified', badgeColor: '#059669', badgeBg: '#ecfdf5', dot: '#34d399', time: '2m ago' },
  { text: 'Score updated: Priya Mehta → 94/100', badge: 'Scored', badgeColor: '#2563EB', badgeBg: '#eff6ff', dot: '#60a5fa', time: '5m ago' },
  { text: '3 follow-ups auto-scheduled for tomorrow', badge: 'Scheduled', badgeColor: '#d97706', badgeBg: '#fffbeb', dot: '#fbbf24', time: '12m ago' },
  { text: 'Site visit confirmed — Ankit Verma, Sat 11 AM', badge: 'Confirmed', badgeColor: '#059669', badgeBg: '#ecfdf5', dot: '#34d399', time: '18m ago' },
  { text: 'Campaign sent to 240 leads via WhatsApp', badge: 'Sent', badgeColor: '#7c3aed', badgeBg: '#f5f3ff', dot: '#a78bfa', time: '34m ago' },
];

export default function AISection() {
  return (
    <section id="solutions" style={{ padding: '96px 0', background: '#ffffff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="ai-grid">
          {/* LEFT */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              AI-Powered Intelligence
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 20 }}>
              Your Always-On<br />
              <span style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                AI Sales Assistant
              </span>
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.75, marginBottom: 36 }}>
              RealFlow's AI layer works silently in the background — scoring leads, scheduling calls, predicting closures, and generating follow-up actions so your team focuses on selling.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
              {bullets.map((b) => (
                <div key={b.title} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ecfdf5', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: '#059669' }}>✓</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <a href="#" style={{ fontSize: 14, fontWeight: 700, color: '#2563EB', textDecoration: 'none' }}>
              Explore AI Features →
            </a>
          </motion.div>

          {/* RIGHT */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 24, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #2563EB, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>RealFlow AI</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: 12, color: '#64748B' }}>Live Activity Feed</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {feed.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#ffffff', borderRadius: 12, padding: '12px 14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{item.text}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{item.time}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: item.badgeColor, background: item.badgeBg, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {item.badge}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .ai-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }
      `}</style>
    </section>
  );
}
