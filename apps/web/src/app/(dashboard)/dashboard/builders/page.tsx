'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit, Trash } from 'lucide-react';

interface Builder {
  id: string;
  name: string;
  city: string;
  totalProjects: number;
  contactPerson?: string;
  phone?: string;
  website?: string;
  email?: string;
}

// ─── Add Builder Modal ────────────────────────────────────────────────────────
function AddBuilderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/builders', data);
      toast.success('Builder added successfully! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add builder');
    }
  };

  const inp = {
    padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
    borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Add Builder Partner</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Company Name *</label>
            <input {...register('name', { required: true })} placeholder="DLF Group" style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>City *</label>
              <input {...register('city', { required: true })} placeholder="New Delhi" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Contact Person</label>
              <input {...register('contactPerson')} placeholder="John Doe" style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Phone</label>
              <input {...register('phone')} placeholder="+91 9876543210" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
              <input type="email" {...register('email')} placeholder="contact@dlf.in" style={inp} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Website</label>
            <input {...register('website')} placeholder="https://www.dlf.in" style={inp} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', background: isSubmitting ? '#93C5FD' : '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Adding...' : 'Add Builder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Builder Modal ───────────────────────────────────────────────────────
function EditBuilderModal({ builder, onClose, onSuccess }: { builder: Builder; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: builder.name,
      city: builder.city,
      contactPerson: builder.contactPerson || '',
      phone: builder.phone || '',
      email: builder.email || '',
      website: builder.website || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await api.put(`/builders/${builder.id}`, data);
      toast.success('Builder details updated! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update builder');
    }
  };

  const inp = {
    padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
    borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Builder Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Company Name *</label>
            <input {...register('name', { required: true })} style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>City *</label>
              <input {...register('city', { required: true })} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Contact Person</label>
              <input {...register('contactPerson')} style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Phone</label>
              <input {...register('phone')} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
              <input type="email" {...register('email')} style={inp} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Website</label>
            <input {...register('website')} style={inp} />
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BuildersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBuilder, setEditingBuilder] = useState<Builder | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['builders'],
    queryFn: () => api.get('/builders').then(r => r.data),
  });

  const builders: Builder[] = data?.data || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this builder?')) return;
    try {
      await api.delete(`/builders/${id}`);
      toast.success('Builder removed successfully');
      qc.invalidateQueries({ queryKey: ['builders'] });
    } catch (e: any) {
      toast.error('Failed to remove builder');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Builders" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Builders</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage builder partnerships</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#fff', border: 'none', padding: '10px 20px',
              borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            }}
          >
            + Add Builder
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', height: 200 }}>
                <div style={{ height: 20, background: '#F1F5F9', borderRadius: 8, width: '60%', marginBottom: 12 }} />
                <div style={{ height: 14, background: '#F1F5F9', borderRadius: 6, width: '40%', marginBottom: 8 }} />
                <div style={{ height: 14, background: '#F1F5F9', borderRadius: 6, width: '80%', marginBottom: 8 }} />
                <div style={{ height: 14, background: '#F1F5F9', borderRadius: 6, width: '60%' }} />
              </div>
            ))}
          </div>
        ) : builders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px', color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>No builders yet</div>
            <div style={{ fontSize: 14 }}>Add your first builder partner</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {builders.map(b => (
              <div key={b.id} style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s', position: 'relative',
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 12,
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0,
                  }}>
                    {b.name?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>{b.name}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditingBuilder(b)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }} title="Edit"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(b.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444' }} title="Delete"><Trash size={14} /></button>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>📍 {b.city}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Projects</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{b.totalProjects || 0}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Contact</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.contactPerson || '—'}</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {b.phone && <div style={{ fontSize: 13, color: '#475569' }}>📞 {b.phone}</div>}
                  {b.website && (
                    <a href={b.website} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#3B82F6', textDecoration: 'none' }}>
                      🌐 {b.website}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBuilderModal onClose={() => setShowAddModal(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['builders'] })} />
      )}

      {editingBuilder && (
        <EditBuilderModal builder={editingBuilder} onClose={() => setEditingBuilder(null)} onSuccess={() => qc.invalidateQueries({ queryKey: ['builders'] })} />
      )}
    </div>
  );
}
