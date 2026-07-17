'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  commissionPercent: number;
  leadsAssigned: number;
  bookings: number;
  status: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phone?: string;
}

export default function HrPage() {
  const [tab, setTab] = useState<'employees' | 'commissions'>('employees');

  const { data, isLoading } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: () => api.get('/hr/employees').then(r => r.data),
  });

  const employees: Employee[] = data?.data || [];
  const active = employees.filter(e => e.status === 'ACTIVE').length;
  const totalLeads = employees.reduce((s, e) => s + (e.leadsAssigned || 0), 0);
  const totalBookings = employees.reduce((s, e) => s + (e.bookings || 0), 0);

  const tabStyle = (isActive: boolean) => ({
    padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    borderBottom: isActive ? '2px solid #6366F1' : '2px solid transparent',
    color: isActive ? '#6366F1' : '#64748B', background: 'transparent', transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="HR" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>HR & Team</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage employees and commissions</p>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}>+ Add Employee</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Employees', value: employees.length, emoji: '👨‍💼', color: '#3B82F6' },
            { label: 'Active', value: active, emoji: '✅', color: '#10B981' },
            { label: 'Leads Assigned', value: totalLeads, emoji: '🎯', color: '#8B5CF6' },
            { label: 'Total Bookings', value: totalBookings, emoji: '📋', color: '#F97316' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 28 }}>{s.emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ borderBottom: '1px solid #E2E8F0', display: 'flex' }}>
            <button style={tabStyle(tab === 'employees')} onClick={() => setTab('employees')}>👨‍💼 Employees</button>
            <button style={tabStyle(tab === 'commissions')} onClick={() => setTab('commissions')}>💰 Commissions</button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {(tab === 'employees'
                  ? ['Name', 'Role', 'Department', 'Commission %', 'Leads Assigned', 'Bookings', 'Status']
                  : ['Name', 'Role', 'Total Leads', 'Bookings', 'Commission %', 'Est. Earnings', 'Status']
                ).map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍💼</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No employees yet</div>
                    <div style={{ fontSize: 13 }}>Add team members to get started</div>
                  </td>
                </tr>
              ) : (
                employees.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {e.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: '#0F172A' }}>{e.name}</div>
                          {e.email && <div style={{ fontSize: 12, color: '#94A3B8' }}>{e.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{e.role}</td>
                    {tab === 'employees' ? (
                      <>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{e.department}</td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{e.commissionPercent || 0}%</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>{e.leadsAssigned || 0}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>{e.bookings || 0}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>{e.leadsAssigned || 0}</td>
                        <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>{e.bookings || 0}</td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>{e.commissionPercent || 0}%</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10B981' }}>—</td>
                      </>
                    )}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: e.status === 'ACTIVE' ? '#D1FAE5' : '#F1F5F9',
                        color: e.status === 'ACTIVE' ? '#065F46' : '#475569',
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      }}>{e.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
