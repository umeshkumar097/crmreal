'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Document {
  id: string;
  filename: string;
  type: 'PDF' | 'DOC' | 'IMAGE' | 'EXCEL' | 'OTHER';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
}

const TYPE_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  PDF: { bg: '#FEE2E2', color: '#991B1B', icon: '📄' },
  DOC: { bg: '#DBEAFE', color: '#1D4ED8', icon: '📝' },
  IMAGE: { bg: '#F0FDF4', color: '#166534', icon: '🖼️' },
  EXCEL: { bg: '#D1FAE5', color: '#065F46', icon: '📊' },
  OTHER: { bg: '#F1F5F9', color: '#475569', icon: '📁' },
};

function formatFileSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then(r => r.data),
  });

  const documents: Document[] = data?.data || [];
  const filtered = typeFilter === 'ALL' ? documents : documents.filter(d => d.type === typeFilter);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Documents" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Documents</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Manage and store project documents</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}
            >
              <option value="ALL">All Types</option>
              {['PDF', 'DOC', 'IMAGE', 'EXCEL', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>⬆ Upload</button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); }}
          style={{
            border: `2px dashed ${dragOver ? '#6366F1' : '#CBD5E1'}`,
            borderRadius: 16, padding: '32px', textAlign: 'center',
            marginBottom: 24, background: dragOver ? '#EFF6FF' : '#fff',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>☁️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Drag and drop files here</div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>or click Upload button above · PDF, DOC, Images up to 50MB</div>
        </div>

        {/* File Grid / Table */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['File Name', 'Type', 'Size', 'Uploaded By', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: '#F1F5F9', borderRadius: 6, width: '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📁</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No documents found</div>
                    <div style={{ fontSize: 13 }}>Upload your first document above</div>
                  </td>
                </tr>
              ) : (
                filtered.map((doc, i) => {
                  const ts = TYPE_STYLE[doc.type] || TYPE_STYLE.OTHER;
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{ts.icon}</span>
                          <span style={{ fontWeight: 500, color: '#0F172A', fontSize: 14 }}>{doc.filename}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: ts.bg, color: ts.color, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                          {doc.type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{formatFileSize(doc.size)}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{doc.uploadedBy}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14 }}>{formatDate(doc.uploadedAt)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <a
                          href={doc.downloadUrl || '#'}
                          style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                        >⬇ Download</a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
