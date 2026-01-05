import { create } from 'zustand';
import type { User } from '../core/schema';
import { api } from '../data/api';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    api.setCurrentUser(user);
  },
  loadUser: async () => {
    const user = await api.getCurrentUser();
    set({ user });
  },
}));

