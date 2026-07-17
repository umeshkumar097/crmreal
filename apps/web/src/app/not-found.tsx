'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🚧</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Page Coming Soon
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '2rem', maxWidth: 400 }}>
          This module is being built. Check back shortly or navigate to an available page.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{
            background: '#3B82F6', color: '#fff', padding: '10px 20px',
            borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
          }}>
            ← Dashboard
          </Link>
          <Link href="/dashboard/leads" style={{
            background: '#fff', color: '#334155', padding: '10px 20px',
            borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
            border: '1px solid #E2E8F0',
          }}>
            View Leads
          </Link>
        </div>
      </div>
    </div>
  );
}
