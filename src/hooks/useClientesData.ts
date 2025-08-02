
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Cliente {
  id: string;
  codigo: string;
  nome: string;
  telefone?: string;
  observacao?: string;
}

export const useClientesData = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    refetch: fetchClientes
  };
};
