'use client';

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
  assigneeName?: string;
  assigneeInitials?: string;
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  LOW: { bg: '#F1F5F9', color: '#475569' },
  MEDIUM: { bg: '#DBEAFE', color: '#1D4ED8' },
  HIGH: { bg: '#FEF3C7', color: '#92400E' },
  URGENT: { bg: '#FEE2E2', color: '#991B1B' },
};

const COLUMNS = [
  { key: 'TODO', label: '📝 To Do', color: '#64748B', border: '#E2E8F0', headerBg: '#F8FAFC' },
  { key: 'IN_PROGRESS', label: '🔄 In Progress', color: '#3B82F6', border: '#BFDBFE', headerBg: '#EFF6FF' },
  { key: 'DONE', label: '✅ Done', color: '#10B981', border: '#A7F3D0', headerBg: '#F0FDF4' },
];

function TaskCard({ task }: { task: Task }) {
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'grab', marginBottom: 10,
      transition: 'box-shadow 0.2s',
    }}
      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ marginBottom: 8 }}>
        <span style={{ ...PRIORITY_STYLE[task.priority], padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
          {task.priority}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
      {task.description && (
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.description}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {task.dueDate ? (
          <span style={{ fontSize: 11, color: isOverdue ? '#EF4444' : '#94A3B8', fontWeight: isOverdue ? 600 : 400 }}>
            {isOverdue ? '🚨' : '📅'} {formatDate(task.dueDate)}
          </span>
        ) : <span />}
        {task.assigneeName && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 11,
          }} title={task.assigneeName}>
            {task.assigneeInitials || task.assigneeName[0]}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  });

  const tasks: Task[] = data?.data || [];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Header title="Tasks" />
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Tasks</h1>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Kanban board for team task management</p>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
          }}>+ Add Task</button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {COLUMNS.map(col => (
              <div key={col.key} style={{ background: col.headerBg, border: `1px solid ${col.border}`, borderRadius: 16, padding: 16 }}>
                <div style={{ height: 20, background: '#E2E8F0', borderRadius: 6, width: '60%', marginBottom: 16 }} />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, height: 100 }}>
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '40%', marginBottom: 8 }} />
                    <div style={{ height: 14, background: '#F1F5F9', borderRadius: 6, width: '80%', marginBottom: 8 }} />
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '60%' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.key);
              return (
                <div key={col.key} style={{
                  background: col.headerBg, border: `1px solid ${col.border}`,
                  borderRadius: 16, padding: 16, minHeight: 400,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: col.color }}>{col.label}</span>
                    <span style={{ background: '#fff', border: `1px solid ${col.border}`, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: col.color }}>
                      {colTasks.length}
                    </span>
                  </div>
                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: '#CBD5E1' }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📭</div>
                      <div style={{ fontSize: 13 }}>No tasks here</div>
                    </div>
                  ) : (
                    colTasks.map(t => <TaskCard key={t.id} task={t} />)
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
