'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Send, User, Wand2, ShieldAlert, FileText, Image as ImageIcon, Headphones, Bell, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  phone: string;
  lead?: { id: string; firstName: string; lastName: string; phone: string; assignedTo?: { id: string; firstName: string } };
  lastBody?: string;
  lastAt?: string;
  unread: number;
  messages: Message[];
}

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  type: string;
  mediaUrl?: string;
  sentAt: string;
  status: string;
}

interface UserAgent {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function WhatsAppInboxPage() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  
  // Media Upload inputs
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'document' | 'audio'>('image');
  const [showMediaInput, setShowMediaInput] = useState(false);

  const qc = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: convData, isLoading: convLoading, refetch: refetchConvs } = useQuery<any>({
    queryKey: ['whatsapp-conversations'],
    queryFn: () => api.get('/whatsapp/conversations').then(r => r.data),
  });

  const { data: msgData, isLoading: msgLoading, refetch: refetchMsgs } = useQuery<any>({
    queryKey: ['whatsapp-messages', selectedPhone],
    queryFn: () => api.get(`/whatsapp/messages/${selectedPhone}`).then(r => r.data),
    enabled: !!selectedPhone,
  });

  const { data: agentsRes } = useQuery<any>({
    queryKey: ['agents-list'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const conversations = convData || [];
  const messages = msgData || [];
  const agents = agentsRes || [];

  const activeChat = conversations.find((c: Conversation) => c.phone === selectedPhone);

  // Scroll to bottom when messages load
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (body: { to: string; message: string; leadId?: string }) =>
      api.post('/whatsapp/send', body),
    onSuccess: () => {
      setTypedMessage('');
      qc.invalidateQueries({ queryKey: ['whatsapp-messages', selectedPhone] });
      refetchConvs();
    },
    onError: () => {
      toast.error('Failed to send message. Is your WhatsApp linked and active?');
    }
  });

  const sendMediaMutation = useMutation({
    mutationFn: (body: { to: string; mediaUrl: string; type: 'image' | 'document' | 'audio'; caption?: string }) =>
      api.post('/whatsapp/send-media', body),
    onSuccess: () => {
      setMediaUrl('');
      setShowMediaInput(false);
      qc.invalidateQueries({ queryKey: ['whatsapp-messages', selectedPhone] });
      refetchConvs();
    },
    onError: () => {
      toast.error('Failed to send media file');
    }
  });

  const generateAiReply = useMutation({
    mutationFn: (phone: string) =>
      api.get(`/whatsapp/ai-suggest/${phone}`).then(r => r.data as { suggestion: string }),
    onSuccess: (data) => {
      setTypedMessage(data.suggestion);
      toast.success('Gemini AI suggested reply loaded!');
    },
    onError: () => {
      toast.error('Could not generate suggestion. Please enter manually.');
    }
  });

  const assignAgentMutation = useMutation({
    mutationFn: ({ phone, agentId }: { phone: string; agentId: string }) =>
      api.post(`/whatsapp/assign/${phone}`, { agentId }),
    onSuccess: () => {
      toast.success('Agent assigned successfully! 🎉');
      refetchConvs();
    },
    onError: () => {
      toast.error('Failed to assign agent');
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ phone, note }: { phone: string; note: string }) =>
      api.post(`/whatsapp/note/${phone}`, { note }),
    onSuccess: () => {
      setInternalNote('');
      toast.success('Internal CRM note logged!');
    },
    onError: () => {
      toast.error('Failed to log note');
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedPhone) return;
    sendMessageMutation.mutate({
      to: selectedPhone,
      message: typedMessage,
      leadId: activeChat?.lead?.id,
    });
  };

  const handleSendMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim() || !selectedPhone) return;
    sendMediaMutation.mutate({
      to: selectedPhone,
      mediaUrl,
      type: mediaType,
      caption: mediaType === 'image' ? 'Sent from PropCRM' : undefined,
    });
  };

  const filteredConversations = conversations.filter((c: Conversation) => {
    const term = search.toLowerCase();
    const name = (c.lead?.firstName + ' ' + c.lead?.lastName).toLowerCase();
    return name.includes(term) || c.phone.includes(term);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="WhatsApp Inbox" />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        
        {/* Left Sidebar - Chat threads */}
        <div style={{ width: 340, background: '#1F2937', display: 'flex', flexDirection: 'column', borderRight: '1px solid #374151', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#F9FAFB' }}>💬 WhatsApp Threads</span>
              <Link href="/dashboard/whatsapp/connection" style={{ background: '#374151', border: '1px solid #4B5563', color: '#F9FAFB', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                ⚙️ Link Devices
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#374151', border: '1px solid #4B5563', borderRadius: 10, padding: '8px 12px' }}>
              <Search size={14} color="#9CA3AF" />
              <input
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#F9FAFB', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #374151', display: 'flex', gap: 12, animation: 'pulse 1.5s infinite' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#374151', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, background: '#374151', borderRadius: 6, width: '60%', marginBottom: 6 }} />
                    <div style={{ height: 11, background: '#374151', borderRadius: 6, width: '85%' }} />
                  </div>
                </div>
              ))
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 13 }}>No active chats matching search criteria</div>
              </div>
            ) : (
              filteredConversations.map((c: Conversation) => (
                <div
                  key={c.phone}
                  onClick={() => setSelectedPhone(c.phone)}
                  style={{
                    padding: '14px 20px', borderBottom: '1px solid #374151',
                    cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                    background: selectedPhone === c.phone ? '#374151' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                  }}>
                    {c.lead ? c.lead.firstName[0]?.toUpperCase() : '?'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#F9FAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.lead ? `${c.lead.firstName} ${c.lead.lastName}` : `+${c.phone}`}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>{timeAgo(c.lastAt)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#D1D5DB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {c.lastBody || 'Start chatting...'}
                      </span>
                      {c.unread > 0 && (
                        <span style={{ background: '#25D366', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 6 }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Panel - Conversation Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
          {selectedPhone ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {activeChat?.lead ? activeChat.lead.firstName[0]?.toUpperCase() : '?'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    {activeChat?.lead ? `${activeChat.lead.firstName} ${activeChat.lead.lastName}` : `+${selectedPhone}`}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>💬 Active WhatsApp Chat</p>
                </div>
              </div>

              {/* Chat Bubble Logs */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {msgLoading ? (
                  <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>Send a message to start conversation.</div>
                ) : (
                  messages.map((m: Message) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.direction === 'OUTBOUND' ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: m.direction === 'OUTBOUND' ? '#25D366' : '#fff',
                        color: m.direction === 'OUTBOUND' ? '#fff' : '#0F172A',
                        borderRadius: 12, padding: '10px 14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        border: m.direction === 'INBOUND' ? '1px solid #E2E8F0' : 'none',
                      }}
                    >
                      {m.mediaUrl && (
                        <div style={{ marginBottom: 6 }}>
                          {m.type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.mediaUrl} alt="media" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 180 }} />
                          ) : (
                            <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: m.direction === 'OUTBOUND' ? '#fff' : '#25D366', textDecoration: 'underline' }}>
                              <FileText size={16} /> Open Document File
                            </a>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: 14, lineHeight: 1.4 }}>{m.body}</div>
                      <div style={{ fontSize: 10, textAlign: 'right', marginTop: 4, opacity: 0.7 }}>
                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Add Attachment Panel */}
              {showMediaInput && (
                <form onSubmit={handleSendMedia} style={{ background: '#fff', borderTop: '1px solid #E2E8F0', padding: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={mediaType} onChange={e => setMediaType(e.target.value as any)} style={{ padding: 8, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                    <option value="image">Image URL</option>
                    <option value="document">Document URL</option>
                    <option value="audio">Voice Note URL</option>
                  </select>
                  <input
                    placeholder="Enter file URL to send..."
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    style={{ flex: 1, padding: 8, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    required
                  />
                  <button type="submit" disabled={sendMediaMutation.isPending} style={{ padding: '8px 16px', background: '#3B82F6', border: 'none', color: '#fff', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                    Send File
                  </button>
                  <button type="button" onClick={() => setShowMediaInput(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </form>
              )}

              {/* Chat Input Actions bar */}
              <div style={{ background: '#fff', borderTop: '1px solid #E2E8F0', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    📎 Attachment
                  </button>
                  <button
                    onClick={() => generateAiReply.mutate(selectedPhone)}
                    disabled={generateAiReply.isPending}
                    style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 13, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Wand2 size={13} /> {generateAiReply.isPending ? 'Analyzing context...' : 'Magic AI Suggest'}
                  </button>
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
                  <input
                    placeholder="Type your WhatsApp message..."
                    value={typedMessage}
                    onChange={e => setTypedMessage(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none' }}
                  />
                  <button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    style={{ background: '#25D366', color: '#fff', border: 'none', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: 54, marginBottom: 12 }}>💬</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#64748B', margin: 0 }}>Select a Conversation</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Pick an agent thread on the left to start sending updates</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Agent Assigning & Internal Notes */}
        {selectedPhone && (
          <div style={{ width: 280, background: '#fff', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0, padding: 20, gap: 20 }}>
            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Assign Lead Agent</h4>
              <select
                value={activeChat?.lead?.assignedTo?.id || ''}
                onChange={e => assignAgentMutation.mutate({ phone: selectedPhone, agentId: e.target.value })}
                style={{ width: '100%', padding: 9, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff' }}
              >
                <option value="">Select Agent</option>
                {agents.map((a: UserAgent) => (
                  <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.role})</option>
                ))}
              </select>
            </div>

            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Internal Notes</h4>
              <textarea
                placeholder="Log internal notes regarding this lead conversation..."
                value={internalNote}
                onChange={e => setInternalNote(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: 10, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <button
                onClick={() => addNoteMutation.mutate({ phone: selectedPhone, note: internalNote })}
                disabled={!internalNote.trim() || addNoteMutation.isPending}
                style={{ width: '100%', padding: '8px 0', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
              >
                Submit Note
              </button>
            </div>

            <div style={{ marginTop: 'auto', background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, color: '#64748B' }}>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldAlert size={14} color="#3B82F6" /> Real Estate Copilot
              </div>
              Write messages with templates or use Gemini magic suggestions to speed up client closures.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
