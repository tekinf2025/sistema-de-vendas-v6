
import { useState, useMemo } from 'react';
import { Venda } from './useVendas';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const useVendasFilters = (vendas: Venda[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<'data' | 'cliente'>('data');
  const [filterMonthYear, setFilterMonthYear] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'produto' | 'servico'>('all');

  const toggleSort = (field: 'data' | 'cliente') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredVendas = useMemo(() => {
    return vendas
      .filter(venda => {
        const textMatch = venda.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venda.codigo_venda.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venda.itens_venda?.some(item => item.nome.toLowerCase().includes(searchTerm.toLowerCase()));

        const monthYearMatch = !filterMonthYear || (() => {
          if (!venda.data_venda) return false;
          try {
            // Usar dayjs para formatação consistente da data
            const vendaDate = dayjs.utc(venda.data_venda);
            if (!vendaDate.isValid()) return false;
            
            const vendaMonthYear = vendaDate.format('MM/YYYY');
            return vendaMonthYear === filterMonthYear;
          } catch (error) {
            console.error('Erro ao processar data:', error);
            return false;
          }
        })();

        const typeMatch = filterType === 'all' || 
          venda.itens_venda?.some(item => item.tipo === filterType);

        return textMatch && monthYearMatch && typeMatch;
      })
      .sort((a, b) => {
        if (sortField === 'data') {
          const dateA = dayjs.utc(a.data_venda).valueOf();
          const dateB = dayjs.utc(b.data_venda).valueOf();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          const clienteA = a.cliente?.nome || '';
          const clienteB = b.cliente?.nome || '';
          return sortOrder === 'asc' ? 
            clienteA.localeCompare(clienteB) : 
            clienteB.localeCompare(clienteA);
        }
      });
  }, [vendas, searchTerm, filterMonthYear, filterType, sortField, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
    sortOrder,
    sortField,
    filterMonthYear,
    setFilterMonthYear,
    filterType,
    setFilterType,
    toggleSort,
    filteredVendas
  };
};
