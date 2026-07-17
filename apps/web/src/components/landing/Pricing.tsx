'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    desc: 'For small brokers & independent agents',
    monthly: '₹4,999', yearly: '₹3,999', suffix: '/month',
    popular: false,
    features: ['Up to 5 users', '2,000 leads/month', 'Lead Management', 'WhatsApp Basic', 'Mobile App', 'Basic Reports', 'Email Support'],
    ctaLabel: 'Start Free Trial', ctaHref: '/register',
  },
  {
    name: 'Growth',
    desc: 'For mid-size builders and broker firms',
    monthly: '₹12,999', yearly: '₹10,399', suffix: '/month',
    popular: true,
    features: ['Up to 25 users', '10,000 leads/month', 'Everything in Starter', 'AI Calling Agent', 'Advanced WhatsApp CRM', 'Inventory Management', 'Booking & Payments', 'Priority Support'],
    ctaLabel: 'Start Free Trial', ctaHref: '/register',
  },
  {
    name: 'Enterprise',
    desc: 'For large developers and enterprise teams',
    monthly: 'Custom', yearly: 'Custom', suffix: '',
    popular: false,
    features: ['Unlimited users', 'Unlimited leads', 'Everything in Growth', 'Dedicated Account Manager', 'Custom Integrations', 'White Labelling', 'SLA 99.9% Uptime'],
    ctaLabel: 'Contact Sales', ctaHref: '#contact',
  },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes! All paid plans come with a full 14-day free trial. No credit card required to start.' },
  { q: 'Can I add more users later?', a: 'Absolutely. You can upgrade your plan or add seat add-ons at any time from your billing settings.' },
  { q: 'Is my data secure?', a: 'Yes. RealFlow is hosted on Microsoft Azure with AES-256 encryption, daily backups, and enterprise-grade security compliance.' },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="pricing" style={{ padding: '96px 0', background: '#ffffff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 16 }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: 16, color: '#64748B', maxWidth: 400, margin: '0 auto 28px' }}>Pick the plan that fits your team. No hidden fees, no lock-ins.</p>
          {/* Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 999, padding: 4 }}>
            {[{ label: 'Monthly', val: false }, { label: 'Yearly', val: true, badge: '-20%' }].map((opt) => (
              <button key={opt.label} onClick={() => setYearly(opt.val)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s', background: yearly === opt.val ? '#ffffff' : 'transparent', color: yearly === opt.val ? '#0f172a' : '#64748B', boxShadow: yearly === opt.val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                {opt.label}
                {(opt as any).badge && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#10B981', color: 'white', padding: '2px 6px', borderRadius: 999 }}>{(opt as any).badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto 64px' }} className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} style={{ position: 'relative', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', background: plan.popular ? '#2563EB' : '#ffffff', border: plan.popular ? 'none' : '1.5px solid #e2e8f0', boxShadow: plan.popular ? '0 20px 60px rgba(37,99,235,0.3)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#fbbf24', color: '#78350f', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  ⭐ Most Popular
                </div>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 800, color: plan.popular ? 'white' : '#0f172a', marginBottom: 6 }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.7)' : '#64748B', marginBottom: 24 }}>{plan.desc}</p>
              <AnimatePresence mode="wait">
                <motion.div key={yearly ? 'y' : 'm'} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
                  style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 28 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: plan.popular ? 'white' : '#0f172a', lineHeight: 1 }}>
                    {yearly ? plan.yearly : plan.monthly}
                  </span>
                  {plan.suffix && <span style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginBottom: 6 }}>{plan.suffix}</span>}
                </motion.div>
              </AnimatePresence>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.7)' : '#10B981', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.85)' : '#374151' }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href={plan.ctaHref} style={{ display: 'block', textAlign: 'center', padding: '13px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: 'none', background: plan.popular ? '#ffffff' : '#f8fafc', color: plan.popular ? '#2563EB' : '#374151', border: plan.popular ? 'none' : '1.5px solid #e2e8f0', transition: 'background 0.2s' }}>
                {plan.ctaLabel}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 28 }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{faq.q}</span>
                  <span style={{ fontSize: 18, color: '#94a3b8', fontWeight: 300, flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                      <p style={{ padding: '0 20px 16px', fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
