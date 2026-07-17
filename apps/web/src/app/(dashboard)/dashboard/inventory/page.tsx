'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash } from 'lucide-react';

interface InventoryUnit {
  id: string;
  unitNumber: string;
  floor: number;
  builtUpArea: number;
  carpetArea: number;
  basePrice: number;
  currentPrice: number;
  status: 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'SOLD';
  tower?: string;
  facing?: string;
  property?: { id: string; name: string };
  propertyId?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  AVAILABLE: { bg: '#D1FAE5', color: '#065F46' },
  HOLD: { bg: '#FEF3C7', color: '#92400E' },
  BOOKED: { bg: '#DBEAFE', color: '#1D4ED8' },
  SOLD: { bg: '#F1F5F9', color: '#475569' },
};

// ─── Add Unit Modal ──────────────────────────────────────────────────────────
function AddUnitModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get('/properties').then(r => setProperties(r.data?.data || []));
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/inventory', {
        ...data,
        floor: Number(data.floor),
        builtUpArea: Number(data.builtUpArea),
        carpetArea: data.carpetArea ? Number(data.carpetArea) : undefined,
        basePrice: Number(data.basePrice),
      });
      toast.success('Unit added to inventory! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add unit');
    }
  };

  const inp = {
    padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
    borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 550, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Add Unit / Inventory</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Select Property *</label>
            <select {...register('propertyId', { required: true })} style={{ ...inp, background: '#F8FAFC' }}>
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Unit Number *</label>
              <input {...register('unitNumber', { required: true })} placeholder="A-402" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Floor *</label>
              <input type="number" {...register('floor', { required: true })} placeholder="4" style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Built-Up Area (sqft) *</label>
              <input type="number" {...register('builtUpArea', { required: true })} placeholder="1250" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Carpet Area (sqft)</label>
              <input type="number" {...register('carpetArea')} placeholder="1050" style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Tower / Block</label>
              <input {...register('tower')} placeholder="Tower A" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Facing</label>
              <input {...register('facing')} placeholder="East Facing" style={inp} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Base Price (₹) *</label>
            <input type="number" {...register('basePrice', { required: true })} placeholder="7500000" style={inp} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', background: isSubmitting ? '#93C5FD' : '#3B82F6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Unit Modal ─────────────────────────────────────────────────────────
function EditUnitModal({ unit, onClose, onSuccess }: { unit: InventoryUnit; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      builtUpArea: unit.builtUpArea,
      carpetArea: unit.carpetArea || '',
      basePrice: unit.basePrice,
      currentPrice: unit.currentPrice || unit.basePrice,
      tower: unit.tower || '',
      facing: unit.facing || '',
      status: unit.status,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await api.patch(`/inventory/${unit.id}`, {
        ...data,
        floor: Number(data.floor),
        builtUpArea: Number(data.builtUpArea),
        carpetArea: data.carpetArea ? Number(data.carpetArea) : null,
        basePrice: Number(data.basePrice),
        currentPrice: Number(data.currentPrice),
      });
      toast.success('Unit details updated! 🎉');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update unit');
    }
  };

  const inp = {
    padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
    borderRadius: 8, fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 550, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Unit Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Unit Number</label>
              <input {...register('unitNumber', { required: true })} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Floor</label>
              <input type="number" {...register('floor', { required: true })} style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Built-Up Area</label>
              <input type="number" {...register('builtUpArea', { required: true })} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Carpet Area</label>
              <input type="number" {...register('carpetArea')} style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Status</label>
              <select {...register('status')} style={{ ...inp, background: '#F8FAFC' }}>
                {['AVAILABLE', 'HOLD', 'BOOKED', 'SOLD'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Tower</label>
              <input {...register('tower')} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Facing</label>
              <input {...register('facing')} style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Base Price</label>
              <input type="number" {...register('basePrice', { required: true })} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Current Price</label>
              <input type="number" {...register('currentPrice', { required: true })} style={inp} />
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
export default function InventoryPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<InventoryUnit | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then(r => r.data),
  });

  const units: InventoryUnit[] = data?.data || [];
  const filtered = units.filter(u => {
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchStatus;
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/inventory/${id}`, { status });
      toast.success('Unit status updated! 🎉');
      qc.invalidateQueries({ queryKey: ['inventory'] });
    } catch (e: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Unit deleted successfully');
      qc.invalidateQueries({ queryKey: ['inventory'] });
    } catch (e: any) {
      toast.error('Failed to delete unit');
    }
  };

  const formatCurrency = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');

  const selectStyle = {
    padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
    fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Inventory" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Inventory</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Browse and manage all property units</p>
          </div>
          {/* Filters & Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="ALL">All Status</option>
              {['AVAILABLE', 'HOLD', 'BOOKED', 'SOLD'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: '#fff',
                border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}
            >
              <Plus size={15} /> Add Unit
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0', height: 180 }}>
                <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: '60%', marginBottom: 10 }} />
                <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '40%', marginBottom: 8 }} />
                <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '80%', marginBottom: 8 }} />
                <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px', color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>No units found</div>
            <div style={{ fontSize: 14 }}>Try changing your filters</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map(u => (
              <div key={u.id} style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s', position: 'relative',
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>Unit {u.unitNumber}</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{u.property?.name || 'Property'}</div>
                  </div>
                  <select
                    value={u.status}
                    onChange={e => handleStatusChange(u.id, e.target.value)}
                    style={{
                      background: STATUS_STYLE[u.status]?.bg ?? '#F3F4F6',
                      color: STATUS_STYLE[u.status]?.color ?? '#6B7280',
                      padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: 'none', cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {['AVAILABLE', 'HOLD', 'BOOKED', 'SOLD'].map(st => (
                      <option key={st} value={st} style={{ background: '#fff', color: '#0F172A' }}>{st}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                    Floor {u.floor}
                  </span>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                    {u.builtUpArea} sqft
                  </span>
                  {u.tower && (
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                      {u.tower}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{formatCurrency(u.basePrice)}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingUnit(u)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }} title="Edit"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(u.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444' }} title="Delete"><Trash size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddUnitModal onClose={() => setShowAddModal(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['inventory'] })} />
      )}

      {editingUnit && (
        <EditUnitModal unit={editingUnit} onClose={() => setEditingUnit(null)} onSuccess={() => qc.invalidateQueries({ queryKey: ['inventory'] })} />
      )}
    </div>
  );
}
