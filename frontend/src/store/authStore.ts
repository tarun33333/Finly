import { create } from 'zustand';
import { User } from '../types';
import { storage } from '../utils/storage';
import { apiClient } from '../services/api/client';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricLocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  googleAuth: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  unlockWithBiometrics: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isBiometricLocked: false,

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await storage.getSecureItem('finly_access_token');
      const savedUser = await storage.getItem<User>('finly_user');

      if (accessToken && savedUser) {
        // Check biometric lock setting
        if (savedUser.preferences?.biometricEnabled) {
          set({
            user: savedUser,
            isAuthenticated: true,
            isBiometricLocked: true,
            isLoading: false,
          });
          return;
        }

        // Fetch fresh profile in background
        apiClient
          .get<User>('/users/me')
          .then((freshUser) => {
            set({ user: freshUser });
            storage.setItem('finly_user', freshUser);
          })
          .catch(() => {});

        set({
          user: savedUser,
          isAuthenticated: true,
          isBiometricLocked: false,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/login',
        { email, password }
      );

      await storage.setSecureItem('finly_access_token', res.accessToken);
      await storage.setSecureItem('finly_refresh_token', res.refreshToken);
      await storage.setItem('finly_user', res.user);

      set({
        user: res.user,
        isAuthenticated: true,
        isBiometricLocked: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, currency = 'INR') => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/register',
        { name, email, password, currency }
      );

      await storage.setSecureItem('finly_access_token', res.accessToken);
      await storage.setSecureItem('finly_refresh_token', res.refreshToken);
      await storage.setItem('finly_user', res.user);

      set({
        user: res.user,
        isAuthenticated: true,
        isBiometricLocked: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  googleAuth: async (idToken: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/google',
        { idToken }
      );

      await storage.setSecureItem('finly_access_token', res.accessToken);
      await storage.setSecureItem('finly_refresh_token', res.refreshToken);
      await storage.setItem('finly_user', res.user);

      set({
        user: res.user,
        isAuthenticated: true,
        isBiometricLocked: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await storage.getSecureItem('finly_refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      await storage.deleteSecureItem('finly_access_token');
      await storage.deleteSecureItem('finly_refresh_token');
      await storage.removeItem('finly_user');

      set({
        user: null,
        isAuthenticated: false,
        isBiometricLocked: false,
        isLoading: false,
      });
    }
  },

  updateUser: (updated) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...updated } as User;
    set({ user: merged });
    storage.setItem('finly_user', merged);
  },

  unlockWithBiometrics: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        set({ isBiometricLocked: false });
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Finly',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        set({ isBiometricLocked: false });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));

