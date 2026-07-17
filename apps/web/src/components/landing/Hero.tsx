'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';

const stats = [
  { label: 'LEADS', value: '142', change: '+12%', changeColor: '#10B981', changeBg: '#f0fdf4' },
  { label: 'SALES', value: '12', change: '+8%', changeColor: '#10B981', changeBg: '#f0fdf4' },
  { label: 'REVENUE', value: '₹8.4M', change: '+18%', changeColor: '#10B981', changeBg: '#f0fdf4' },
  { label: 'BOOKINGS', value: '28', change: '+23%', changeColor: '#10B981', changeBg: '#f0fdf4' },
];

const pipeline = [
  { stage: 'New Leads', count: 47, color: '#64748B' },
  { stage: 'Site Visit', count: 23, color: '#F59E0B' },
  { stage: 'Negotiation', count: 11, color: '#8B5CF6' },
  { stage: 'Booked ✓', count: 8, color: '#10B981' },
];

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, #dde1e7 1.2px, transparent 1.2px)',
        backgroundSize: '30px 30px',
      }} />
      {/* Blue blob */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #dbeafe 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Green blob */}
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #d1fae5 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Trusted by 1000+ Builders &amp; Brokers across India
            </span>
          </div>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          AI-Powered Real Estate CRM{' '}
          <span style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #0ea5e9 50%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            That Sells More Properties Faster
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ textAlign: 'center', marginTop: 20, fontSize: 18, color: '#64748B', maxWidth: 580, margin: '20px auto 0', lineHeight: 1.7 }}
        >
          Manage leads, inventory, bookings, payments, WhatsApp, and AI calling
          from one unified platform. Built for modern builders and brokers.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 40, flexWrap: 'wrap' }}
        >
          <Link
            href="/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', background: '#2563EB', color: 'white',
              fontWeight: 700, fontSize: 15, borderRadius: 12, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              transition: 'transform 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Start Free Trial <ArrowRight size={16} />
          </Link>
          <Link
            href="#demo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 24px', background: 'white', color: '#374151',
              fontWeight: 600, fontSize: 15, borderRadius: 12, textDecoration: 'none',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={12} color="#2563EB" fill="#2563EB" />
            </div>
            Watch Demo (2 min)
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}
        >
          {['No credit card required', 'Setup in 5 minutes', '14-day free trial'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={15} color="#10B981" />
              <span style={{ fontSize: 13, color: '#64748B' }}>{item}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{ marginTop: 64, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}
        >
          {/* Browser frame */}
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)', background: 'white' }}>
            {/* Chrome bar */}
            <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399' }} />
              </div>
              <div style={{ flex: 1, maxWidth: 340, margin: '0 auto' }}>
                <div style={{ background: '#334155', borderRadius: 6, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>app.realflowcrm.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard body */}
            <div style={{ background: '#f8fafc', padding: 24 }}>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {stats.map((s) => (
                  <div key={s.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ marginTop: 8, display: 'inline-block', fontSize: 11, fontWeight: 700, color: s.changeColor, background: s.changeBg, borderRadius: 999, padding: '2px 8px' }}>
                      {s.change} this month
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline */}
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Sales Pipeline</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {pipeline.map((col) => (
                    <div key={col.stage} style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', flex: 1 }}>{col.stage}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{col.count}</span>
                      </div>
                      {[0, 1].map((i) => (
                        <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dbeafe', flexShrink: 0 }} />
                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, flex: 1 }} />
                          </div>
                          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, width: '70%' }} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
