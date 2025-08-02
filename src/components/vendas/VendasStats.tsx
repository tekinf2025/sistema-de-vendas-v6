
import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Venda } from '../../hooks/useVendas';
import { useIsMobile } from '../../hooks/use-mobile';

interface VendasStatsProps {
  filteredVendas: Venda[];
}

export const VendasStats: React.FC<VendasStatsProps> = ({ filteredVendas }) => {
  const isMobile = useIsMobile();

  const totalVendasFiltradas = filteredVendas.reduce((sum, venda) => sum + venda.total, 0);
  const totalCustoFiltradas = filteredVendas.reduce((sum, venda) => 
    sum + (venda.itens_venda?.reduce((itemSum, item) => itemSum + (item.preco_custo * item.quantidade), 0) || 0), 0
  );
  const valorLiquidoFiltradas = totalVendasFiltradas - totalCustoFiltradas;
  const ticketMedioFiltradas = filteredVendas.length > 0 ? totalVendasFiltradas / filteredVendas.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div className="bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total em Vendas</p>
            <p className="text-xl md:text-2xl font-bold text-green-400">
              R$ {totalVendasFiltradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <DollarSign className="text-green-400" size={isMobile ? 20 : 24} />
        </div>
      </div>
      
      <div className="bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Vendas do Período</p>
            <p className="text-xl md:text-2xl font-bold text-sky-400">{filteredVendas.length}</p>
          </div>
          <Calendar className="text-sky-400" size={isMobile ? 20 : 24} />
        </div>
      </div>
      
      <div className="bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Ticket Médio</p>
            <p className="text-xl md:text-2xl font-bold text-purple-400">
              R$ {ticketMedioFiltradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <DollarSign className="text-purple-400" size={isMobile ? 20 : 24} />
        </div>
      </div>

      <div className="bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Valor Líquido</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              R$ {valorLiquidoFiltradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <DollarSign className="text-emerald-400" size={isMobile ? 20 : 24} />
        </div>
      </div>
    </div>
  );
};
