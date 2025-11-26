import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  isOAuthUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, password: string, role: UserRole) => { success: boolean; message: string };
  signInWithGoogle: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  needsRoleSelection: boolean;
  pendingOAuthUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - using a mutable array to allow registration
let mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as UserRole },
  { id: '2', username: 'empleado', password: 'emp123', role: 'employee' as UserRole }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [pendingOAuthUser, setPendingOAuthUser] = useState<SupabaseUser | null>(null);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          handleSupabaseUser(session.user);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setNeedsRoleSelection(false);
        setPendingOAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSupabaseUser = (supabaseUser: SupabaseUser) => {
    // Check if user has a role set in metadata
    const role = supabaseUser.user_metadata?.role as UserRole;
    
    if (!role) {
      // User needs to select a role
      setNeedsRoleSelection(true);
      setPendingOAuthUser(supabaseUser);
      setIsLoading(false);
    } else {
      // User already has a role
      setUser({
        id: supabaseUser.id,
        username: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
        email: supabaseUser.email,
        role: role,
        isOAuthUser: true
      });
      setNeedsRoleSelection(false);
      setPendingOAuthUser(null);
      setIsLoading(false);
    }
  };

  const setUserRole = async (role: UserRole) => {
    if (!pendingOAuthUser) return;

    try {
      // Update user metadata with selected role
      const { error } = await supabase.auth.updateUser({
        data: { role: role }
      });

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      // Set the user with the new role
      setUser({
        id: pendingOAuthUser.id,
        username: pendingOAuthUser.user_metadata?.name || pendingOAuthUser.email?.split('@')[0] || 'Usuario',
        email: pendingOAuthUser.email,
        role: role,
        isOAuthUser: true
      });
      setNeedsRoleSelection(false);
      setPendingOAuthUser(null);
    } catch (error) {
      console.error('Error in setUserRole:', error);
      throw error;
    }
  };

  const login = (username: string, password: string): boolean => {
    const mockUser = mockUsers.find(u => u.username === username && u.password === password);
    if (mockUser) {
      setUser({ id: mockUser.id, username: mockUser.username, role: mockUser.role });
      return true;
    }
    return false;
  };

  const register = (username: string, password: string, role: UserRole): { success: boolean; message: string } => {
    // Check if username already exists
    const existingUser = mockUsers.find(u => u.username === username);
    if (existingUser) {
      return { success: false, message: 'El nombre de usuario ya está en uso' };
    }

    // Validate inputs
    if (username.length < 3) {
      return { success: false, message: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }

    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      password,
      role
    };

    mockUsers.push(newUser);
    return { success: true, message: 'Cuenta creada exitosamente' };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      throw error;
    }
  };

  const logout = async () => {
    // If OAuth user, sign out from Supabase
    if (user?.isOAuthUser) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setNeedsRoleSelection(false);
    setPendingOAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      signInWithGoogle,
      setUserRole,
      needsRoleSelection,
      pendingOAuthUser,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}