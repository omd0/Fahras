import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '@/types';
import { authApi, apiService } from '@/lib/api';
import { getGuestBookmarks, clearGuestBookmarks } from '@/utils/bookmarkCookies';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  // Manual setters for external auth flows (e.g., magic link verification)
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(credentials);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Sync guest bookmarks after successful login
          const guestBookmarkIds = getGuestBookmarks();
          if (guestBookmarkIds.length > 0) {
            try {
              await apiService.syncGuestBookmarks(guestBookmarkIds);
              clearGuestBookmarks();
            } catch (syncError) {
              console.error('Failed to sync guest bookmarks:', syncError);
              // Don't fail login if sync fails
            }
          }
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed'
            : 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          // Registration successful - user is automatically logged in
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Sync guest bookmarks after successful registration
          const guestBookmarkIds = getGuestBookmarks();
          if (guestBookmarkIds.length > 0) {
            try {
              await apiService.syncGuestBookmarks(guestBookmarkIds);
              clearGuestBookmarks();
            } catch (syncError) {
              console.error('Failed to sync guest bookmarks:', syncError);
              // Don't fail registration if sync fails
            }
          }
        } catch (error: unknown) {
          // Extract validation errors from response
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error && typeof error === 'object') {
            const axiosError = error as { 
              response?: { 
                data?: { 
                  errors?: Record<string, string[]>; 
                  message?: string; 
                  error?: string 
                } 
              };
              message?: string;
            };
            
            if (axiosError.response?.data?.errors) {
              // Handle validation errors (422)
              errorMessage = Object.values(axiosError.response.data.errors).flat().join(', ');
            } else if (axiosError.response?.data?.message) {
              // Handle server error messages (500)
              errorMessage = axiosError.response.data.message;
              // Include detailed error if available (debug mode)
              if (axiosError.response.data.error) {
                errorMessage += `: ${axiosError.response.data.error}`;
              }
            } else if (axiosError.message) {
              // Handle network errors
              errorMessage = axiosError.message;
            }
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        const { token } = get();
        if (token) {
          authApi.logout(token).catch(console.error);
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await authApi.refreshToken(token);
          set({ token: response.token });
         } catch (_error) {
           // If refresh fails, logout user
           get().logout();
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Manual setters for external auth flows (e.g., magic link verification, OTP verification)
      setUser: (user: User | null) => set({ user }),
      setToken: (token: string | null) => set({ token }),
      setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
