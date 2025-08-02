
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ItemVenda {
  id?: string;
  tipo: string;
  item_id: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  preco_custo: number;
  valor_total: number;
}

export interface Venda {
  id: string;
  codigo_venda: string;
  cliente_id: string | null;
  data_venda: string;
  total: number;
  cliente?: {
    nome: string;
  };
  itens_venda?: ItemVenda[];
}

export const useVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          cliente:clientes(nome),
          itens_venda(*)
        `)
        .order('data_venda', { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const verificarEstoque = async (itens: ItemVenda[]): Promise<boolean> => {
    try {
      const produtosParaVerificar = itens.filter(item => item.tipo === 'produto');
      
      for (const item of produtosParaVerificar) {
        const { data: produto, error } = await supabase
          .from('produtos')
          .select('estoque, nome_produto')
          .eq('id', item.item_id)
          .single();

        if (error) {
          console.error('Erro ao verificar estoque:', error);
          toast.error(`Erro ao verificar estoque do produto: ${item.nome}`);
          return false;
        }

        if (produto.estoque < item.quantidade) {
          toast.error(`Estoque insuficiente para esta venda. Produto: ${produto.nome_produto}, Estoque atual: ${produto.estoque}, Quantidade solicitada: ${item.quantidade}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      toast.error('Erro ao verificar estoque');
      return false;
    }
  };

  const atualizarEstoque = async (itens: ItemVenda[], operacao: 'subtrair' | 'adicionar'): Promise<boolean> => {
    try {
      const produtosParaAtualizar = itens.filter(item => item.tipo === 'produto');
      
      for (const item of produtosParaAtualizar) {
        // Buscar estoque atual
        const { data: produto, error: fetchError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.item_id)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar produto:', fetchError);
          return false;
        }

        // Calcular novo estoque
        const novoEstoque = operacao === 'subtrair' 
          ? produto.estoque - item.quantidade 
          : produto.estoque + item.quantidade;

        // Atualizar estoque
        const { error: updateError } = await supabase
          .from('produtos')
          .update({ estoque: novoEstoque })
          .eq('id', item.item_id);

        if (updateError) {
          console.error('Erro ao atualizar estoque:', updateError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      return false;
    }
  };

  const createVenda = async (vendaData: {
    codigo_venda: string;
    cliente_id: string;
    data_venda: string;
    total: number;
    itens: ItemVenda[];
  }) => {
    try {
      // Verificar estoque antes de criar a venda
      const estoqueDisponivel = await verificarEstoque(vendaData.itens);
      if (!estoqueDisponivel) {
        return;
      }

      // Inserir venda
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          codigo_venda: vendaData.codigo_venda,
          cliente_id: vendaData.cliente_id,
          data_venda: vendaData.data_venda,
          total: vendaData.total
        })
        .select()
        .single();

      if (vendaError) throw vendaError;

      // Inserir itens da venda
      const itensToInsert = vendaData.itens.map(item => ({
        venda_id: venda.id,
        tipo: item.tipo,
        item_id: item.item_id,
        nome: item.nome,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        preco_custo: item.preco_custo,
        valor_total: item.valor_total
      }));

      const { error: itensError } = await supabase
        .from('itens_venda')
        .insert(itensToInsert);

      if (itensError) throw itensError;

      // Atualizar estoque (subtrair)
      const estoqueAtualizado = await atualizarEstoque(vendaData.itens, 'subtrair');
      if (!estoqueAtualizado) {
        toast.error('Erro ao atualizar estoque');
        return;
      }

      toast.success('Venda criada com sucesso!');
      fetchVendas();
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast.error('Erro ao criar venda');
    }
  };

  const updateVenda = async (id: string, vendaData: {
    codigo_venda: string;
    cliente_id: string;
    data_venda: string;
    total: number;
    itens: ItemVenda[];
  }) => {
    try {
      // Buscar itens da venda atual para reverter o estoque
      const { data: vendaAtual, error: fetchError } = await supabase
        .from('vendas')
        .select('itens_venda(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Reverter estoque dos itens antigos (adicionar de volta)
      if (vendaAtual.itens_venda && vendaAtual.itens_venda.length > 0) {
        await atualizarEstoque(vendaAtual.itens_venda, 'adicionar');
      }

      // Verificar estoque para os novos itens
      const estoqueDisponivel = await verificarEstoque(vendaData.itens);
      if (!estoqueDisponivel) {
        // Se não há estoque, reverter a operação anterior
        if (vendaAtual.itens_venda && vendaAtual.itens_venda.length > 0) {
          await atualizarEstoque(vendaAtual.itens_venda, 'subtrair');
        }
        return;
      }

      // Atualizar venda
      const { error: vendaError } = await supabase
        .from('vendas')
        .update({
          codigo_venda: vendaData.codigo_venda,
          cliente_id: vendaData.cliente_id,
          data_venda: vendaData.data_venda,
          total: vendaData.total
        })
        .eq('id', id);

      if (vendaError) throw vendaError;

      // Deletar itens antigos
      const { error: deleteError } = await supabase
        .from('itens_venda')
        .delete()
        .eq('venda_id', id);

      if (deleteError) throw deleteError;

      // Inserir novos itens
      const itensToInsert = vendaData.itens.map(item => ({
        venda_id: id,
        tipo: item.tipo,
        item_id: item.item_id,
        nome: item.nome,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        preco_custo: item.preco_custo,
        valor_total: item.valor_total
      }));

      const { error: itensError } = await supabase
        .from('itens_venda')
        .insert(itensToInsert);

      if (itensError) throw itensError;

      // Atualizar estoque com os novos itens (subtrair)
      const estoqueAtualizado = await atualizarEstoque(vendaData.itens, 'subtrair');
      if (!estoqueAtualizado) {
        toast.error('Erro ao atualizar estoque');
        return;
      }

      toast.success('Venda atualizada com sucesso!');
      fetchVendas();
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      toast.error('Erro ao atualizar venda');
    }
  };

  const deleteVenda = async (id: string) => {
    try {
      // Buscar itens da venda para reverter o estoque
      const { data: venda, error: fetchError } = await supabase
        .from('vendas')
        .select('itens_venda(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Reverter estoque (adicionar de volta)
      if (venda.itens_venda && venda.itens_venda.length > 0) {
        await atualizarEstoque(venda.itens_venda, 'adicionar');
      }

      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Venda removida com sucesso!');
      fetchVendas();
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      toast.error('Erro ao deletar venda');
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  return {
    vendas,
    loading,
    createVenda,
    updateVenda,
    deleteVenda,
    refetch: fetchVendas
  };
};
