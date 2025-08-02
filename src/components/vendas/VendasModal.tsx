import React, { useState, useEffect } from 'react';
import { X, Plus, UserPlus } from 'lucide-react';
import { Venda, ItemVenda } from '../../hooks/useVendas';
import { Cliente } from '../../hooks/useClientesData';
import { Produto } from '../../hooks/useProdutosData';
import { Servico } from '../../hooks/useServicosData';
import { generateVendaCode } from '../../utils/vendasUtils';
import { NovoClienteModal } from '../clientes/NovoClienteModal';

interface VendasModalProps {
  showModal: boolean;
  editingVenda: Venda | null;
  vendas: Venda[];
  clientes: Cliente[];
  produtos: Produto[];
  servicos: Servico[];
  onSubmit: (vendaData: any) => void;
  onClose: () => void;
}

export const VendasModal: React.FC<VendasModalProps> = ({
  showModal,
  editingVenda,
  vendas,
  clientes,
  produtos,
  servicos,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    codigo_venda: '',
    cliente_id: '',
    data_venda: new Date().toISOString().split('T')[0]
  });
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);

  // Estados para autocomplete
  const [clienteInput, setClienteInput] = useState('');
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const [produtoInputs, setProdutoInputs] = useState<{[key: string]: string}>({});
  const [showProdutoSuggestions, setShowProdutoSuggestions] = useState<{[key: string]: boolean}>({});
  const [servicoInputs, setServicoInputs] = useState<{[key: string]: string}>({});
  const [showServicoSuggestions, setShowServicoSuggestions] = useState<{[key: string]: boolean}>({});

  // Lista atualizada de clientes (incluindo novos clientes cadastrados)
  const [clientesAtualizados, setClientesAtualizados] = useState<Cliente[]>(clientes);

  // Estado para observação do cliente selecionado
  const [clienteObservacao, setClienteObservacao] = useState<string>('');

  // Estado para armazenar o estoque de cada produto selecionado
  const [estoqueProdutos, setEstoqueProdutos] = useState<{[key: string]: number}>({});

  useEffect(() => {
    setClientesAtualizados(clientes);
  }, [clientes]);

  useEffect(() => {
    if (editingVenda) {
      setFormData({
        codigo_venda: editingVenda.codigo_venda,
        cliente_id: editingVenda.cliente_id || '',
        data_venda: editingVenda.data_venda.split('T')[0]
      });
      setClienteInput(editingVenda.cliente?.nome || '');
      setItensVenda(editingVenda.itens_venda?.map(item => ({
        ...item,
        id: item.id || Date.now().toString()
      })) || []);
      
      // Carregar observação do cliente se estiver editando
      if (editingVenda.cliente_id) {
        const cliente = clientesAtualizados.find(c => c.id === editingVenda.cliente_id);
        setClienteObservacao(cliente?.observacao || '');
      }
      
      const newProdutoInputs: {[key: string]: string} = {};
      const newServicoInputs: {[key: string]: string} = {};
      const newEstoqueProdutos: {[key: string]: number} = {};
      
      editingVenda.itens_venda?.forEach(item => {
        if (item.tipo === 'produto') {
          newProdutoInputs[item.id || ''] = item.nome;
          // Buscar estoque do produto
          const produto = produtos.find(p => p.id === item.item_id);
          if (produto) {
            newEstoqueProdutos[item.id || ''] = produto.estoque;
          }
        } else {
          newServicoInputs[item.id || ''] = item.nome;
        }
      });
      
      setProdutoInputs(newProdutoInputs);
      setServicoInputs(newServicoInputs);
      setEstoqueProdutos(newEstoqueProdutos);
    } else {
      resetForm();
    }
  }, [editingVenda, clientesAtualizados, produtos]);

  const resetForm = () => {
    setFormData({
      codigo_venda: '',
      cliente_id: '',
      data_venda: new Date().toISOString().split('T')[0]
    });
    setItensVenda([]);
    setClienteInput('');
    setClienteObservacao('');
    setShowClienteSuggestions(false);
    setProdutoInputs({});
    setShowProdutoSuggestions({});
    setServicoInputs({});
    setShowServicoSuggestions({});
    setEstoqueProdutos({});
  };

  // Função para lidar com novo cliente cadastrado
  const handleNovoClienteCriado = (novoCliente: { id: string; nome: string }) => {
    const clienteCompleto: Cliente = {
      id: novoCliente.id,
      nome: novoCliente.nome,
      codigo: '',
      telefone: '',
      observacao: ''
    };
    
    setClientesAtualizados(prev => [...prev, clienteCompleto]);
    setClienteInput(novoCliente.nome);
    setFormData({ ...formData, cliente_id: novoCliente.id });
    setClienteObservacao('');
    setShowClienteSuggestions(false);
  };

  const adicionarItem = (tipo: 'produto' | 'servico') => {
    const novoItem: ItemVenda = {
      id: Date.now().toString(),
      tipo,
      item_id: '',
      nome: '',
      quantidade: 1,
      valor_unitario: 0,
      preco_custo: 0,
      valor_total: 0
    };
    setItensVenda([...itensVenda, novoItem]);
  };

  const removerItem = (id: string) => {
    setItensVenda(itensVenda.filter(item => item.id !== id));
    const newProdutoInputs = { ...produtoInputs };
    const newServicoInputs = { ...servicoInputs };
    const newEstoqueProdutos = { ...estoqueProdutos };
    delete newProdutoInputs[id];
    delete newServicoInputs[id];
    delete newEstoqueProdutos[id];
    setProdutoInputs(newProdutoInputs);
    setServicoInputs(newServicoInputs);
    setEstoqueProdutos(newEstoqueProdutos);
  };

  const atualizarItem = (id: string, campo: string, valor: any) => {
    setItensVenda(itensVenda.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor };
        if (campo === 'quantidade' || campo === 'valor_unitario') {
          itemAtualizado.valor_total = itemAtualizado.quantidade * itemAtualizado.valor_unitario;
        }
        return itemAtualizado;
      }
      return item;
    }));
  };

  // Funções para autocomplete de clientes
  const filteredClientes = clientesAtualizados.filter(cliente =>
    cliente.nome.toLowerCase().includes(clienteInput.toLowerCase())
  );

  const handleClienteInputChange = (value: string) => {
    setClienteInput(value);
    const cliente = clientesAtualizados.find(c => c.nome === value);
    setFormData({ ...formData, cliente_id: cliente?.id || '' });
    
    // Atualizar observação do cliente
    setClienteObservacao(cliente?.observacao || '');
    
    setShowClienteSuggestions(value.length > 0);
  };

  const selecionarCliente = (cliente: Cliente) => {
    setClienteInput(cliente.nome);
    setFormData({ ...formData, cliente_id: cliente.id });
    
    // Definir observação do cliente selecionado
    setClienteObservacao(cliente.observacao || '');
    
    setShowClienteSuggestions(false);
  };

  const handleProdutoInputChange = (itemId: string, value: string) => {
    setProdutoInputs({ ...produtoInputs, [itemId]: value });
    setShowProdutoSuggestions({ ...showProdutoSuggestions, [itemId]: value.length > 0 });
    atualizarItem(itemId, 'nome', value);
  };

  const selecionarProdutoAutocomplete = (itemId: string, produto: Produto) => {
    setProdutoInputs({ ...produtoInputs, [itemId]: produto.nome_produto });
    setShowProdutoSuggestions({ ...showProdutoSuggestions, [itemId]: false });
    
    // Atualizar estoque do produto selecionado
    setEstoqueProdutos({ ...estoqueProdutos, [itemId]: produto.estoque });
    
    setItensVenda(itensVenda.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = {
          ...item,
          item_id: produto.id,
          nome: produto.nome_produto,
          valor_unitario: produto.preco_venda,
          preco_custo: produto.custo || 0
        };
        itemAtualizado.valor_total = itemAtualizado.quantidade * itemAtualizado.valor_unitario;
        return itemAtualizado;
      }
      return item;
    }));
  };

  const filteredProdutos = (itemId: string) => {
    const input = produtoInputs[itemId] || '';
    return produtos.filter(produto =>
      produto.nome_produto.toLowerCase().includes(input.toLowerCase()) ||
      produto.codigo.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleServicoInputChange = (itemId: string, value: string) => {
    setServicoInputs({ ...servicoInputs, [itemId]: value });
    setShowServicoSuggestions({ ...showServicoSuggestions, [itemId]: value.length > 0 });
    atualizarItem(itemId, 'nome', value);
  };

  const selecionarServicoAutocomplete = (itemId: string, servico: Servico) => {
    setServicoInputs({ ...servicoInputs, [itemId]: servico.nome_servico });
    setShowServicoSuggestions({ ...showServicoSuggestions, [itemId]: false });
    
    setItensVenda(itensVenda.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = {
          ...item,
          item_id: servico.id,
          nome: servico.nome_servico,
          valor_unitario: servico.preco_hora,
          preco_custo: servico.preco_custo || 0
        };
        itemAtualizado.valor_total = itemAtualizado.quantidade * itemAtualizado.valor_unitario;
        return itemAtualizado;
      }
      return item;
    }));
  };

  const filteredServicos = (itemId: string) => {
    const input = servicoInputs[itemId] || '';
    return servicos.filter(servico =>
      servico.nome_servico.toLowerCase().includes(input.toLowerCase()) ||
      servico.codigo.toLowerCase().includes(input.toLowerCase())
    );
  };

  const calcularTotal = () => {
    return itensVenda.reduce((total, item) => total + item.valor_total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (itensVenda.length === 0) return;

    const itensIncompletos = itensVenda.filter(item => !item.nome || !item.item_id);
    if (itensIncompletos.length > 0) return;

    const valorTotal = calcularTotal();
    const vendaData = {
      codigo_venda: formData.codigo_venda || generateVendaCode(vendas),
      cliente_id: formData.cliente_id,
      data_venda: formData.data_venda,
      total: valorTotal,
      itens: itensVenda
    };
    
    onSubmit(vendaData);
    onClose();
    resetForm();
  };

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 md:p-6 z-50">
        <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6 border-b border-slate-700">
            <h3 className="text-xl font-semibold text-white">
              {editingVenda ? 'Editar Venda' : 'Nova Venda'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
            {/* Código e Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código da Venda</label>
                <input
                  type="text"
                  value={formData.codigo_venda}
                  onChange={(e) => setFormData({ ...formData, codigo_venda: e.target.value })}
                  placeholder={generateVendaCode(vendas)}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Cliente</label>
                  <button
                    type="button"
                    onClick={() => setShowNovoClienteModal(true)}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                  >
                    <UserPlus size={12} />
                    Novo Cliente
                  </button>
                </div>
                <input
                  type="text"
                  value={clienteInput}
                  onChange={(e) => handleClienteInputChange(e.target.value)}
                  onFocus={() => setShowClienteSuggestions(clienteInput.length > 0)}
                  placeholder="Digite o nome do cliente..."
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
                  required
                />
                {showClienteSuggestions && filteredClientes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredClientes.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => selecionarCliente(cliente)}
                        className="w-full text-left px-4 py-2 text-white hover:bg-slate-600 focus:bg-slate-600 focus:outline-none"
                      >
                        {cliente.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Campo de Observação do Cliente */}
            {clienteObservacao && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observação do Cliente</label>
                <div className="w-full bg-slate-600 text-gray-300 px-4 py-3 rounded-lg border border-slate-500">
                  {clienteObservacao}
                </div>
              </div>
            )}

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data da Venda</label>
              <input
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">Produtos</h4>
                <button
                  type="button"
                  onClick={() => adicionarItem('produto')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Adicionar Produto</span>
                </button>
              </div>
              
              {itensVenda.filter(item => item.tipo === 'produto').map((item) => (
                <div key={item.id} className="bg-slate-700 p-4 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-medium">Produto</h5>
                    <button
                      type="button"
                      onClick={() => removerItem(item.id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="relative">
                      <label className="block text-sm text-gray-300 mb-1">Produto</label>
                      <input
                        type="text"
                        value={produtoInputs[item.id!] || ''}
                        onChange={(e) => handleProdutoInputChange(item.id!, e.target.value)}
                        onFocus={() => setShowProdutoSuggestions({ ...showProdutoSuggestions, [item.id!]: (produtoInputs[item.id!] || '').length > 0 })}
                        placeholder="Digite o nome do produto..."
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                        required
                      />
                      {showProdutoSuggestions[item.id!] && filteredProdutos(item.id!).length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-slate-600 border border-slate-500 rounded shadow-lg max-h-40 overflow-y-auto">
                          {filteredProdutos(item.id!).map((produto) => (
                            <button
                              key={produto.id}
                              type="button"
                              onClick={() => selecionarProdutoAutocomplete(item.id!, produto)}
                              className="w-full text-left px-3 py-2 text-white hover:bg-slate-500 focus:bg-slate-500 focus:outline-none text-sm"
                            >
                              <div>{produto.nome_produto}</div>
                              <div className="text-xs text-gray-300">{produto.codigo} - R$ {produto.preco_venda.toFixed(2)}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Exibir estoque disponível */}
                      {item.item_id && estoqueProdutos[item.id!] !== undefined && (
                        <div className="mt-1 text-xs text-gray-400">
                          Estoque disponível: <span className="text-sky-400 font-medium">{estoqueProdutos[item.id!]} unidades</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id!, 'quantidade', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Valor Unit. (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.valor_unitario}
                        onChange={(e) => atualizarItem(item.id!, 'valor_unitario', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Custo Unit. (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.preco_custo}
                        onChange={(e) => atualizarItem(item.id!, 'preco_custo', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Total</label>
                      <div className="bg-slate-500 text-white px-3 py-2 rounded">
                        R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {itensVenda.filter(item => item.tipo === 'produto').length === 0 && (
                <p className="text-gray-400 text-sm">Nenhum produto adicionado</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">Serviços</h4>
                <button
                  type="button"
                  onClick={() => adicionarItem('servico')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Adicionar Serviço</span>
                </button>
              </div>
              
              {itensVenda.filter(item => item.tipo === 'servico').map((item) => (
                <div key={item.id} className="bg-slate-700 p-4 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-medium">Serviço</h5>
                    <button
                      type="button"
                      onClick={() => removerItem(item.id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="relative">
                      <label className="block text-sm text-gray-300 mb-1">Serviço</label>
                      <input
                        type="text"
                        value={servicoInputs[item.id!] || ''}
                        onChange={(e) => handleServicoInputChange(item.id!, e.target.value)}
                        onFocus={() => setShowServicoSuggestions({ ...showServicoSuggestions, [item.id!]: (servicoInputs[item.id!] || '').length > 0 })}
                        placeholder="Digite o nome do serviço..."
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                        required
                      />
                      {showServicoSuggestions[item.id!] && filteredServicos(item.id!).length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-slate-600 border border-slate-500 rounded shadow-lg max-h-40 overflow-y-auto">
                          {filteredServicos(item.id!).map((servico) => (
                            <button
                              key={servico.id}
                              type="button"
                              onClick={() => selecionarServicoAutocomplete(item.id!, servico)}
                              className="w-full text-left px-3 py-2 text-white hover:bg-slate-500 focus:bg-slate-500 focus:outline-none text-sm"
                            >
                              <div>{servico.nome_servico}</div>
                              <div className="text-xs text-gray-300">{servico.codigo} - R$ {servico.preco_hora.toFixed(2)}/h</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id!, 'quantidade', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Valor Unit. (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.valor_unitario}
                        onChange={(e) => atualizarItem(item.id!, 'valor_unitario', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Custo Unit. (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.preco_custo}
                        onChange={(e) => atualizarItem(item.id!, 'preco_custo', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Total</label>
                      <div className="bg-slate-500 text-white px-3 py-2 rounded">
                        R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {itensVenda.filter(item => item.tipo === 'servico').length === 0 && (
                <p className="text-gray-400 text-sm">Nenhum serviço adicionado</p>
              )}
            </div>
            
            {itensVenda.length > 0 && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">Valor Total da Venda:</p>
                <p className="text-white font-semibold text-2xl">
                  R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 pt-4">
              <button
                type="submit"
                className="w-full md:flex-1 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg transition-colors"
              >
                {editingVenda ? 'Salvar' : 'Cadastrar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="w-full md:flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <NovoClienteModal
        showModal={showNovoClienteModal}
        onClose={() => setShowNovoClienteModal(false)}
        onClienteCreated={handleNovoClienteCriado}
      />
    </>
  );
};
