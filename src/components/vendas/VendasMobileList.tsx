
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Venda } from '../../hooks/useVendas';
import { formatarData } from '../../utils/vendasUtils';

interface VendasMobileListProps {
  filteredVendas: Venda[];
  onEdit: (venda: Venda) => void;
  onDelete: (id: string) => void;
}

export const VendasMobileList: React.FC<VendasMobileListProps> = ({
  filteredVendas,
  onEdit,
  onDelete
}) => {
  return (
    <div className="p-4 space-y-4">
      {filteredVendas.map((venda) => {
        const custoTotal = venda.itens_venda?.reduce((sum, item) => sum + (item.preco_custo * item.quantidade), 0) || 0;
        const valorLiquido = venda.total - custoTotal;
        
        return (
          <div key={venda.id} className="bg-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold">{venda.cliente?.nome || 'Cliente não informado'}</h3>
                <p className="text-gray-400 text-sm">{venda.codigo_venda}</p>
              </div>
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
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Itens:</span>
                {venda.itens_venda?.map((item) => (
                  <div key={item.id} className="text-gray-300 ml-2">
                    {item.quantidade}x {item.nome} ({item.tipo})
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Total:</span>
                  <div className="text-green-400 font-semibold">
                    R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Custo:</span>
                  <div className="text-red-400 font-semibold">
                    R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Líquido:</span>
                  <div className="text-emerald-400 font-semibold">
                    R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Data:</span>
                  <div className="text-gray-300">
                    {formatarData(venda.data_venda)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
