
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Devedor {
  id: string;
  codigo: string;
  data: string;
  nome: string;
  valor: number;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export const useDevedores = () => {
  const [devedores, setDevedores] = useState<Devedor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevedores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devedores')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setDevedores(data || []);
    } catch (error) {
      console.error('Erro ao carregar devedores:', error);
      toast.error('Erro ao carregar devedores');
    } finally {
      setLoading(false);
    }
  };

  const createDevedor = async (devedorData: {
    nome: string;
    valor: number;
    data: string;
    observacao?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('devedores')
        .insert({
          codigo: '', // Será substituído pelo trigger
          nome: devedorData.nome,
          valor: devedorData.valor,
          data: devedorData.data,
          observacao: devedorData.observacao
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Devedor cadastrado com sucesso!');
      fetchDevedores();
      return data;
    } catch (error) {
      console.error('Erro ao criar devedor:', error);
      toast.error('Erro ao cadastrar devedor');
    }
  };

  const updateDevedor = async (id: string, devedorData: {
    nome: string;
    valor: number;
    data: string;
    observacao?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('devedores')
        .update({
          nome: devedorData.nome,
          valor: devedorData.valor,
          data: devedorData.data,
          observacao: devedorData.observacao
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Devedor atualizado com sucesso!');
      fetchDevedores();
    } catch (error) {
      console.error('Erro ao atualizar devedor:', error);
      toast.error('Erro ao atualizar devedor');
    }
  };

  const deleteDevedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('devedores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Devedor removido com sucesso!');
      fetchDevedores();
    } catch (error) {
      console.error('Erro ao deletar devedor:', error);
      toast.error('Erro ao deletar devedor');
    }
  };

  useEffect(() => {
    fetchDevedores();
  }, []);

  return {
    devedores,
    loading,
    createDevedor,
    updateDevedor,
    deleteDevedor,
    refetch: fetchDevedores
  };
};
