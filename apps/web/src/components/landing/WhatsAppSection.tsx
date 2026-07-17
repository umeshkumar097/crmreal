'use client';

import { motion } from 'framer-motion';

const messages = [
  { side: 'left', text: 'Hi! I saw your ad for 3BHK in Skyline Tower. Interested to know more!', time: '10:12 AM' },
  { side: 'right', text: 'Hello! Thanks for reaching out 😊 Skyline offers spacious 3BHK from ₹1.4 Cr. Want to schedule a site visit?', time: '10:13 AM' },
  { side: 'left', text: 'Yes please. What are the amenities available?', time: '10:14 AM' },
  { side: 'right', text: 'Infinity pool, clubhouse, co-working lounge & 24/7 concierge. Sending brochure 📎', time: '10:14 AM' },
  { side: 'left', text: 'Looks amazing! Can I visit this Saturday?', time: '10:15 AM' },
  { side: 'right', text: '✅ Booked! Saturday 11 AM. Our exec Ravi will meet you at the site. See you! 🙌', time: '10:15 AM' },
];

const bullets = [
  'Two-way conversations with leads on WhatsApp',
  'Broadcast campaigns to segmented lead lists',
  'AI-powered auto-replies and appointment booking',
  'Team inbox — assign chats to agents by project',
];

export default function WhatsAppSection() {
  return (
    <section style={{ padding: '96px 0', background: '#f0fdf4' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="wa-grid">
          {/* LEFT */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              WhatsApp CRM
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 20 }}>
              Turn WhatsApp Into Your{' '}
              <span style={{ color: '#059669' }}>Most Powerful</span>{' '}
              Sales Channel
            </h2>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 32 }}>
              Connect the official Meta WhatsApp Business API to RealFlow and manage all your conversations, broadcasts, and automations in one shared team inbox.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {bullets.map((b) => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#059669', fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#374151' }}>{b}</span>
                </div>
              ))}
            </div>
            <a
              href="/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: '#059669', color: 'white', fontWeight: 700, fontSize: 14, borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}
            >
              Connect WhatsApp Free →
            </a>
          </motion.div>

          {/* RIGHT — Chat mockup */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div style={{ background: '#ffffff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #bbf7d0', maxWidth: 420, margin: '0 auto' }}>
              {/* WA Header */}
              <div style={{ background: '#075E54', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>PM</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Priya Mehta — Lead</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>online · portal.99acres.com</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: '#25D366', color: 'white', padding: '3px 10px', borderRadius: 999 }}>WhatsApp</div>
              </div>

              {/* Messages */}
              <div style={{ background: '#ECE5DD', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: 300, overflowY: 'auto' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.side === 'right' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '78%', padding: '9px 12px', borderRadius: msg.side === 'right' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.side === 'right' ? '#DCF8C6' : '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                      <p style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.5 }}>{msg.text}</p>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ background: '#F0F0F0', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, background: 'white', borderRadius: 999, padding: '8px 16px', fontSize: 12, color: '#94a3b8' }}>Type a message...</div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#075E54', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { .wa-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  );
}
