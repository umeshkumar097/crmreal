'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Customer { id: string; firstName: string; lastName: string; phone: string; }
interface Property { id: string; name: string; city: string; }
interface Unit { id: string; unitNumber: string; floor: string; status: string; }

export default function AddBookingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [customerId, setCustomerId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [agreementValue, setAgreementValue] = useState('');
  const [bookingAmount, setBookingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customersData } = useQuery({ queryKey: ['customers'], queryFn: () => api.get('/customers').then(r => r.data) });
  const { data: propertiesData } = useQuery({ queryKey: ['properties'], queryFn: () => api.get('/properties').then(r => r.data) });
  const { data: unitsData } = useQuery({ 
    queryKey: ['units', propertyId], 
    queryFn: () => api.get('/inventory', { params: { propertyId, status: 'AVAILABLE' } }).then(r => r.data),
    enabled: !!propertyId 
  });

  const customers: Customer[] = customersData?.data || [];
  const properties: Property[] = propertiesData?.data || [];
  const units: Unit[] = unitsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !propertyId || !unitId || !bookingDate || !agreementValue || !bookingAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/bookings', {
        customerId,
        unitId,
        bookingDate: new Date(bookingDate).toISOString(),
        agreementValue: Number(agreementValue),
        bookingAmount: Number(bookingAmount),
        notes
      });
      toast.success('Booking created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 600, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Create Booking</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Customer *</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}
            >
              <option value="">Select a customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.phone})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Property *</label>
              <select
                value={propertyId}
                onChange={e => { setPropertyId(e.target.value); setUnitId(''); }}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}
              >
                <option value="">Select property</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Unit *</label>
              <select
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                disabled={!propertyId || units.length === 0}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}
              >
                <option value="">{units.length === 0 && propertyId ? 'No available units' : 'Select unit'}</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.unitNumber} (Floor {u.floor})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Agreement Value (₹) *</label>
              <input
                type="number"
                value={agreementValue}
                onChange={e => setAgreementValue(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Booking Amount (₹) *</label>
              <input
                type="number"
                value={bookingAmount}
                onChange={e => setBookingAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Date *</label>
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 16px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '10px 16px', background: '#10B981', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
