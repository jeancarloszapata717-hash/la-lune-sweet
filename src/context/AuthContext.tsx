import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';

export interface User {
  uid?: string;
  nombre: string;
  apellido: string;
  cedula: string;
  ubicacionCorta: string;
  telefono: string;
  fechaNacimiento: string;
  email: string;
  role?: 'admin' | 'inventory' | 'support' | 'client';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (userData: User & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string, email: string) => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (data) {
      const adminEmails = ['jeancarloszapata717@gmail.com', 'jeanzapata717@gmail.com'];
      let role = data.role;
      
      if (email && adminEmails.includes(email) && role !== 'admin') {
        await supabase.from('perfiles').update({ role: 'admin' }).eq('id', uid);
        role = 'admin';
      }

      return {
        uid,
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula,
        ubicacionCorta: data.ubicacion_corta,
        telefono: data.telefono,
        fechaNacimiento: data.fecha_nacimiento,
        email: email,
        role: role
      };
    }
    return null;
  };

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email || '').then(profile => {
          setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const profile = await fetchUserProfile(session.user.id, session.user.email || '');
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const register = async (userData: User & { password?: string }) => {
    if (!userData.password) throw new Error("Password is required");
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No user returned from signup");

    const { password, ...userWithoutPass } = userData;
    const profileData = {
      id: authData.user.id,
      nombre: userWithoutPass.nombre,
      apellido: userWithoutPass.apellido,
      cedula: userWithoutPass.cedula,
      telefono: userWithoutPass.telefono,
      ubicacion_corta: userWithoutPass.ubicacionCorta,
      fecha_nacimiento: userWithoutPass.fechaNacimiento,
      email: userWithoutPass.email,
      role: 'client'
    };

    const { error: profileError } = await supabase.from('perfiles').insert([profileData]);
    if (profileError) throw profileError;

    setUser({ uid: authData.user.id, ...userWithoutPass, role: 'client' } as User);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
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
