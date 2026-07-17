'use client';

import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section style={{ position: 'relative', padding: '100px 0', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 40%, #4f46e5 100%)', overflow: 'hidden' }}>
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      {/* Blobs */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65 }}
        style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}
      >
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
          Ready to Sell More Properties?
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
          Join 500+ real estate builders and brokers who already trust RealFlow CRM to close more deals faster.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <a
            href="/register"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', background: '#ffffff', color: '#1d4ed8', fontWeight: 800, fontSize: 15, borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Start Free Trial →
          </a>
          <a
            href="#contact"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 700, fontSize: 15, borderRadius: 14, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.25)', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
          >
            Book Live Demo
          </a>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          No credit card required &nbsp;·&nbsp; Setup in 5 minutes &nbsp;·&nbsp; Cancel anytime
        </p>
      </motion.div>
    </section>
  );
}
