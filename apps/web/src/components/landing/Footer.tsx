'use client';

import Link from 'next/link';

const cols = [
  { title: 'Product', links: ['Lead Management', 'Inventory', 'Bookings', 'Payments', 'WhatsApp CRM', 'AI Agent', 'Reports'] },
  { title: 'Solutions', links: ['For Builders', 'For Brokers', 'Channel Partners', 'Enterprise', 'Small Teams'] },
  { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press', 'Contact Us'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security', 'GDPR'] },
];

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: 'white' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 32px' }}>
        {/* Main columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 40, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="footer-grid">
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                ⚡
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
                  RealFlow <span style={{ color: '#60a5fa' }}>CRM</span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                  by AICLEX
                </div>
              </div>
            </Link>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, maxWidth: 220, marginBottom: 24 }}>
              AI-Powered Real Estate CRM built for India's builders and brokers.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', 'in', '▶'].map((icon, i) => (
                <a key={i} href="#" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#64748B'; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#e2e8f0'; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#64748B'; }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            © 2025 AICLEX Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: '#475569' }}>
            Made with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
