'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Integrations', href: '#integrations' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#ffffff',
          borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
              <Activity size={16} color="white" />
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>
                RealFlow <span style={{ color: '#2563EB' }}>CRM</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                by AICLEX
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'none', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }} className="lg-nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: '#475569', borderRadius: 8, textDecoration: 'none', transition: 'color 0.2s, background 0.2s' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2563EB'; (e.target as HTMLElement).style.background = '#eff6ff'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#475569'; (e.target as HTMLElement).style.background = 'transparent'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div style={{ display: 'none', alignItems: 'center', gap: 8, flexShrink: 0 }} className="lg-actions">
            <Link href="#contact" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: '#475569', borderRadius: 8, textDecoration: 'none' }}>
              Book Demo
            </Link>
            <Link href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: '#2563EB', textDecoration: 'none' }}>
              Login
            </Link>
            <Link
              href="/register"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#2563EB', color: 'white', fontWeight: 600, fontSize: 14, borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'background 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
            >
              Start Free Trial <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg-hide"
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#475569' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 40, background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '12px 24px 20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', fontSize: 15, fontWeight: 500, color: '#374151', borderRadius: 10, textDecoration: 'none' }}>
                  {link.label}
                </Link>
              ))}
              <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />
              <Link href="#contact" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', fontSize: 15, fontWeight: 500, color: '#374151', borderRadius: 10, textDecoration: 'none' }}>
                Book Demo
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', fontSize: 15, fontWeight: 600, color: '#2563EB', borderRadius: 10, textDecoration: 'none' }}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 16px', background: '#2563EB', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 12, textDecoration: 'none', marginTop: 4 }}>
                Start Free Trial <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 1024px) {
          .lg-nav { display: flex !important; }
          .lg-actions { display: flex !important; }
          .lg-hide { display: none !important; }
        }
      `}</style>
    </>
  );
}
