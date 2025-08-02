
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Servico {
  id: string;
  codigo: string;
  nome_servico: string;
  preco_hora: number;
  preco_custo?: number;
}

export const useServicosData = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('nome_servico');

      if (error) throw error;
      setServicos(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  return {
    servicos,
    loading,
    refetch: fetchServicos
  };
};
