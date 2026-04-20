import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  is_guest: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  shop: { id: string; slug: string; name: string; timezone: string } | null;
  setAuth: (user: User, token: string) => void;
  setShop: (shop: { id: string; slug: string; name: string; timezone: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      shop: null,
      setAuth: (user, token) => set({ user, token }),
      setShop: (shop) => set({ shop }),
      logout: () => set({ user: null, token: null, shop: null }),
    }),
    { name: 'chop-auth' }
  )
);
