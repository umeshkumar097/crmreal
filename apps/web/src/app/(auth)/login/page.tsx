'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, tenant, accessToken, refreshToken } = res.data as {
        user: Parameters<typeof setUser>[0];
        tenant: { id: string };
        accessToken: string;
        refreshToken: string;
      };
      setTokens(accessToken, refreshToken, tenant.id);
      setUser(user);
      toast.success(`Welcome back, ${user?.firstName}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Check credentials.';
      toast.error(msg);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0F1E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'rgba(59,130,246,0.15)', filter: 'blur(100px)',
          top: -200, left: -150,
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(139,92,246,0.12)', filter: 'blur(100px)',
          bottom: -150, right: -100,
        }} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        maxWidth: 1000, width: '100%', padding: '2rem', gap: '4rem',
        alignItems: 'center', position: 'relative', zIndex: 1,
      }}>
        {/* Left — Branding */}
        <div style={{ color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2.5rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #2563EB, #10B981)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}>🏠</div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>RealFlow CRM</span>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>by AICLEX Technologies</div>
            </div>
          </div>

          <h1 style={{
            fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2,
            letterSpacing: '-0.03em', marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fff 60%, rgba(255,255,255,0.4))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            AI-Powered Real Estate<br />CRM for Modern Teams
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Manage leads, properties, bookings, and payments — all in one intelligent platform.
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {[{ v: '50K+', l: 'Leads Managed' }, { v: '₹2400Cr', l: 'Revenue Tracked' }, { v: '98%', l: 'Uptime SLA' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA' }}>{s.v}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {['✨ AI Lead Scoring', '💬 WhatsApp Integration', '📊 Real-time Analytics', '🏢 Multi-tenant Architecture'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>{f}</div>
          ))}
        </div>

        {/* Right — Form */}
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)', borderRadius: 24, padding: '2.5rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '2rem' }}>Sign in to your CRM dashboard</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Email address</label>
                <input
                  type="email"
                  placeholder="admin@yourcompany.com"
                  {...register('email')}
                  style={{
                    padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${errors.email ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none',
                    width: '100%', boxSizing: 'border-box',
                  }}
                />
                {errors.email && <span style={{ fontSize: '0.78rem', color: '#F87171' }}>{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Password</label>
                  <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#60A5FA' }}>Forgot password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    style={{
                      padding: '12px 48px 12px 16px', background: 'rgba(255,255,255,0.07)',
                      border: `1px solid ${errors.password ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none',
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', fontSize: '1rem', padding: 0,
                    }}
                  >{showPass ? '🙈' : '👁️'}</button>
                </div>
                {errors.password && <span style={{ fontSize: '0.78rem', color: '#F87171' }}>{errors.password.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '13px', background: isSubmitting ? 'rgba(59,130,246,0.6)' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                  fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 4,
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            {/* Demo credentials box */}
            <div style={{ marginTop: '1.25rem', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93C5FD', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔑 Demo Credentials</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>📧 admin@realflow.com</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>🔒 Admin@123</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'admin@realflow.com');
                    setValue('password', 'Admin@123');
                  }}
                  style={{ padding: '6px 14px', background: 'rgba(37,99,235,0.4)', border: '1px solid rgba(37,99,235,0.5)', borderRadius: 8, color: '#93C5FD', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Auto-fill
                </button>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
              New to RealFlow?{' '}
              <Link href="/register" style={{ color: '#60A5FA', fontWeight: 500 }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
