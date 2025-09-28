'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

interface HealthData {
  status: string;
  version: string;
  timestamp: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface TourPackage {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  duration: number;
  category: string;
  difficulty: string;
  rating?: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  // Health
  healthData: HealthData | null;
  loading: boolean;
  error: string | null;
  fetchHealthStatus: () => Promise<void>;

  // Auth
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  authError: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkAuthStatus: () => boolean;

  // Packages
  packages: TourPackage[];
  packagesLoading: boolean;
  packagesError: string | null;
  fetchPackages: () => Promise<void>;
  fetchPackageById: (id: string) => Promise<TourPackage | null>;
  createPackage: (
    packageData: Omit<TourPackage, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updatePackage: (
    id: string,
    packageData: Partial<TourPackage>
  ) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Health state
      healthData: null,
      loading: false,
      error: null,

      // Auth state
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      authError: null,

      // Package state
      packages: [],
      packagesLoading: false,
      packagesError: null,

      fetchHealthStatus: async () => {
        set({ loading: true, error: null });
        try {
          const { accessToken } = get();
          const headers = accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {};

          const response = await axios.get(`${API_BASE_URL}/health`, {
            timeout: 5000,
            headers,
          });
          set({ healthData: response.data, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch health status',
            loading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, authError: null });
        try {
          const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/auth/login`,
            {
              email,
              password,
            }
          );

          const { access_token, refresh_token, user } = response.data;

          // Check if user is admin
          if (user.role !== 'ADMIN') {
            throw new Error('Access denied. Admin privileges required.');
          }

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
            authError: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed';
          set({
            authError: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          authError: null,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { access_token } = response.data;
          set({ accessToken: access_token });
          return access_token;
        } catch {
          // If refresh fails, logout the user
          get().logout();
          throw new Error('Session expired. Please login again.');
        }
      },

      checkAuthStatus: () => {
        const { user, accessToken } = get();
        return !!(user && accessToken && user.role === 'ADMIN');
      },

      // Package management methods
      fetchPackages: async () => {
        set({ packagesLoading: true, packagesError: null });
        try {
          const { accessToken } = get();
          const response = await axios.get(`${API_BASE_URL}/packages`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          set({
            packages: response.data.data || response.data,
            packagesLoading: false,
          });
        } catch (error) {
          console.error('Error fetching packages:', error);
          set({
            packagesError: 'Failed to fetch packages',
            packagesLoading: false,
          });
        }
      },

      fetchPackageById: async (id) => {
        try {
          const { accessToken } = get();
          const response = await axios.get(`${API_BASE_URL}/packages/${id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return response.data.data || response.data;
        } catch (error) {
          console.error('Error fetching package by ID:', error);
          return null;
        }
      },

      createPackage: async (packageData) => {
        try {
          const { accessToken } = get();
          const response = await axios.post(
            `${API_BASE_URL}/packages`,
            packageData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          // Refresh packages list after creation
          await get().fetchPackages();
          return response.data;
        } catch (error) {
          console.error('Error creating package:', error);
          throw new Error('Failed to create package');
        }
      },

      updatePackage: async (id, packageData) => {
        try {
          const { accessToken } = get();
          const response = await axios.patch(
            `${API_BASE_URL}/packages/${id}`,
            packageData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          // Refresh packages list after update
          await get().fetchPackages();
          return response.data;
        } catch (error) {
          console.error('Error updating package:', error);
          throw new Error('Failed to update package');
        }
      },

      deletePackage: async (id) => {
        try {
          const { accessToken } = get();
          await axios.delete(`${API_BASE_URL}/packages/${id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          // Refresh packages list after deletion
          await get().fetchPackages();
        } catch (error) {
          console.error('Error deleting package:', error);
          throw new Error('Failed to delete package');
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
