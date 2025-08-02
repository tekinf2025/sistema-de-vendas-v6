
import React, { useState, useEffect } from 'react';
import { X, Plus, Edit } from 'lucide-react';
import { Devedor } from '@/hooks/useDevedores';

interface DevedorModalProps {
  devedor?: Devedor | null;
  showModal: boolean;
  onClose: () => void;
  onSave: (data: {
    nome: string;
    valor: number;
    data: string;
    observacao?: string;
  }) => Promise<void>;
}

export const DevedorModal: React.FC<DevedorModalProps> = ({
  devedor,
  showModal,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    observacao: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devedor) {
      setFormData({
        nome: devedor.nome,
        valor: devedor.valor,
        data: devedor.data,
        observacao: devedor.observacao || ''
      });
    } else {
      setFormData({
        nome: '',
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        observacao: ''
      });
    }
  }, [devedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        nome: formData.nome.trim(),
        valor: Number(formData.valor),
        data: formData.data,
        observacao: formData.observacao.trim() || undefined
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {devedor ? <Edit size={20} /> : <Plus size={20} />}
              {devedor ? 'Editar Devedor' : 'Novo Devedor'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do devedor"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
              placeholder="0,00"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data *
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observação
            </label>
            <textarea
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              placeholder="Observações sobre a dívida..."
              rows={3}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none resize-none"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 text-white py-3 rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : (devedor ? 'Atualizar' : 'Cadastrar')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
