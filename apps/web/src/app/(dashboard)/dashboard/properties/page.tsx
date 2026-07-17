'use client';
import Header from '@/components/layout/Header';
import { Building2, Plus, Grid, List, Search, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  status: string;
  totalUnits: number;
  reraNumber?: string;
}
interface PropertiesRes {
  data: Property[];
  total: number;
}

const TYPE_ICONS: Record<string, string> = {
  APARTMENT: '🏢', VILLA: '🏡', PLOT: '📐', COMMERCIAL: '🏬', STUDIO: '🏠', PENTHOUSE: '🌇', OFFICE: '🏛️', WAREHOUSE: '🏭'
};

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: '#F59E0B', ACTIVE: '#10B981', SOLD_OUT: '#6B7280', ON_HOLD: '#EF4444'
};

// ─── Add Property Modal ──────────────────────────────────────────────────────
function AddPropertyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [builders, setBuilders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get('/builders').then(r => setBuilders(r.data?.data || []));
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/properties', {
        ...data,
        totalUnits: data.totalUnits ? Number(data.totalUnits) : 0,
        amenities: data.amenities ? data.amenities.split(',').map((s: string) => s.trim()) : [],
      });
      toast.success('Property created successfully! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create property');
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Add New Property</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Property Name *</label>
              <input {...register('name', { required: true })} placeholder="Emaar Palm Heights" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Property Type *</label>
              <select {...register('type', { required: true })} style={{ ...inp, background: '#F8FAFC' }}>
                {['APARTMENT','VILLA','PLOT','COMMERCIAL','STUDIO','PENTHOUSE','OFFICE','WAREHOUSE'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>City *</label>
              <input {...register('city', { required: true })} placeholder="Gurugram" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>State *</label>
              <input {...register('state', { required: true })} placeholder="Haryana" style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Builder</label>
              <select {...register('builderId')} style={{ ...inp, background: '#F8FAFC' }}>
                <option value="">Select Builder</option>
                {builders.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>RERA Number</label>
              <input {...register('reraNumber')} placeholder="RERA-12345" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Total Units</label>
              <input type="number" {...register('totalUnits')} placeholder="150" style={inp} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Amenities (comma separated)</label>
            <input {...register('amenities')} placeholder="Gym, Swimming Pool, Parking, 24x7 Security" style={inp} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Description</label>
            <textarea {...register('description')} placeholder="Project details..." rows={3} style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', background: isSubmitting ? '#93C5FD' : '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Creating...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Property Modal ─────────────────────────────────────────────────────
function EditPropertyModal({ property, onClose, onSuccess }: { property: Property; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: property.name,
      type: property.type,
      city: property.city,
      state: property.state,
      reraNumber: property.reraNumber || '',
      totalUnits: property.totalUnits || 0,
      status: property.status,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await api.patch(`/properties/${property.id}`, {
        ...data,
        totalUnits: Number(data.totalUnits),
      });
      toast.success('Property updated successfully! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update property');
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Property Details</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Property Name</label>
              <input {...register('name', { required: true })} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Property Type</label>
              <select {...register('type')} style={{ ...inp, background: '#F8FAFC' }}>
                {['APARTMENT','VILLA','PLOT','COMMERCIAL','STUDIO','PENTHOUSE','OFFICE','WAREHOUSE'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>City</label>
              <input {...register('city', { required: true })} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>State</label>
              <input {...register('state', { required: true })} style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Status</label>
              <select {...register('status')} style={{ ...inp, background: '#F8FAFC' }}>
                {['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'ON_HOLD'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>RERA Number</label>
              <input {...register('reraNumber')} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Total Units</label>
              <input type="number" {...register('totalUnits')} style={inp} />
            </div>
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
export default function PropertiesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<PropertiesRes>({
    queryKey: ['properties', search],
    queryFn: () => api.get('/properties', { params: { search: search || undefined } }).then(r => r.data as PropertiesRes),
  });

  const properties = data?.data ?? [];

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/properties/${id}`, { status });
      toast.success('Property status updated! 🎉');
      qc.invalidateQueries({ queryKey: ['properties'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted successfully');
      qc.invalidateQueries({ queryKey: ['properties'] });
    } catch (e: any) {
      toast.error('Failed to delete property');
    }
  };

  return (
    <div className="page">
      <Header title="Properties" subtitle={`${data?.total ?? 0} projects`} />
      <div className="page-body">
        <div className="toolbar">
          <div className="search-box">
            <Search size={14} />
            <input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid size={15} /></button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={15} /></button>
            </div>
            <button className="add-btn" onClick={() => setShowAddModal(true)}><Plus size={15} /> Add Property</button>
          </div>
        </div>

        {isLoading ? (
          <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-card" />)}</div>
        ) : view === 'grid' ? (
          <div className="prop-grid">
            {properties.map(p => (
              <div key={p.id} className="prop-card">
                <div className="prop-card-top" style={{ background: `linear-gradient(135deg, #1E293B, #334155)` }}>
                  <span className="prop-type-icon">{TYPE_ICONS[p.type] ?? '🏗️'}</span>
                  <select
                    value={p.status}
                    onChange={e => handleStatusChange(p.id, e.target.value)}
                    style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: STATUS_COLORS[p.status] + '20', color: STATUS_COLORS[p.status],
                      border: 'none', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'ON_HOLD'].map(st => (
                      <option key={st} value={st} style={{ background: '#fff', color: '#0F172A' }}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="prop-card-body">
                  <h3 className="prop-name">{p.name}</h3>
                  <p className="prop-location">📍 {p.city}, {p.state}</p>
                  <div className="prop-stats">
                    <div className="prop-stat"><span className="prop-stat-value">{p.totalUnits}</span><span className="prop-stat-label">Total Units</span></div>
                    <div className="prop-stat"><span className="prop-stat-value">{p.type}</span><span className="prop-stat-label">Type</span></div>
                    {p.reraNumber && <div className="prop-stat"><span className="prop-stat-value" style={{ fontSize: '0.68rem' }}>{p.reraNumber}</span><span className="prop-stat-label">RERA</span></div>}
                  </div>
                </div>
                <div className="prop-card-actions">
                  <button className="prop-view-btn">View Inventory</button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="prop-more" onClick={() => setEditingProperty(p)} title="Edit Property"><Edit size={14} /></button>
                    <button className="prop-more" onClick={() => handleDelete(p.id)} title="Delete Property"><Trash size={14} color="#EF4444" /></button>
                  </div>
                </div>
              </div>
            ))}
            <div className="prop-card prop-card-add" onClick={() => setShowAddModal(true)}>
              <Building2 size={36} color="#CBD5E1" />
              <span>Add New Property</span>
            </div>
          </div>
        ) : (
          <div className="prop-list">
            {properties.map(p => (
              <div key={p.id} className="prop-list-row">
                <div className="prop-list-icon">{TYPE_ICONS[p.type]}</div>
                <div className="prop-list-info">
                  <span className="prop-list-name">{p.name}</span>
                  <span className="prop-list-loc">{p.city}, {p.state}</span>
                </div>
                <span className="prop-type-chip">{p.type}</span>
                <span className="prop-list-units">{p.totalUnits} units</span>
                <select
                  value={p.status}
                  onChange={e => handleStatusChange(p.id, e.target.value)}
                  style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                    border: '1px solid #E2E8F0', cursor: 'pointer', outline: 'none',
                    color: STATUS_COLORS[p.status]
                  }}
                >
                  {['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'ON_HOLD'].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="prop-more" onClick={() => setEditingProperty(p)} title="Edit"><Edit size={14} /></button>
                  <button className="prop-more" onClick={() => handleDelete(p.id)} title="Delete"><Trash size={14} color="#EF4444" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPropertyModal onClose={() => setShowAddModal(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['properties'] })} />
      )}

      {editingProperty && (
        <EditPropertyModal property={editingProperty} onClose={() => setEditingProperty(null)} onSuccess={() => qc.invalidateQueries({ queryKey: ['properties'] })} />
      )}

      <style jsx>{`
        .page { min-height: 100vh; background: #F8FAFC; }
        .page-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .search-box { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; padding: 8px 14px; min-width: 260px; color: #64748B; }
        .search-box input { border: none; outline: none; font-size: 0.85rem; color: #0F172A; background: transparent; width: 100%; }
        .search-box input::placeholder { color: #CBD5E1; }
        .view-toggle { display: flex; background: #F1F5F9; border-radius: 10px; padding: 3px; gap: 2px; }
        .view-toggle button { width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #94A3B8; background: transparent; transition: all 0.15s; }
        .view-toggle button.active { background: #fff; color: #3B82F6; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .add-btn { display: flex; align-items: center; gap: 6px; background: #3B82F6; color: #fff; border: none; border-radius: 10px; padding: 8px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .skeleton-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .skeleton-card { height: 260px; background: #E2E8F0; border-radius: 16px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .prop-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .prop-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .prop-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .prop-card-top { height: 120px; position: relative; display: flex; align-items: flex-end; justify-content: space-between; padding: 14px; }
        .prop-type-icon { font-size: 2.5rem; }
        .prop-status-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
        .prop-card-body { padding: 16px; }
        .prop-name { font-size: 1rem; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
        .prop-location { font-size: 0.78rem; color: #64748B; margin-bottom: 12px; }
        .prop-stats { display: flex; gap: 16px; }
        .prop-stat { display: flex; flex-direction: column; gap: 2px; }
        .prop-stat-value { font-size: 0.875rem; font-weight: 700; color: #0F172A; }
        .prop-stat-label { font-size: 0.65rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
        .prop-card-actions { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #F1F5F9; }
        .prop-view-btn { background: #EFF6FF; color: #3B82F6; border: none; border-radius: 8px; padding: 6px 12px; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
        .prop-more { background: none; border: none; color: #94A3B8; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; transition: background 0.1s; }
        .prop-more:hover { background: #F1F5F9; color: #334155; }
        .prop-card-add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 220px; cursor: pointer; border: 2px dashed #E2E8F0; color: #94A3B8; font-size: 0.85rem; font-weight: 500; }
        .prop-card-add:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }
        .prop-list { display: flex; flex-direction: column; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
        .prop-list-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-bottom: 1px solid #F1F5F9; transition: background 0.1s; justify-content: space-between; }
        .prop-list-row:hover { background: #F8FAFC; }
        .prop-list-icon { font-size: 1.5rem; width: 36px; text-align: center; }
        .prop-list-info { flex: 1; }
        .prop-list-name { display: block; font-weight: 600; color: #0F172A; font-size: 0.875rem; }
        .prop-list-loc { font-size: 0.75rem; color: #94A3B8; }
        .prop-type-chip { background: #F1F5F9; color: #475569; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 500; white-space: nowrap; }
        .prop-list-units { font-size: 0.8rem; color: #64748B; white-space: nowrap; }
      `}</style>
    </div>
  );
}
