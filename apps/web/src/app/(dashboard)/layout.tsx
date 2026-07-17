'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useUIStore } from '@/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minWidth: 0,
        transition: 'all 0.2s ease',
        marginLeft: 0,
      }}>
        {children}
      </main>
    </div>
  );
}
