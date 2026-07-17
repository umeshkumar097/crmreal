'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import s from './Header.module.css';

interface HeaderProps { title: string; subtitle?: string; }

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const rt = Cookies.get('refresh_token');
      if (rt) await api.post('/auth/logout', { refreshToken: rt });
    } catch { /* silent */ }
    logout();
    router.push('/login');
    toast.success('Logged out');
  };

  return (
    <header className={s.header}>
      <div className={s.left}>
        <div>
          <h1 className={s.title}>{title}</h1>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={s.right}>
        <div className={s.search}>
          <span>🔍</span>
          <input placeholder="Search..." className={s.searchInput} />
        </div>

        <button className={s.addBtn} onClick={() => router.push('/dashboard/leads?new=1')}>
          + Add Lead
        </button>

        <button className={s.iconBtn} aria-label="Notifications">
          🔔
          <span className={s.notifDot} />
        </button>

        <div className={s.profileWrap}>
          <button className={s.profileBtn} onClick={() => setOpen(!open)}>
            <div className={s.profileAvatar}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <span className={s.profileName}>{user?.firstName ?? 'User'} {user?.lastName ?? ''}</span>
              <span className={s.profileRole}>{user?.role ?? 'Admin'}</span>
            </div>
            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>▼</span>
          </button>

          {open && (
            <>
              <div className={s.overlay} onClick={() => setOpen(false)} />
              <div className={s.dropdown}>
                <div className={s.dropHeader}>
                  <span className={s.dropName}>{user?.firstName} {user?.lastName}</span>
                  <span className={s.dropEmail}>{user?.email}</span>
                </div>
                <button className={s.dropItem} onClick={() => { setOpen(false); router.push('/dashboard/settings'); }}>
                  ⚙️ Settings
                </button>
                <div className={s.divider} />
                <button className={`${s.dropItem} ${s.danger}`} onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
