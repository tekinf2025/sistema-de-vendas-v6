
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NovoClienteModalProps {
  showModal: boolean;
  onClose: () => void;
  onClienteCreated: (cliente: { id: string; nome: string }) => void;
}

export const NovoClienteModal: React.FC<NovoClienteModalProps> = ({
  showModal,
  onClose,
  onClienteCreated
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    observacao: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Estados para autocomplete
  const [nomeInput, setNomeInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clientesSuggestions, setClientesSuggestions] = useState<any[]>([]);
  const [isDuplicateName, setIsDuplicateName] = useState(false);
  const [selectedClienteData, setSelectedClienteData] = useState<any>(null);

  // Buscar clientes para autocomplete
  const buscarClientes = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setClientesSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setClientesSuggestions(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  // Função para normalizar texto (remover acentos e converter para minúsculas)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Verificar se o nome já existe
  const verificarNomeDuplicado = async (nome: string) => {
    if (!nome.trim()) {
      setIsDuplicateName(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', nome.trim());

      if (error) throw error;
      
      const nomeNormalizado = normalizeText(nome.trim());
      const clienteExistente = data?.find(
        cliente => normalizeText(cliente.nome) === nomeNormalizado
      );

      setIsDuplicateName(!!clienteExistente);
    } catch (error) {
      console.error('Erro ao verificar nome duplicado:', error);
    }
  };

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nomeInput.trim()) {
        buscarClientes(nomeInput);
        verificarNomeDuplicado(nomeInput);
      } else {
        setClientesSuggestions([]);
        setIsDuplicateName(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [nomeInput]);

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      observacao: ''
    });
    setNomeInput('');
    setShowSuggestions(false);
    setClientesSuggestions([]);
    setIsDuplicateName(false);
    setSelectedClienteData(null);
  };

  const handleNomeInputChange = (value: string) => {
    setNomeInput(value);
    setFormData({ ...formData, nome: value });
    setShowSuggestions(value.length > 1);
    setSelectedClienteData(null);
  };

  const selecionarClienteSugestao = (cliente: any) => {
    setNomeInput(cliente.nome);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      observacao: cliente.observacao || ''
    });
    setSelectedClienteData(cliente);
    setShowSuggestions(false);
    toast.info('Cliente já cadastrado. Dados carregados para edição.');
  };

  const generateClienteCode = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      const lastCode = data && data.length > 0 
        ? parseInt(data[0].codigo.split('-')[1]) || 0 
        : 0;
      
      return `CLI-${String(lastCode + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar código do cliente:', error);
      return `CLI-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (isDuplicateName && !selectedClienteData) {
      toast.error('Já existe um cliente com esse nome');
      return;
    }

    setLoading(true);

    try {
      // Se é um cliente selecionado para edição
      if (selectedClienteData) {
        const { data: clienteAtualizado, error } = await supabase
          .from('clientes')
          .update({
            nome: formData.nome.trim(),
            telefone: formData.telefone.trim() || null,
            observacao: formData.observacao.trim() || null
          })
          .eq('id', selectedClienteData.id)
          .select()
          .single();

        if (error) throw error;

        toast.success('Cliente atualizado com sucesso!');
        onClienteCreated({ id: clienteAtualizado.id, nome: clienteAtualizado.nome });
      } else {
        // Criar novo cliente
        const codigo = await generateClienteCode();

        const { data: novoCliente, error } = await supabase
          .from('clientes')
          .insert({
            codigo,
            nome: formData.nome.trim(),
            telefone: formData.telefone.trim() || null,
            observacao: formData.observacao.trim() || null
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Cliente cadastrado com sucesso!');
        onClienteCreated({ id: novoCliente.id, nome: novoCliente.nome });
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
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
              <Plus size={20} />
              {selectedClienteData ? 'Editar Cliente' : 'Novo Cliente'}
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={nomeInput}
              onChange={(e) => handleNomeInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(nomeInput.length > 1 && clientesSuggestions.length > 0)}
              onBlur={() => {
                // Delay para permitir clique nas sugestões
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Digite o nome do cliente..."
              className={`w-full bg-slate-700 text-white px-4 py-3 rounded-lg border ${
                isDuplicateName && !selectedClienteData 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-slate-600 focus:border-sky-500'
              } focus:outline-none`}
              required
              autoFocus
            />
            
            {/* Dropdown de sugestões */}
            {showSuggestions && clientesSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {clientesSuggestions.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => selecionarClienteSugestao(cliente)}
                    className="w-full text-left px-4 py-2 text-white hover:bg-slate-600 focus:bg-slate-600 focus:outline-none border-b border-slate-600 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <span>{cliente.nome}</span>
                      <span className="text-xs text-gray-400">{cliente.codigo}</span>
                    </div>
                    {cliente.telefone && (
                      <div className="text-xs text-gray-400 mt-1">{cliente.telefone}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Mensagem de erro para nome duplicado */}
            {isDuplicateName && !selectedClienteData && (
              <div className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <span>❌</span>
                <span>Já existe um cliente com esse nome.</span>
              </div>
            )}
            
            {/* Mensagem informativa quando cliente é selecionado */}
            {selectedClienteData && (
              <div className="mt-2 text-sm text-blue-400 flex items-center gap-1">
                <span>ℹ️</span>
                <span>Cliente carregado para edição.</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observação
            </label>
            <textarea
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              placeholder="Observações sobre o cliente..."
              rows={3}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none resize-none"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || (isDuplicateName && !selectedClienteData)}
              className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:opacity-50 text-white py-3 rounded-lg transition-colors"
            >
              {loading ? (selectedClienteData ? 'Atualizando...' : 'Cadastrando...') : (selectedClienteData ? 'Atualizar' : 'Cadastrar')}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
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
