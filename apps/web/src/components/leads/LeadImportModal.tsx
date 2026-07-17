'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImportResult {
  total: number;
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; reason: string; data: Record<string, unknown> }>;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'result';

interface PreviewRow {
  firstName: string; lastName: string; phone: string; email?: string;
  source?: string; priority?: string; stage?: string; notes?: string;
  [key: string]: string | undefined;
}

// ─── Column header aliases (auto-mapping) ──────────────────────────────────
const ALIAS: Record<string, string> = {
  'first name': 'firstName', 'firstname': 'firstName', 'name': 'firstName',
  'last name': 'lastName', 'lastname': 'lastName', 'surname': 'lastName',
  'mobile': 'phone', 'mobile no': 'phone', 'mobile number': 'phone',
  'phone no': 'phone', 'phone number': 'phone', 'contact': 'phone',
  'email id': 'email', 'email address': 'email',
  'lead source': 'source', 'source of lead': 'source',
  'pipeline stage': 'stage', 'lead stage': 'stage', 'status': 'stage',
  'remarks': 'notes', 'comment': 'notes',
};

// ─── Download template (pure client-side XLSX) ────────────────────────────────
function downloadTemplate() {
  const headers = [
    'firstName', 'lastName', 'phone', 'email', 'whatsapp',
    'source', 'priority', 'stage', 'propertyType',
    'budgetMin', 'budgetMax', 'locationPreference', 'preferredCity', 'notes',
  ];
  const sample = [
    ['Rahul', 'Sharma', '9876543210', 'rahul@gmail.com', '9876543210',
     'PORTAL', 'HIGH', 'INQUIRY', 'APARTMENT', '5000000', '8000000', 'Bandra West', 'Mumbai', 'Interested in sea-facing 2BHK'],
    ['Priya', 'Mehta', '9765432109', 'priya@email.com', '9765432109',
     'REFERRAL', 'MEDIUM', 'INQUIRY', 'VILLA', '10000000', '15000000', 'Whitefield', 'Bangalore', 'Looking for gated community villa'],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  ws['!cols'] = headers.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, 'realflow_leads_import_template.xlsx');
  toast.success('Template downloaded!');
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeadImportModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // { "Excel Header": "crmField" }
  
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorTab, setErrorTab] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Parse file client-side for mapping ─────────────────────────────────────
  const parseFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '', raw: false });
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      
      setTotalRows(rows.length);
      setRawRows(rows);
      setRawHeaders(headers);
      
      // Auto-map based on ALIAS
      const initialMap: Record<string, string> = {};
      headers.forEach(h => {
        const key = h.trim().toLowerCase();
        const mapped = ALIAS[key] ?? key;
        // If it's a known CRM field, map it
        if (['firstName', 'lastName', 'phone', 'email', 'whatsapp', 'source', 'priority', 'stage', 'propertyType', 'budgetMin', 'budgetMax', 'locationPreference', 'preferredCity', 'notes'].includes(mapped)) {
          initialMap[h] = mapped;
        }
      });
      setMapping(initialMap);
      setStep('mapping');
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) parseFile(dropped);
  }, [parseFile]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) parseFile(picked);
  };

  const goToPreview = () => {
    // Generate preview using mapping
    const mappedPreview = rawRows.slice(0, 5).map(raw => {
      const out: Record<string, string> = {};
      Object.entries(raw).forEach(([k, v]) => {
        const mappedKey = mapping[k];
        if (mappedKey) out[mappedKey] = String(v ?? '').trim();
      });
      return out as unknown as PreviewRow;
    });
    setPreview(mappedPreview);
    setStep('preview');
  };

  // ─── Upload to API ────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!file) return;
    setStep('importing');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 90));
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      
      const res = await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(interval);
      setProgress(100);
      const data: ImportResult = res.data?.data ?? res.data;
      setResult(data);
      setStep('result');
      if (data.inserted > 0) {
        toast.success(`✅ ${data.inserted} leads imported successfully!`);
        onSuccess();
      }
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Import failed';
      toast.error(msg);
      setStep('preview');
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────
  const s = {
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
    modal: { background: '#fff', borderRadius: 24, width: '100%', maxWidth: 820, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, boxShadow: '0 32px 80px rgba(0,0,0,0.25)' },
    hdr: { padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    body: { flex: 1, overflowY: 'auto' as const, padding: 28 },
    ftr: { padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
    btnPrimary: { padding: '10px 24px', background: '#2563EB', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' },
    btnSecondary: { padding: '10px 20px', background: '#f8fafc', color: '#374151', fontWeight: 600, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer' },
    btnGhost: { padding: '10px 20px', background: 'transparent', color: '#64748B', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 10, cursor: 'pointer' },
    pill: (color: string, bg: string) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, color, background: bg }),
  };

  // ─── Step: Upload ─────────────────────────────────────────────────────────────
  const renderUpload = () => (
    <>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', marginBottom: 3 }}>Supported formats: .xlsx, .xls, .csv</p>
          <p style={{ fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
            You can upload any file. In the next step, you will be able to map your columns to our system fields. Unmapped columns will be ignored.
          </p>
        </div>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#2563EB' : '#dde1e7'}`,
          borderRadius: 16, background: dragging ? '#eff6ff' : '#f8fafc',
          padding: '56px 24px', textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.2s', marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 14 }}>📂</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          {dragging ? 'Drop your file here' : 'Drag & drop your Excel or CSV file'}
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>or click to browse from your computer</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#2563EB', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
          📎 Choose File
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </>
  );

  // ─── Step: Mapping ────────────────────────────────────────────────────────────
  const renderMapping = () => {
    const crmFields = [
      { key: 'firstName', label: 'First Name', req: true },
      { key: 'lastName', label: 'Last Name', req: true },
      { key: 'phone', label: 'Phone Number', req: true },
      { key: 'email', label: 'Email Address' },
      { key: 'whatsapp', label: 'WhatsApp Number' },
      { key: 'source', label: 'Lead Source' },
      { key: 'priority', label: 'Priority' },
      { key: 'stage', label: 'Pipeline Stage' },
      { key: 'budgetMin', label: 'Min Budget' },
      { key: 'budgetMax', label: 'Max Budget' },
      { key: 'propertyType', label: 'Property Type' },
      { key: 'preferredCity', label: 'Preferred City' },
      { key: 'notes', label: 'Notes' },
    ];

    const handleMap = (crmFieldKey: string, excelCol: string) => {
      setMapping(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { if (next[k] === crmFieldKey) delete next[k]; });
        if (excelCol) next[excelCol] = crmFieldKey;
        return next;
      });
    };

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Map Columns</p>
            <p style={{ fontSize: 12, color: '#64748B' }}>
              Select which column from your file corresponds to each CRM field. Unmapped columns will be ignored.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {crmFields.map(field => {
            const selectedExcelCol = Object.keys(mapping).find(k => mapping[k] === field.key) || '';
            return (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {field.label}
                  {field.req && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <select
                  value={selectedExcelCol}
                  onChange={(e) => handleMap(field.key, e.target.value)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
                    fontSize: 13, color: '#0f172a', outline: 'none', background: '#fff'
                  }}
                >
                  <option value="">-- Ignore (Do not map) --</option>
                  {rawHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // ─── Step: Preview ────────────────────────────────────────────────────────────
  const renderPreview = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>File mapped successfully!</p>
          <p style={{ fontSize: 12, color: '#059669' }}>
            <strong>{file?.name}</strong> — {totalRows} data rows found.
            {totalRows > 2000 && <span style={{ color: '#ef4444' }}> ⚠️ Max 2000 rows allowed.</span>}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Preview (first 5 rows):</p>
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'First Name', 'Last Name', 'Phone', 'Email', 'Source', 'Priority'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748B', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#94a3b8' }}>{i + 2}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{row.firstName || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{row.lastName || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>
                  {row.phone
                    ? <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{row.phone}</span>
                    : <span style={{ color: '#ef4444', fontSize: 11 }}>⚠ Missing</span>}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B' }}>{row.email || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>
                  {row.source
                    ? <span style={s.pill('#1d4ed8', '#eff6ff')}>{row.source}</span>
                    : <span style={{ fontSize: 11, color: '#94a3b8' }}>OTHER</span>}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>
                  {row.priority
                    ? <span style={s.pill(row.priority === 'HIGH' || row.priority === 'URGENT' ? '#dc2626' : '#d97706', row.priority === 'HIGH' || row.priority === 'URGENT' ? '#fef2f2' : '#fffbeb')}>{row.priority}</span>
                    : <span style={s.pill('#d97706', '#fffbeb')}>MEDIUM</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalRows > 5 && (
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 16 }}>
          … and {totalRows - 5} more rows. All {Math.min(totalRows, 2000)} rows will be imported.
        </p>
      )}
    </>
  );

  // ─── Step: Importing ──────────────────────────────────────────────────────────
  const renderImporting = () => (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Importing Leads...</h3>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>
        Processing {Math.min(totalRows, 2000)} rows. Please do not close this window.
      </p>
      <div style={{ maxWidth: 400, margin: '0 auto', background: '#f1f5f9', borderRadius: 999, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563EB, #10B981)', height: '100%', borderRadius: 999, transition: 'width 0.3s ease' }} />
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 12 }}>{Math.round(progress)}%</p>
    </div>
  );

  // ─── Step: Result ─────────────────────────────────────────────────────────────
  const renderResult = () => {
    if (!result) return null;
    const allOk = result.skipped === 0;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#059669', lineHeight: 1 }}>{result.inserted}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginTop: 6 }}>✅ Imported</div>
          </div>
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ca8a04', lineHeight: 1 }}>{result.skipped}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#854d0e', marginTop: 6 }}>⚠️ Skipped</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#64748B', lineHeight: 1 }}>{result.total}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginTop: 6 }}>📊 Total</div>
          </div>
        </div>

        {allOk && (
          <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>🎉 All {result.total} leads imported successfully!</p>
          </div>
        )}

        {result.errors.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                ⚠️ {result.errors.length} row(s) had issues:
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setErrorTab(false)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: !errorTab ? '#2563EB' : '#f1f5f9', color: !errorTab ? '#fff' : '#64748B' }}>Summary</button>
                <button onClick={() => setErrorTab(true)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: errorTab ? '#2563EB' : '#f1f5f9', color: errorTab ? '#fff' : '#64748B' }}>Detail</button>
              </div>
            </div>
            {errorTab ? (
              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #fecdd3', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fecdd3' }}>
                      <th style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#dc2626', textAlign: 'left' }}>Row</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#dc2626', textAlign: 'left' }}>Reason</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#dc2626', textAlign: 'left' }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #fff5f5' }}>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Row {e.row}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: '#374151' }}>{e.reason}</td>
                        <td style={{ padding: '8px 12px', fontSize: 11, color: '#94a3b8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {Object.entries(e.data).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Array.from(new Set(result.errors.map((e) => e.reason))).map((reason) => {
                  const count = result.errors.filter((e) => e.reason === reason).length;
                  return (
                    <span key={reason} style={{ fontSize: 12, background: '#fef2f2', border: '1px solid #fecdd3', color: '#dc2626', padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>
                      {reason} ({count})
                    </span>
                  );
                })}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  const stepLabels: Record<Step, string> = {
    upload: '1. Select File',
    mapping: '2. Map Columns',
    preview: '3. Preview',
    importing: '4. Importing',
    result: '5. Done',
  };

  const hasRequiredFields = 
    Object.values(mapping).includes('firstName') && 
    Object.values(mapping).includes('lastName') && 
    Object.values(mapping).includes('phone');

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.hdr}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #2563EB, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              📊
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Import Leads from Excel / CSV</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Bulk upload up to 2,000 leads in one go</p>
            </div>
          </div>
          {step !== 'importing' && (
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#94a3b8' }}>
              ✕
            </button>
          )}
        </div>

        <div style={{ padding: '12px 28px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
          {(Object.keys(stepLabels) as Step[]).map((s_key, i, arr) => (
            <div key={s_key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: step === s_key ? '#2563EB' : (Object.keys(stepLabels).indexOf(step) > i ? '#ecfdf5' : '#e2e8f0'), color: step === s_key ? '#fff' : (Object.keys(stepLabels).indexOf(step) > i ? '#059669' : '#94a3b8') }}>
                  {Object.keys(stepLabels).indexOf(step) > i ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: step === s_key ? 700 : 500, color: step === s_key ? '#2563EB' : '#94a3b8', whiteSpace: 'nowrap' }}>{stepLabels[s_key]}</span>
              </div>
              {i < arr.length - 1 && <div style={{ width: 20, height: 1, background: '#e2e8f0' }} />}
            </div>
          ))}
        </div>

        <div style={s.body}>
          {step === 'upload' && renderUpload()}
          {step === 'mapping' && renderMapping()}
          {step === 'preview' && renderPreview()}
          {step === 'importing' && renderImporting()}
          {step === 'result' && renderResult()}
        </div>

        {step !== 'importing' && (
          <div style={s.ftr}>
            {step === 'upload' && (
              <>
                <button onClick={downloadTemplate} style={{ ...s.btnSecondary, display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
                  ⬇️ Download Template
                </button>
                <button onClick={onClose} style={s.btnGhost}>Cancel</button>
              </>
            )}
            {step === 'mapping' && (
              <>
                <button onClick={() => { setStep('upload'); setFile(null); }} style={s.btnSecondary}>
                  ← Change File
                </button>
                <button 
                  onClick={goToPreview} 
                  disabled={!hasRequiredFields}
                  style={{ ...s.btnPrimary, opacity: hasRequiredFields ? 1 : 0.5, cursor: hasRequiredFields ? 'pointer' : 'not-allowed' }}
                >
                  Continue →
                </button>
              </>
            )}
            {step === 'preview' && (
              <>
                <button onClick={() => setStep('mapping')} style={s.btnSecondary}>
                  ← Back to Mapping
                </button>
                <button onClick={handleImport} style={{ ...s.btnPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🚀 Import {Math.min(totalRows, 2000)} Leads
                </button>
              </>
            )}
            {step === 'result' && (
              <>
                <button onClick={downloadTemplate} style={{ ...s.btnSecondary, marginRight: 'auto' }}>⬇️ Download Template</button>
                <button onClick={onClose} style={s.btnPrimary}>Done ✓</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
