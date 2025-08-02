
import React from 'react';
import { Search, ArrowDownAZ, ArrowDownZA } from 'lucide-react';
import { getUniqueMonthYearOptions } from '../../utils/vendasUtils';
import { Venda } from '../../hooks/useVendas';

interface VendasFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: 'data' | 'cliente';
  sortOrder: 'asc' | 'desc';
  toggleSort: (field: 'data' | 'cliente') => void;
  filterMonthYear: string;
  setFilterMonthYear: (filter: string) => void;
  filterType: 'all' | 'produto' | 'servico';
  setFilterType: (type: 'all' | 'produto' | 'servico') => void;
  vendas: Venda[];
}

export const VendasFilters: React.FC<VendasFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortField,
  sortOrder,
  toggleSort,
  filterMonthYear,
  setFilterMonthYear,
  filterType,
  setFilterType,
  vendas
}) => {
  return (
    <div className="p-4 md:p-6 border-b border-slate-700">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={() => toggleSort('data')}
            className={`bg-slate-700 hover:bg-slate-600 text-white px-3 py-3 rounded-lg border border-slate-600 flex items-center justify-center space-x-2 transition-colors ${
              sortField === 'data' ? 'border-sky-500' : ''
            }`}
            title={`Ordenar por Data ${sortField === 'data' && sortOrder === 'asc' ? 'Z-A' : 'A-Z'}`}
          >
            {sortField === 'data' && sortOrder === 'asc' ? <ArrowDownZA size={16} /> : <ArrowDownAZ size={16} />}
            <span className="md:hidden">Data {sortField === 'data' && sortOrder === 'asc' ? 'Z-A' : 'A-Z'}</span>
          </button>

          <select
            value={filterMonthYear}
            onChange={(e) => setFilterMonthYear(e.target.value)}
            className="flex-1 md:flex-none bg-slate-700 text-white px-3 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
          >
            <option value="">Todos os meses</option>
            {getUniqueMonthYearOptions(vendas).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'produto' | 'servico')}
            className="flex-1 md:flex-none bg-slate-700 text-white px-3 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="produto">Produtos</option>
            <option value="servico">Serviços</option>
          </select>
        </div>
      </div>
    </div>
  );
};
