
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const verificarSessao = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (!data.session) {
      toast.error('Sessão expirada! Faça login novamente.');
      return false;
    }
    
    return true;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Falha no login: ' + error.message);
        return { error };
      }

      toast.success('Login realizado com sucesso!');
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro inesperado no login');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast.error('Falha no cadastro: ' + error.message);
        return { error };
      }

      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      return { data, error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro inesperado no cadastro');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao sair: ' + error.message);
        return { error };
      }
      toast.success('Logout realizado com sucesso!');
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro inesperado no logout');
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    verificarSessao,
  };
};
