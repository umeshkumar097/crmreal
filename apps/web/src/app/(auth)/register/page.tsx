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

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName:  z.string().min(2, 'Min 2 characters'),
  email:       z.string().email('Valid email required'),
  phone:       z.string().optional(),
  password:    z.string().min(8, 'Min 8 characters'),
  companyName: z.string().min(2, 'Company name required'),
});
type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  const nextStep = async () => {
    const valid = await trigger(['firstName', 'lastName', 'email', 'phone']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await api.post('/auth/register', data);
      const { user, tenant, accessToken, refreshToken } = res.data as {
        user: Parameters<typeof setUser>[0];
        tenant: { id: string };
        accessToken: string;
        refreshToken: string;
      };
      setTokens(accessToken, refreshToken, tenant.id);
      setUser(user);
      toast.success('Account created! Welcome to PropCRM 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: `1px solid ${hasError ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0F1E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'relative',
      overflow: 'hidden', fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(100px)', top: -200, right: -150 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(100px)', bottom: -100, left: -100 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1000, width: '100%', padding: '2rem', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>

        {/* Left panel */}
        <div style={{ color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2.5rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}>🏢</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PropCRM</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem', background: 'linear-gradient(135deg,#fff 60%,rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Start your free trial<br />in 60 seconds
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Join 500+ real estate teams already using PropCRM to close more deals.
          </p>

          {/* Steps indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: 1, title: 'Personal Info', desc: 'Your name and contact details' },
              { n: 2, title: 'Company Setup', desc: 'Create your workspace' },
              { n: 3, title: 'Start Selling', desc: 'Invite team, add leads' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem',
                  background: s.n <= step ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)' : 'rgba(255,255,255,0.06)',
                  color: s.n <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                  boxShadow: s.n <= step ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}>{s.n < step ? '✓' : s.n}</div>
                <div>
                  <div style={{ fontWeight: 600, color: s.n <= step ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', borderRadius: 24, padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg,#8B5CF6,#3B82F6)', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
              {step === 1 ? 'Tell us about yourself' : 'Set up your workspace'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Step {step} of 2
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {step === 1 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>First Name</label>
                      <input placeholder="Rahul" {...register('firstName')} style={inputStyle(!!errors.firstName)} />
                      {errors.firstName && <span style={{ fontSize: '0.72rem', color: '#F87171' }}>{errors.firstName.message}</span>}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Last Name</label>
                      <input placeholder="Sharma" {...register('lastName')} style={inputStyle(!!errors.lastName)} />
                      {errors.lastName && <span style={{ fontSize: '0.72rem', color: '#F87171' }}>{errors.lastName.message}</span>}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Email Address</label>
                    <input type="email" placeholder="rahul@company.com" {...register('email')} style={inputStyle(!!errors.email)} />
                    {errors.email && <span style={{ fontSize: '0.72rem', color: '#F87171' }}>{errors.email.message}</span>}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Phone (optional)</label>
                    <input placeholder="+91 98765 43210" {...register('phone')} style={inputStyle(false)} />
                  </div>
                  <button type="button" onClick={nextStep} style={{ padding: '13px', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(139,92,246,0.35)', marginTop: 4 }}>
                    Continue →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Company / Brand Name</label>
                    <input placeholder="Sharma Realty Pvt Ltd" {...register('companyName')} style={inputStyle(!!errors.companyName)} />
                    {errors.companyName && <span style={{ fontSize: '0.72rem', color: '#F87171' }}>{errors.companyName.message}</span>}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" {...register('password')} style={{ ...inputStyle(!!errors.password), paddingRight: 48 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <span style={{ fontSize: '0.72rem', color: '#F87171' }}>{errors.password.message}</span>}
                  </div>

                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                    🎁 <strong style={{ color: '#10B981' }}>14-day free trial</strong> — No credit card required
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '13px', background: isSubmitting ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                      {isSubmitting ? 'Creating account...' : 'Create Account 🚀'}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#60A5FA', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
