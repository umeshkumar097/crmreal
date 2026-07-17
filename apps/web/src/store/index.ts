import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  tenantId: string;
  tenant?: { id: string; name: string; slug: string; plan: string };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string, tenantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken, tenantId) => {
        Cookies.set('access_token', accessToken, {
          expires: 1 / 96,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        Cookies.set('refresh_token', refreshToken, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        Cookies.set('tenant_id', tenantId, { expires: 7, sameSite: 'strict' });
      },
      logout: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('tenant_id');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => {
        // SSR-safe storage
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
