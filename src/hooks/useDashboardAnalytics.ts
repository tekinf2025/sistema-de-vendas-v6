
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendaMensal {
  mes: string;
  total: number;
  sortKey: string;
}

export interface TopProduto {
  nome: string;
  quantidade: number;
}

export interface TopCliente {
  nome: string;
  total: number;
}

export const useDashboardAnalytics = () => {
  const [vendasMensais, setVendasMensais] = useState<VendaMensal[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProduto[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendasMensais = async () => {
    try {
      console.log('🔍 Buscando vendas mensais...');
      const { data, error } = await supabase
        .from('vendas')
        .select('data_venda, total');

      if (error) {
        console.error('❌ Erro ao buscar vendas:', error);
        throw error;
      }

      console.log('✅ Dados de vendas carregados:', data);

      // Agrupar vendas por mês/ano
      const vendasGrouped = (data || []).reduce((acc: any, venda: any) => {
        const date = new Date(venda.data_venda);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Criar chave única para ordenação (ano + mês com padding)
        const sortKey = `${year}-${month.toString().padStart(2, '0')}`;
        
        // Criar label para exibição
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        const mes = `${monthNames[month]}/${year}`;
        
        if (!acc[sortKey]) {
          acc[sortKey] = { mes, total: 0, sortKey };
        }
        
        acc[sortKey].total += parseFloat(venda.total);
        return acc;
      }, {});

      // Converter para array e ordenar por sortKey
      const vendasArray = Object.values(vendasGrouped) as VendaMensal[];
      vendasArray.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

      console.log('📊 Vendas mensais processadas:', vendasArray);
      setVendasMensais(vendasArray);
    } catch (error) {
      console.error('❌ Erro ao carregar vendas mensais:', error);
      toast.error('Erro ao carregar vendas mensais');
    }
  };

  const fetchTopProdutos = async () => {
    try {
      console.log('🔍 Buscando produtos mais vendidos...');
      
      const { data, error } = await supabase
        .from('itens_venda')
        .select('nome, quantidade')
        .eq('tipo', 'produto');

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error);
        throw error;
      }

      console.log('✅ Dados dos produtos carregados:', data);

      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum produto encontrado');
        setTopProdutos([]);
        return;
      }

      // Agrupar produtos por nome e somar quantidades
      const produtosMap = new Map<string, number>();
      
      data.forEach(item => {
        const nome = item.nome;
        const quantidade = item.quantidade || 0;
        
        if (produtosMap.has(nome)) {
          produtosMap.set(nome, produtosMap.get(nome)! + quantidade);
        } else {
          produtosMap.set(nome, quantidade);
        }
      });

      // Converter para array e ordenar
      const produtosArray: TopProduto[] = Array.from(produtosMap.entries()).map(([nome, quantidade]) => ({
        nome,
        quantidade
      }));

      produtosArray.sort((a, b) => b.quantidade - a.quantidade);
      const top10 = produtosArray.slice(0, 10);

      console.log('📊 Top 10 produtos processados:', top10);
      setTopProdutos(top10);
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos mais vendidos');
      setTopProdutos([]);
    }
  };

  const fetchTopClientes = async () => {
    try {
      console.log('🔍 Buscando clientes que mais compraram...');
      
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          total,
          clientes!inner (
            nome
          )
        `)
        .not('cliente_id', 'is', null);

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        throw error;
      }

      console.log('✅ Dados dos clientes carregados:', data);

      if (!data || data.length === 0) {
        console.log('⚠️ Nenhuma venda com cliente encontrada');
        setTopClientes([]);
        return;
      }

      // Agrupar clientes por nome e somar totais
      const clientesMap = new Map<string, number>();
      
      data.forEach(venda => {
        const nomeCliente = venda.clientes?.nome;
        const total = parseFloat(venda.total.toString()) || 0;
        
        if (nomeCliente) {
          if (clientesMap.has(nomeCliente)) {
            clientesMap.set(nomeCliente, clientesMap.get(nomeCliente)! + total);
          } else {
            clientesMap.set(nomeCliente, total);
          }
        }
      });

      // Converter para array e ordenar
      const clientesArray: TopCliente[] = Array.from(clientesMap.entries()).map(([nome, total]) => ({
        nome,
        total
      }));

      clientesArray.sort((a, b) => b.total - a.total);
      const top10 = clientesArray.slice(0, 10);

      console.log('📊 Top 10 clientes processados:', top10);
      setTopClientes(top10);
    } catch (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes que mais compraram');
      setTopClientes([]);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      console.log('🚀 Iniciando carregamento dos dados do dashboard...');
      setLoading(true);
      
      try {
        await Promise.all([
          fetchVendasMensais(),
          fetchTopProdutos(),
          fetchTopClientes()
        ]);
      } catch (error) {
        console.error('❌ Erro geral no carregamento dos dados:', error);
      } finally {
        setLoading(false);
        console.log('✅ Carregamento dos dados do dashboard concluído');
      }
    };

    fetchAllData();
  }, []);

  return {
    vendasMensais,
    topProdutos,
    topClientes,
    loading
  };
};
