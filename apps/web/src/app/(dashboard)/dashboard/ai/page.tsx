'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FEATURES = [
  { icon: '🎯', title: 'Lead Scoring', description: 'AI-powered scoring for prioritizing your hottest leads automatically', color: '#3B82F6' },
  { icon: '📞', title: 'Call Transcription', description: 'Automatically transcribe and analyze sales calls in real-time', color: '#10B981' },
  { icon: '💡', title: 'Smart Suggestions', description: 'Context-aware recommendations to close deals faster', color: '#8B5CF6' },
  { icon: '❤️', title: 'Sentiment Analysis', description: 'Understand lead emotions and tailor your approach', color: '#F97316' },
];

const SUGGESTIONS = [
  'Which leads are most likely to close this week?',
  'Summarize today\'s follow-ups',
  'Show overdue payments',
  'Analyze our best performing channel',
];

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am PropCRM AI Copilot. How can I help you today? I can help you analyze leads, summarize data, suggest follow-up strategies, and much more.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponses = [
        'I\'m analyzing your CRM data to provide insights on that. Based on recent activity, I can see several opportunities.',
        'Great question! Let me pull up the relevant data from your pipeline and give you a detailed analysis.',
        'Based on your current data, here are my top recommendations to improve your conversion rate.',
        'I\'ve analyzed the trends in your leads. Here\'s what I found: your highest quality leads are coming from referrals.',
      ];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="AI Copilot" />
      <div style={{ padding: '20px 24px' }}>
        {/* Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff',
          boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 36 }}>🤖</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>PropCRM AI Copilot</h1>
              <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 14 }}>Powered by Gemini · Your intelligent real estate assistant</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {/* Left: Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: f.color + '18', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{f.description}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestions */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Try asking</div>
              {SUGGESTIONS.map(s => (
                <div key={s}
                  onClick={() => setInput(s)}
                  style={{
                    padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 13,
                    color: '#475569', cursor: 'pointer', marginBottom: 6, border: '1px solid #E2E8F0',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = '#EFF6FF'; (e.currentTarget as HTMLDivElement).style.color = '#3B82F6'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLDivElement).style.color = '#475569'; }}
                >
                  💬 {s}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat Interface */}
          <div style={{
            background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 280px)', minHeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
              {messages.map(m => (
                <div key={m.id} style={{
                  display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 16,
                }}>
                  {m.role === 'assistant' && (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, marginRight: 8, flexShrink: 0,
                    }}>🤖</div>
                  )}
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{
                      padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: m.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#F8FAFC',
                      color: m.role === 'user' ? '#fff' : '#0F172A',
                      fontSize: 14, lineHeight: 1.6, border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>🤖</div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '18px 18px 18px 4px', padding: '12px 16px' }}>
                    <span style={{ color: '#94A3B8', fontSize: 14 }}>AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI Copilot anything..."
                  rows={1}
                  style={{
                    flex: 1, padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: 12,
                    fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif',
                    color: '#0F172A', background: '#F8FAFC',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    padding: '0 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#E2E8F0',
                    color: input.trim() ? '#fff' : '#94A3B8', fontWeight: 600, fontSize: 14,
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                >Send ➤</button>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>Press Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
