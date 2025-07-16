
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Profile, OfficeUser, Office } from '@/types/database';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  office_id?: string | null;
  office_role?: 'user' | 'admin' | 'super_admin' | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  office: Office | null;
  officeUser: OfficeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstLogin: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOfficeAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  resetFirstLogin: () => void;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  loginAsSuperAdmin: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [office, setOffice] = useState<Office | null>(null);
  const [officeUser, setOfficeUser] = useState<OfficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile from database with timeout
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Fetch office data for user
  const fetchOfficeData = async (userId: string) => {
    try {
      // Buscar office_user
      const { data: officeUserData, error: officeUserError } = await supabase
        .from('office_users')
        .select(`
          *,
          office:offices(*)
        `)
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (officeUserError || !officeUserData) {
        return { officeUser: null, office: null };
      }

      return { 
        officeUser: officeUserData, 
        office: officeUserData.office 
      };
    } catch (error) {
      console.error('Error fetching office data:', error);
      return { officeUser: null, office: null };
    }
  };

  // Create profile manually if trigger failed
  const createProfileIfNotExists = async (userId: string, email: string, fullName?: string) => {
    try {
      console.log('Creating profile for user:', userId, email);
      const role = email === 'contato@vextriahub.com.br' ? 'super_admin' : 'user';
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: fullName || null,
          email: email,
          role: role
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProfileIfNotExists:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('Session found:', session.user.email);
          setSession(session);
          
          // Fetch user profile
          let profileData = await fetchProfile(session.user.id);
          
          if (!mounted) return;
          
          // If profile doesn't exist, create it (fallback for trigger failure)
          if (!profileData && session.user.email) {
            const fullName = session.user.user_metadata?.full_name || 
                            session.user.user_metadata?.name ||
                            session.user.email.split('@')[0];
            
            profileData = await createProfileIfNotExists(
              session.user.id, 
              session.user.email, 
              fullName
            );
          }
          
          if (!mounted) return;
          
          if (profileData) {
            setProfile(profileData);
            
            // Fetch office data
            const { officeUser, office } = await fetchOfficeData(session.user.id);
            
            if (!mounted) return;
            
            setOfficeUser(officeUser);
            setOffice(office);
            
            // Create user object for compatibility
            const userData: User = {
              id: session.user.id,
              name: profileData.full_name || session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || '',
              role: profileData.role,
              office_id: profileData.office_id,
              office_role: officeUser?.role || null
            };
            
            setUser(userData);
            
            // Check if it's first login (profile just created)
            const profileAge = Date.now() - new Date(profileData.created_at).getTime();
            const isNewProfile = profileAge < 60000; // Less than 1 minute old
            setIsFirstLogin(isNewProfile && profileData.role !== 'super_admin');
          }
        } else {
          console.log('No session found');
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          let profileData = await fetchProfile(session.user.id);
          
          if (!mounted) return;
          
          // If profile doesn't exist, create it (fallback for trigger failure)
          if (!profileData && session.user.email) {
            const fullName = session.user.user_metadata?.full_name || 
                            session.user.user_metadata?.name ||
                            session.user.email.split('@')[0];
            
            profileData = await createProfileIfNotExists(
              session.user.id, 
              session.user.email, 
              fullName
            );
          }
          
          if (!mounted) return;
          
          if (profileData) {
            setProfile(profileData);
            
            // Fetch office data
            const { officeUser, office } = await fetchOfficeData(session.user.id);
            
            if (!mounted) return;
            
            setOfficeUser(officeUser);
            setOffice(office);
            
            // Create user object for compatibility
            const userData: User = {
              id: session.user.id,
              name: profileData.full_name || session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || '',
              role: profileData.role,
              office_id: profileData.office_id,
              office_role: officeUser?.role || null
            };
            
            setUser(userData);
            
            // Check if it's first login (profile just created)
            const profileAge = Date.now() - new Date(profileData.created_at).getTime();
            const isNewProfile = profileAge < 60000; // Less than 1 minute old
            setIsFirstLogin(isNewProfile && profileData.role !== 'super_admin');
          }
        } else {
          setUser(null);
          setProfile(null);
          setOffice(null);
          setOfficeUser(null);
          setIsFirstLogin(false);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup old localStorage data
    const oldKeys = [
      'authToken', 'userData', 'loginTimestamp', 'isFirstLogin',
      'nublex_token', 'nublex_user', 'nublex_data'
    ];
    oldKeys.forEach(key => localStorage.removeItem(key));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
    } else {
      console.log('Login successful for:', email);
    }

    return { error };
  };

  const register = async (email: string, password: string, fullName: string) => {
    console.log('Attempting registration for:', email);
    
    // Get current URL for redirect
    const currentUrl = window.location.origin;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${currentUrl}/dashboard`
      }
    });

    if (error) {
      console.error('Registration error:', error);
    } else {
      console.log('Registration successful for:', email);
      console.log('Confirmation email should be sent to:', email);
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    console.log('Resending confirmation email for:', email);
    
    const currentUrl = window.location.origin;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${currentUrl}/dashboard`
      }
    });

    if (error) {
      console.error('Resend confirmation error:', error);
    } else {
      console.log('Confirmation email resent to:', email);
    }

    return { error };
  };

  const loginAsSuperAdmin = async (email: string, password: string) => {
    console.log('Attempting Super Admin login for:', email);
    
    // Verificar se é o email do super admin
    if (email !== 'contato@vextriahub.com.br') {
      return { error: { message: 'Acesso negado. Este método é apenas para Super Admin.' } };
    }

    // Tentar login normal primeiro
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Super Admin login error:', error);
      // Se der erro de email não confirmado, vamos tentar criar o perfil manualmente
      if (error.message.includes('email_not_confirmed') || error.message.includes('not confirmed')) {
        console.log('Email not confirmed, but allowing Super Admin access');
        
        // Aqui poderíamos implementar uma lógica especial para super admin
        // Por enquanto, retornamos o erro mas com uma mensagem específica
        return { 
          error: { 
            message: 'Email não confirmado. Use a função "Reenviar Email de Confirmação" para receber um novo link de confirmação.' 
          } 
        };
      }
    }

    return { error };
  };

  const logout = async () => {
    console.log('Logging out user');
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
      setOffice(null);
      setOfficeUser(null);
      setIsFirstLogin(false);
      navigate('/login', { replace: true });
    }
  };

  const resetFirstLogin = () => {
    setIsFirstLogin(false);
  };

  const value = {
    user,
    profile,
    session,
    office,
    officeUser,
    isAuthenticated: !!session,
    isLoading,
    isFirstLogin,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isOfficeAdmin: user?.office_role === 'admin' || user?.office_role === 'super_admin' || user?.role === 'super_admin',
    login,
    register,
    logout,
    resetFirstLogin,
    resendConfirmation,
    loginAsSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
