'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import LeadImportModal from '@/components/leads/LeadImportModal';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Lead {
  id: string; leadNumber: string; firstName: string; lastName: string;
  phone: string; email?: string; source: string; status: string; stage: string;
  priority: string; score?: number; isHot: boolean; budgetMin?: number; budgetMax?: number;
  createdAt: string; assignedTo?: { firstName: string; lastName: string };
  tags: string[];
}

interface LeadsResponse { data: Lead[]; meta?: { total: number; page: number; totalPages: number }; total?: number; }

const SOURCES = ['WEBSITE','SOCIAL_MEDIA','REFERRAL','WALK_IN','PHONE','EMAIL','PORTAL','NEWSPAPER','HOARDINGS','CHANNEL_PARTNER','OTHER'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','URGENT'];
const STAGES = ['INQUIRY','INTERESTED','SITE_VISIT_SCHEDULED','SITE_VISITED','NEGOTIATION','BOOKING_DONE'];

function fmt(n: number) { return n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : `₹${(n/1e5).toFixed(0)}L`; }
function formatBudget(min?: number, max?: number) {
  if (!min && !max) return '—';
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min ?? max ?? 0);
}

// ─── Convert Lead Modal ───────────────────────────────────────────────────────
function ConvertLeadModal({ lead, onClose, onSuccess }: { lead: Lead; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      await api.patch(`/leads/${lead.id}/convert`, data);
      toast.success(`${lead.firstName} ${lead.lastName} converted to Customer! 🎉`);
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Conversion failed';
      toast.error(msg);
    }
  };

  const inp = { padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>✅ Convert to Customer</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{lead.firstName} {lead.lastName} — {lead.phone}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', background: '#F0FDF4', padding: '10px 14px', borderRadius: 8, border: '1px solid #BBF7D0' }}>
            🎯 This will create a <strong>Customer record</strong> and mark the lead as <strong>CONVERTED</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>PAN Number</label>
              <input {...register('panNumber')} placeholder="ABCDE1234F" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Aadhar Number</label>
              <input {...register('aadharNumber')} placeholder="XXXX XXXX XXXX" style={inp} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Address</label>
            <input {...register('address.street')} placeholder="Street / Area" style={{ ...inp, marginBottom: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input {...register('address.city')} placeholder="City" style={inp} />
              <input {...register('address.pincode')} placeholder="Pincode" style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', background: isSubmitting ? '#6EE7B7' : '#10B981', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
              {isSubmitting ? 'Converting...' : '✅ Convert to Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Lead Modal ─────────────────────────────────────────────────────────
function EditLeadModal({ lead, onClose, onSuccess }: { lead: Lead; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source,
      priority: lead.priority,
      stage: lead.stage,
      budgetMin: lead.budgetMin || '',
      budgetMax: lead.budgetMax || '',
      isHot: lead.isHot || false,
    }
  });

  const onSubmit = async (data: Record<string, any>) => {
    try {
      await api.patch(`/leads/${lead.id}`, {
        ...data,
        budgetMin: data.budgetMin ? Number(data.budgetMin) : null,
        budgetMax: data.budgetMax ? Number(data.budgetMax) : null,
      });
      toast.success('Lead updated successfully! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update lead');
    }
  };

  const inp = {
    padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
    borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Lead Details</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>First Name</label>
              <input {...register('firstName')} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Last Name</label>
              <input {...register('lastName')} style={inp} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Phone</label>
              <input {...register('phone')} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
              <input {...register('email')} style={inp} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Source</label>
              <select {...register('source')} style={{ ...inp, background: '#F8FAFC' }}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Priority</label>
              <select {...register('priority')} style={{ ...inp, background: '#F8FAFC' }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Stage</label>
              <select {...register('stage')} style={{ ...inp, background: '#F8FAFC' }}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Min Budget (₹)</label>
              <input type="number" {...register('budgetMin')} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Max Budget (₹)</label>
              <input type="number" {...register('budgetMax')} style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="edit-isHot" {...register('isHot')} style={{ cursor: 'pointer' }} />
            <label htmlFor="edit-isHot" style={{ fontSize: '0.85rem', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>🔥 Mark as Hot Lead</label>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', background: isSubmitting ? '#93C5FD' : '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  NEW:       { bg: '#DBEAFE', color: '#1D4ED8' },
  CONTACTED: { bg: '#E0E7FF', color: '#4338CA' },
  QUALIFIED: { bg: '#D1FAE5', color: '#065F46' },
  HOT:       { bg: '#FEE2E2', color: '#991B1B' },
  CONVERTED: { bg: '#D1FAE5', color: '#065F46' },
  LOST:      { bg: '#F3F4F6', color: '#6B7280' },
  JUNK:      { bg: '#F3F4F6', color: '#9CA3AF' },
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94A3B8', MEDIUM: '#3B82F6', HIGH: '#F59E0B', URGENT: '#EF4444'
};

// ─── Add Lead Modal ───────────────────────────────────────────────────────────
function AddLeadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      await api.post('/leads', {
        ...data,
        budgetMin: data.budgetMin ? Number(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? Number(data.budgetMax) : undefined,
      });
      toast.success('Lead created successfully! 🎉');
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create lead';
      toast.error(msg);
    }
  };

  const inp = (hasErr: boolean) => ({
    padding: '9px 12px', background: '#F8FAFC', border: `1px solid ${hasErr ? '#EF4444' : '#E2E8F0'}`,
    borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Add New Lead</h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 }}>Fill in the details to create a new lead</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px' }}>
          {/* Personal Info */}
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Personal Information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>First Name *</label>
              <input {...register('firstName', { required: true })} placeholder="Rahul" style={inp(!!errors.firstName)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Last Name *</label>
              <input {...register('lastName', { required: true })} placeholder="Sharma" style={inp(!!errors.lastName)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Phone *</label>
              <input {...register('phone', { required: true })} placeholder="+91 98765 43210" style={inp(!!errors.phone)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
              <input type="email" {...register('email')} placeholder="rahul@example.com" style={inp(false)} />
            </div>
          </div>

          {/* Lead Details */}
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Lead Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Source *</label>
              <select {...register('source', { required: true })} style={{ ...inp(!!errors.source), background: '#F8FAFC' }}>
                <option value="">Select source</option>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Priority</label>
              <select {...register('priority')} style={{ ...inp(false), background: '#F8FAFC' }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Stage</label>
              <select {...register('stage')} style={{ ...inp(false), background: '#F8FAFC' }}>
                {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Budget */}
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Budget Range</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Min Budget (₹)</label>
              <input type="number" {...register('budgetMin')} placeholder="e.g. 5000000" style={inp(false)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Max Budget (₹)</label>
              <input type="number" {...register('budgetMax')} placeholder="e.g. 10000000" style={inp(false)} />
            </div>
          </div>

          {/* Property Requirement */}
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Property Requirement</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Property Type</label>
              <select {...register('propertyType')} style={{ ...inp(false), background: '#F8FAFC' }}>
                <option value="">Any</option>
                {['APARTMENT','VILLA','PLOT','COMMERCIAL','OFFICE','SHOP','WAREHOUSE'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Preferred Location</label>
              <input {...register('locationPreference')} placeholder="e.g. Bandra West, Mumbai" style={inp(false)} />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Notes</label>
            <textarea {...register('notes')} placeholder="Additional notes about this lead..." rows={3}
              style={{ ...inp(false), resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', background: isSubmitting ? '#93C5FD' : '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
              {isSubmitting ? 'Creating...' : '+ Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['leads', page, search, statusFilter],
    queryFn: () => api.get('/leads', { params: { page, limit: 20, search, status: statusFilter || undefined } }).then(r => r.data as LeadsResponse),
    staleTime: 30000,
  });

  const leads = (res as { data?: Lead[] })?.data ?? [];
  const total = (res as { meta?: { total: number } })?.meta?.total ?? (res as { total?: number })?.total ?? 0;

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      await api.patch(`/leads/${leadId}`, { status });
      toast.success('Lead status updated! 🎉');
      qc.invalidateQueries({ queryKey: ['leads'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleStageChange = async (leadId: string, stage: string) => {
    try {
      await api.patch(`/leads/${leadId}/stage`, { stage });
      toast.success('Lead stage updated! 🎉');
      qc.invalidateQueries({ queryKey: ['leads'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update stage');
    }
  };

  const Skeleton = () => (
    <tr>
      {[200, 140, 120, 100, 90, 90, 110, 100, 100].map((w, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{ height: 14, width: w, background: '#F1F5F9', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <Header title="Leads" subtitle={`${total} total leads`} />

      <div style={{ padding: '20px 24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', flex: 1, minWidth: 200 }}>
            <span style={{ color: '#94A3B8' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, lead number..." style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0F172A', background: 'transparent', width: '100%' }} />
          </div>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.875rem', color: '#475569', background: '#fff', cursor: 'pointer' }}>
            <option value="">All Status</option>
            {['NEW','CONTACTED','QUALIFIED','HOT','CONVERTED','LOST','JUNK'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* View toggles */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
            {(['table','kanban'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, background: view === v ? '#3B82F6' : 'transparent', color: view === v ? '#fff' : '#64748B' }}>
                {v === 'table' ? '☰ List' : '⊞ Kanban'}
              </button>
            ))}
          </div>

          {/* Import Button */}
          <button
            onClick={() => setShowImport(true)}
            style={{ padding: '9px 16px', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            📊 Import Excel / CSV
          </button>

          {/* Add Lead */}
          <button onClick={() => setShowModal(true)} style={{ padding: '9px 18px', background: '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(59,130,246,0.3)', whiteSpace: 'nowrap' }}>
            + Add Lead
          </button>
        </div>

        {/* Table View */}
        {view === 'table' && (
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Lead', 'Contact', 'Budget', 'Source', 'Status', 'Priority', 'Stage', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>No leads yet</div>
                      <div style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: 20 }}>Add your first lead to get started</div>
                      <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', background: '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                        + Add First Lead
                      </button>
                    </td>
                  </tr>
                ) : leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>
                        {lead.firstName} {lead.lastName}
                        {lead.isHot && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: '#FEE2E2', color: '#DC2626', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>🔥 HOT</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>#{lead.leadNumber}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>📱 {lead.phone}</div>
                      {lead.email && <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>✉ {lead.email}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#0F172A', fontWeight: 500 }}>
                      {formatBudget(lead.budgetMin, lead.budgetMax)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.75rem', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: 6 }}>
                        {lead.source?.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        style={{
                          fontSize: '0.72rem', fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                          border: '1px solid #E2E8F0', cursor: 'pointer', outline: 'none',
                          background: STATUS_COLORS[lead.status]?.bg ?? '#F3F4F6',
                          color: STATUS_COLORS[lead.status]?.color ?? '#6B7280'
                        }}
                      >
                        {['NEW','CONTACTED','QUALIFIED','HOT','CONVERTED','LOST','JUNK'].map(st => (
                          <option key={st} value={st} style={{ background: '#fff', color: '#0F172A' }}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[lead.priority] ?? '#94A3B8', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>{lead.priority}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={lead.stage}
                        onChange={e => handleStageChange(lead.id, e.target.value)}
                        style={{
                          fontSize: '0.72rem', fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                          border: '1px solid #E2E8F0', cursor: 'pointer', outline: 'none',
                          background: '#EFF6FF', color: '#1D4ED8'
                        }}
                      >
                        {STAGES.map(sg => (
                          <option key={sg} value={sg} style={{ background: '#fff', color: '#0F172A' }}>{sg.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#94A3B8' }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {lead.status !== 'CONVERTED' ? (
                          <button
                            onClick={() => setConvertingLead(lead)}
                            title="Convert to Customer"
                            style={{ background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}
                          >
                            ✅ Convert
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>✓ Customer</span>
                        )}
                        <button
                          onClick={() => setEditingLead(lead)}
                          title="Edit Lead"
                          style={{ background: '#fff', border: '1px solid #CBD5E1', borderRadius: 8, color: '#475569', fontSize: '0.72rem', fontWeight: 600, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 20 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Showing {((page-1)*20)+1}–{Math.min(page*20, total)} of {total}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', color: '#475569', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
                  <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', cursor: page * 20 >= total ? 'not-allowed' : 'pointer', fontSize: '0.8rem', color: '#475569', opacity: page * 20 >= total ? 0.5 : 1 }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
            {[
              { key: 'INQUIRY', label: 'Inquiry', color: '#94A3B8', bg: '#F8FAFC' },
              { key: 'INTERESTED', label: 'Interested', color: '#3B82F6', bg: '#EFF6FF' },
              { key: 'SITE_VISIT_SCHEDULED', label: 'Site Visit', color: '#8B5CF6', bg: '#F5F3FF' },
              { key: 'SITE_VISITED', label: 'Visited', color: '#06B6D4', bg: '#ECFEFF' },
              { key: 'NEGOTIATION', label: 'Negotiation', color: '#F59E0B', bg: '#FFFBEB' },
              { key: 'BOOKING_DONE', label: 'Booked', color: '#10B981', bg: '#F0FDF4' },
            ].map(col => {
              const colLeads = leads.filter(l => l.stage === col.key);
              return (
                <div key={col.key} style={{ minWidth: 240, background: col.bg, border: `1px solid ${col.color}30`, borderRadius: 12, padding: 12, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: col.color }}>{col.label}</span>
                    <span style={{ background: col.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>{colLeads.length}</span>
                  </div>
                  {colLeads.map(lead => (
                    <div key={lead.id} style={{ background: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {lead.firstName} {lead.lastName}
                          {lead.isHot && ' 🔥'}
                        </span>
                        <button
                          onClick={() => setEditingLead(lead)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                          title="Edit Lead"
                        >
                          ✏️
                        </button>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>📱 {lead.phone}</div>
                      {(lead.budgetMin || lead.budgetMax) && <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: 4, fontWeight: 500 }}>{formatBudget(lead.budgetMin, lead.budgetMax)}</div>}
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.65rem', background: STATUS_COLORS[lead.status]?.bg ?? '#F3F4F6', color: STATUS_COLORS[lead.status]?.color ?? '#6B7280', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{lead.status}</span>
                        <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: PRIORITY_COLORS[lead.priority] ?? '#94A3B8' }} />
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#CBD5E1', fontSize: '0.8rem' }}>No leads</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showImport && (
        <LeadImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['leads'] })}
        />
      )}

      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['leads'] })}
        />
      )}

      {convertingLead && (
        <ConvertLeadModal
          lead={convertingLead}
          onClose={() => setConvertingLead(null)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['leads'] }); qc.invalidateQueries({ queryKey: ['customers'] }); }}
        />
      )}

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['leads'] })}
        />
      )}
    </div>
  );
}
