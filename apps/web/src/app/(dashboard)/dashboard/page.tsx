'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, TrendingUp, Building2, CreditCard, CalendarCheck,
  Bell, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, Clock, Star, Flame,
} from 'lucide-react';
import api from '@/lib/api';
import Header from '@/components/layout/Header';

// ─── Types ──────────────────────────────────────────────────────────────────
interface DashStats {
  totalLeads: number; newLeadsToday: number; totalProperties: number;
  availableUnits: number; totalBookings: number; bookingsThisMonth: number;
  totalRevenue: number; revenueThisMonth: number; totalCustomers: number;
  hotLeads: number; overdueFollowUps: number; pendingPayments: number;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ title, value, change, changeLabel, icon: Icon, color, trend }: {
  title: string; value: string; change?: number; changeLabel?: string;
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-title">{title}</span>
        <div className={`kpi-icon-wrap kpi-icon-${color}`}><Icon size={18} /></div>
      </div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className={`kpi-change kpi-change-${trend ?? (change >= 0 ? 'up' : 'down')}`}>
          {trend !== 'neutral' && (change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)}
          <span>{Math.abs(change)}% {changeLabel ?? 'vs last month'}</span>
        </div>
      )}
      <style jsx>{`
        .kpi-card {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 16px;
          padding: 20px; display: flex; flex-direction: column; gap: 10px;
          transition: all 0.2s; cursor: default;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .kpi-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .kpi-top { display: flex; align-items: center; justify-content: space-between; }
        .kpi-title { font-size: 0.82rem; font-weight: 500; color: #64748B; }
        .kpi-icon-wrap {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .kpi-icon-blue { background: #EFF6FF; color: #3B82F6; }
        .kpi-icon-green { background: #F0FDF4; color: #10B981; }
        .kpi-icon-purple { background: #F5F3FF; color: #8B5CF6; }
        .kpi-icon-orange { background: #FFF7ED; color: #F97316; }
        .kpi-icon-red { background: #FFF1F2; color: #EF4444; }
        .kpi-icon-indigo { background: #EEF2FF; color: #6366F1; }
        .kpi-value { font-size: 1.75rem; font-weight: 800; color: #0F172A; letter-spacing: -0.03em; line-height: 1; }
        .kpi-change { display: flex; align-items: center; gap: 3px; font-size: 0.75rem; font-weight: 500; }
        .kpi-change-up { color: #10B981; }
        .kpi-change-down { color: #EF4444; }
        .kpi-change-neutral { color: #F59E0B; }
      `}</style>
    </div>
  );
}

// ─── Source colors ───────────────────────────────────────────────────────────
const SOURCE_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#F97316','#6366F1'];

