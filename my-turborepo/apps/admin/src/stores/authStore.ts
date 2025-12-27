import { create } from 'zustand';
import { api } from '../lib/api';

export type RolUsuario = 'SUPERADMIN' | 'DUENO' | 'EMPLEADO' | 'CLIENTE';

export interface Usuario {
  id: string;
  email: string | null;
  telefono: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  complejoId?: string | null;
}

interface AuthState {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (telefono: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (identifier: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      set({
        usuario: response.data.usuario,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ usuario: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ usuario: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      set({ usuario: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/profile');
      set({
        usuario: response.data,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ usuario: null, isAuthenticated: false, isLoading: false });
    }
  },
}));