
import React from 'react';
import { Edit, Trash2, ArrowDownAZ, ArrowDownZA } from 'lucide-react';
import { Venda } from '../../hooks/useVendas';
import { formatarData } from '../../utils/vendasUtils';

interface VendasTableProps {
  filteredVendas: Venda[];
  sortField: 'data' | 'cliente';
  sortOrder: 'asc' | 'desc';
  toggleSort: (field: 'data' | 'cliente') => void;
  onEdit: (venda: Venda) => void;
  onDelete: (id: string) => void;
}

export const VendasTable: React.FC<VendasTableProps> = ({
  filteredVendas,
  sortField,
  sortOrder,
  toggleSort,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 text-gray-300">Código</th>
            <th className="text-left p-4 text-gray-300">
              <button
                onClick={() => toggleSort('cliente')}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <span>Cliente</span>
                {sortField === 'cliente' && (
                  sortOrder === 'asc' ? <ArrowDownAZ size={14} /> : <ArrowDownZA size={14} />
                )}
              </button>
            </th>
            <th className="text-left p-4 text-gray-300">Itens</th>
            <th className="text-left p-4 text-gray-300">Total</th>
            <th className="text-left p-4 text-gray-300">Preço de Custo</th>
            <th className="text-left p-4 text-gray-300">Valor Líquido</th>
            <th className="text-left p-4 text-gray-300">
              <button
                onClick={() => toggleSort('data')}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <span>Data</span>
                {sortField === 'data' && (
                  sortOrder === 'asc' ? <ArrowDownAZ size={14} /> : <ArrowDownZA size={14} />
                )}
              </button>
            </th>
            <th className="text-left p-4 text-gray-300">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredVendas.map((venda) => {
            const custoTotal = venda.itens_venda?.reduce((sum, item) => sum + (item.preco_custo * item.quantidade), 0) || 0;
            const valorLiquido = venda.total - custoTotal;
            
            return (
              <tr key={venda.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4 text-white font-medium">{venda.codigo_venda}</td>
                <td className="p-4 text-white font-medium">{venda.cliente?.nome || 'N/A'}</td>
                <td className="p-4 text-gray-300">
                  {venda.itens_venda?.map((item, index) => (
                    <div key={item.id} className="text-sm">
                      {item.quantidade}x {item.nome} ({item.tipo})
                      {index < (venda.itens_venda?.length || 0) - 1 && <br />}
                    </div>
                  ))}
                </td>
                <td className="p-4 text-green-400 font-semibold">
                  R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-red-400 font-semibold">
                  R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-emerald-400 font-semibold">
                  R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-gray-300">
                  {formatarData(venda.data_venda)}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(venda)}
                      className="text-sky-400 hover:text-sky-300 p-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(venda.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