// ─── Format currency ─────────────────────────────────────────────────────────
function formatCr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString()}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ width:'60%', height:14, background:'#F1F5F9', borderRadius:8, animation:'pulse 1.5s infinite' }} />
      <div style={{ width:'40%', height:28, background:'#F1F5F9', borderRadius:8, animation:'pulse 1.5s infinite' }} />
      <div style={{ width:'50%', height:12, background:'#F1F5F9', borderRadius:8, animation:'pulse 1.5s infinite' }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data as DashStats),
    refetchInterval: 60000,
  });

  const { data: funnelData } = useQuery({
    queryKey: ['lead-funnel'],
    queryFn: () => api.get('/dashboard/lead-funnel').then(r => r.data as { stage: string; count: number }[]),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => api.get('/dashboard/monthly-revenue').then(r => r.data as { month: string; revenue: number }[]),
  });

  const { data: sourceData } = useQuery({
    queryKey: ['leads-by-source'],
    queryFn: () => api.get('/dashboard/leads-by-source').then(r => r.data as { source: string; count: number }[]),
  });

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.get('/dashboard/recent-activity?limit=8').then(r => r.data as { id: string; title: string; description?: string; createdAt: string; user?: { firstName: string; lastName: string } }[]),
  });

  const { data: followUps } = useQuery({
    queryKey: ['upcoming-followups'],
    queryFn: () => api.get('/dashboard/upcoming-follow-ups').then(r => r.data as { id: string; lead?: { firstName: string; lastName: string; phone: string }; scheduledAt: string; type?: string }[]),
  });

  const { data: topAgents } = useQuery({
    queryKey: ['top-agents'],
    queryFn: () => api.get('/dashboard/top-agents').then(r => r.data as { id: string; firstName: string; lastName: string; bookings: number; leads: number }[]),
  });

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <Header title="Dashboard" subtitle={`${greeting} — here's your CRM overview`} />

      <div className="page-body">
        {/* KPI Grid */}
        <section className="kpi-grid">
          {statsLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <KpiCard title="Total Leads" value={stats?.totalLeads?.toLocaleString() ?? '—'} change={12} icon={Users} color="blue" />
              <KpiCard title="New Today" value={stats?.newLeadsToday?.toLocaleString() ?? '—'} change={5} changeLabel="vs yesterday" icon={TrendingUp} color="green" />
              <KpiCard title="Hot Leads 🔥" value={stats?.hotLeads?.toLocaleString() ?? '—'} trend="neutral" changeLabel="need attention" icon={Flame} color="red" />
              <KpiCard title="Total Revenue" value={formatCr(stats?.totalRevenue ?? 0)} change={18} icon={CreditCard} color="indigo" />
              <KpiCard title="This Month" value={formatCr(stats?.revenueThisMonth ?? 0)} change={8} icon={TrendingUp} color="green" />
              <KpiCard title="Total Bookings" value={stats?.totalBookings?.toLocaleString() ?? '—'} change={15} icon={CalendarCheck} color="purple" />
              <KpiCard title="Available Units" value={stats?.availableUnits?.toLocaleString() ?? '—'} icon={Building2} color="blue" />
              <KpiCard title="Overdue Follow-ups" value={stats?.overdueFollowUps?.toLocaleString() ?? '—'} trend="neutral" changeLabel="pending" icon={Bell} color="orange" />
            </>
          )}
        </section>

        <div className="charts-row">
          {/* Revenue Chart */}
          <div className="chart-card chart-card-large">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Revenue Trend</h3>
                <p className="chart-sub">Last 6 months collected payments</p>
              </div>
              <button className="chart-more"><MoreHorizontal size={16} /></button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/1e5).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [formatCr(v), 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Source */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Leads by Source</h3>
                <p className="chart-sub">Distribution across channels</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sourceData ?? []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="source" paddingAngle={3}>
                  {(sourceData ?? []).map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-row">
          {/* Lead Funnel */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Pipeline Funnel</h3>
                <p className="chart-sub">Leads by pipeline stage</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData ?? []} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Follow-Ups */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Upcoming Follow-Ups</h3>
                <p className="chart-sub">Next 48 hours</p>
              </div>
              <a href="/dashboard/follow-ups" className="chart-link">View all <ChevronRight size={13} /></a>
            </div>
            <div className="followup-list">
              {(followUps ?? []).length === 0 ? (
                <div className="empty-state">
                  <Star size={28} />
                  <p>All caught up! No follow-ups due.</p>
                </div>
              ) : (
                (followUps ?? []).map((fu) => (
                  <div key={fu.id} className="followup-item">
                    <div className="followup-avatar">{fu.lead?.firstName?.[0]}{fu.lead?.lastName?.[0]}</div>
                    <div className="followup-info">
                      <span className="followup-name">{fu.lead?.firstName} {fu.lead?.lastName}</span>
                      <span className="followup-phone">{fu.lead?.phone}</span>
                    </div>
                    <div className="followup-time">
                      <Clock size={11} />
                      <span>{new Date(fu.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="charts-row">
          {/* Recent Activity */}
          <div className="chart-card chart-card-large">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Recent Activity</h3>
                <p className="chart-sub">Latest actions across the CRM</p>
              </div>
            </div>
            <div className="activity-list">
              {(activity ?? []).map((item, i) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-line" />
                  <div className={`activity-dot activity-dot-${i % 4}`} />
                  <div className="activity-content">
                    <p className="activity-title">{item.title}</p>
                    {item.description && <p className="activity-desc">{item.description}</p>}
                    <span className="activity-time">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Agents */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Top Performers</h3>
                <p className="chart-sub">This month</p>
              </div>
            </div>
            <div className="agent-list">
              {(topAgents ?? []).map((agent, i) => (
                <div key={agent.id} className="agent-item">
                  <span className={`agent-rank agent-rank-${i}`}>{i + 1}</span>
                  <div className="agent-avatar">{agent.firstName[0]}{agent.lastName[0]}</div>
                  <div className="agent-info">
                    <span className="agent-name">{agent.firstName} {agent.lastName}</span>
                    <span className="agent-meta">{agent.leads} leads · {agent.bookings} bookings</span>
                  </div>
                  <div className="agent-score">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{agent.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page { min-height: 100vh; background: #F8FAFC; }
        .page-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .chart-card-large { grid-column: span 1; }
        .chart-card {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 16px;
          padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .chart-title { font-size: 0.95rem; font-weight: 700; color: #0F172A; }
        .chart-sub { font-size: 0.75rem; color: #94A3B8; margin-top: 2px; }
        .chart-more { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#94A3B8; }
        .chart-link { font-size: 0.78rem; color: #3B82F6; text-decoration: none; display: flex; align-items: center; gap: 3px; font-weight: 500; white-space: nowrap; }
        .followup-list { display: flex; flex-direction: column; gap: 8px; }
        .followup-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; transition: background 0.15s; }
        .followup-item:hover { background: #F8FAFC; }
        .followup-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,#3B82F6,#6366F1); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
        .followup-info { flex: 1; }
        .followup-name { display: block; font-size: 0.82rem; font-weight: 600; color: #0F172A; }
        .followup-phone { font-size: 0.72rem; color: #94A3B8; }
        .followup-time { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #F59E0B; white-space: nowrap; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 0; color: #CBD5E1; }
        .empty-state p { font-size: 0.8rem; color: #94A3B8; }
        .activity-list { display: flex; flex-direction: column; }
        .activity-item { display: flex; gap: 12px; padding: 8px 0; position: relative; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .activity-dot-0 { background: #3B82F6; }
        .activity-dot-1 { background: #10B981; }
        .activity-dot-2 { background: #8B5CF6; }
        .activity-dot-3 { background: #F59E0B; }
        .activity-content { flex: 1; }
        .activity-title { font-size: 0.82rem; font-weight: 500; color: #334155; margin-bottom: 2px; }
        .activity-desc { font-size: 0.75rem; color: #94A3B8; }
        .activity-time { font-size: 0.7rem; color: #CBD5E1; }
        .activity-line { position: absolute; left: 3px; top: 20px; bottom: -8px; width: 1px; background: #F1F5F9; }
        .activity-item:last-child .activity-line { display: none; }
        .agent-list { display: flex; flex-direction: column; gap: 8px; }
        .agent-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; transition: background 0.15s; }
        .agent-item:hover { background: #F8FAFC; }
        .agent-rank { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; }
        .agent-rank-0 { background: #FEF3C7; color: #D97706; }
        .agent-rank-1 { background: #F1F5F9; color: #64748B; }
        .agent-rank-2 { background: #FEF3C7; color: #B45309; }
        .agent-rank-3, .agent-rank-4 { background: #F8FAFC; color: #94A3B8; }
        .agent-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,#8B5CF6,#6366F1); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
        .agent-info { flex: 1; }
        .agent-name { display: block; font-size: 0.82rem; font-weight: 600; color: #0F172A; }
        .agent-meta { font-size: 0.72rem; color: #94A3B8; }
        .agent-score { display: flex; align-items: center; gap: 3px; font-size: 0.8rem; font-weight: 700; color: #F59E0B; }
        @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr; } .charts-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
