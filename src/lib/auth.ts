import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { login as apiLogin, logout as apiLogout, getUser, isAuthenticated as checkIsAuthenticated } from '@/api';

export type UserRole = 'admin' | 'staff' | 'billing' | null;

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: checkIsAuthenticated(),
      userRole: getUser()?.role || null,
      user: getUser(),
      
      login: async (email, password) => {
        try {
          const user = await apiLogin(email, password);
          set({ 
            isAuthenticated: true, 
            userRole: user.role as UserRole,
            user
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      
      logout: () => {
        apiLogout();
        set({ 
          isAuthenticated: false, 
          userRole: null,
          user: null
        });
      },
      
      checkAuth: () => {
        const isAuth = checkIsAuthenticated();
        const currentUser = getUser();
        
        if (isAuth && currentUser && !get().isAuthenticated) {
          set({ 
            isAuthenticated: true, 
            userRole: currentUser.role as UserRole,
            user: currentUser
          });
        }
        
        return isAuth;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);