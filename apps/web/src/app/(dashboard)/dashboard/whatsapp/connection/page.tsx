'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Plus, RefreshCw, Trash2, LogOut, CheckCircle2, User, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  sessionName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING' | 'EXPIRED';
  qrStatus: 'PENDING' | 'SCANNED' | 'EXPIRED';
  qrCode?: string;
  phoneNumber?: string;
  displayName?: string;
  profilePic?: string;
  deviceModel?: string;
  connectedAt?: string;
  lastSeen?: string;
  lastActivity?: string;
}

// ─── Add Connection Modal ──────────────────────────────────────────────────
function AddConnectionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSession, setCreatedSession] = useState<Session | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState('PENDING');

  // Poll status of the newly created session to see if pairing succeeded
  useEffect(() => {
    if (!createdSession) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/whatsapp/session/${createdSession.id}/status`);
        const status = res.data?.status;
        setQrStatus(res.data?.qrStatus || 'PENDING');
        
        if (status === 'CONNECTED') {
          toast.success('WhatsApp paired successfully! 🎉');
          clearInterval(interval);
          onSuccess();
          onClose();
        } else {
          // Keep polling QR code if pending
          const qrRes = await api.get(`/whatsapp/session/${createdSession.id}/qr`);
          if (qrRes.data?.qrCode) {
            setQrCode(qrRes.data.qrCode);
          }
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [createdSession, onClose, onSuccess]);

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/whatsapp/session/create', { sessionName: name });
      setCreatedSession(res.data);
      setQrCode(res.data?.qrCode || null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 450, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Pair WhatsApp Device</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        {!createdSession ? (
          <form onSubmit={handleInit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Device / Session Name</label>
              <input
                placeholder="e.g. Sales Account, Support Desk"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
            >
              {loading ? 'Initializing...' : 'Generate QR Code'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>Open WhatsApp on your phone, go to **Linked Devices**, and scan this QR code:</p>
            
            <div style={{ padding: 16, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 220 }}>
              {qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <div style={{ color: '#94A3B8', fontSize: 13 }}>Generating QR Code...</div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#F59E0B' }}>Waiting for pairing scan ({qrStatus})...</span>
            </div>

            <button
              onClick={onClose}
              style={{ width: '100%', padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              Cancel Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WhatsAppConnectionPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ['whatsapp-sessions'],
    queryFn: () => api.get('/whatsapp/sessions').then(r => r.data),
  });

  const sessions = data || [];

  const handleDisconnect = async (id: string) => {
    try {
      await api.post(`/whatsapp/session/${id}/disconnect`);
      toast.success('Device disconnected');
      refetch();
    } catch (e) {
      toast.error('Failed to disconnect device');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this connection details?')) return;
    try {
      await api.delete(`/whatsapp/session/${id}`);
      toast.success('Connection removed');
      refetch();
    } catch (e) {
      toast.error('Failed to remove connection');
    }
  };

  const handleReconnect = async (id: string) => {
    try {
      const res = await api.get(`/whatsapp/session/${id}/status`);
      toast.success(`Connection status: ${res.data?.status || 'UPDATED'}`);
      refetch();
    } catch (e) {
      toast.error('Failed to reconnect session');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="WhatsApp Connection" />
      <div style={{ padding: '24px' }}>
        
        {/* Connection Page Banner */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck color="#25D366" size={24} /> WhatsApp Linker Platform
            </h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Connect multiple WhatsApp numbers and assign conversations to different sales agents.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/dashboard/whatsapp" style={{ padding: '10px 18px', border: '1px solid #CBD5E1', borderRadius: 10, color: '#475569', background: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
              💬 Go to Inbox
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
            >
              <Plus size={15} /> Link WhatsApp Account
            </button>
          </div>
        </div>

        {/* Sessions list */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', height: 200, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: 16, padding: '80px 24px', textAlign: 'center', color: '#94A3B8' }}>
            <div style={{ fontSize: 54, marginBottom: 12 }}>📲</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#475569', marginBottom: 6 }}>No connected devices yet</div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>Link your first phone number to start receiving leads directly on WhatsApp</div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ padding: '10px 20px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              + Link WhatsApp Account
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {sessions.map((s: Session) => (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Session Header info */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {s.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.profilePic} alt="profile" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                      <User size={22} />
                    </div>
                  )}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sessionName}</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{s.phoneNumber ? `+${s.phoneNumber}` : 'No phone linked'}</div>
                  </div>
                  <span style={{
                    background: s.status === 'CONNECTED' ? '#D1FAE5' : '#FEE2E2',
                    color: s.status === 'CONNECTED' ? '#065F46' : '#991B1B',
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em'
                  }}>
                    {s.status}
                  </span>
                </div>

                {/* Session Body details */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Display Name:</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{s.displayName || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Device:</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{s.deviceModel || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Linked At:</span>
                    <span>{s.connectedAt ? new Date(s.connectedAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>

                {/* Session Actions footer */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <button
                    onClick={() => handleReconnect(s.id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    <RefreshCw size={13} /> Reconnect
                  </button>
                  
                  {s.status === 'CONNECTED' ? (
                    <button
                      onClick={() => handleDisconnect(s.id)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 12px', border: 'none', borderRadius: 8, background: '#FEE2E2', fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}
                    >
                      <LogOut size={13} /> Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 12px', border: 'none', borderRadius: 8, background: '#F5F5F5', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddConnectionModal onClose={() => setShowAddModal(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['whatsapp-sessions'] })} />
      )}
    </div>
  );
}
