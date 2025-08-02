
-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  telefone TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacao TEXT
);

-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome_produto TEXT NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  custo DECIMAL(10,2),
  estoque INTEGER NOT NULL DEFAULT 0
);

-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome_servico TEXT NOT NULL,
  preco_hora DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2)
);

-- Criar tabela de vendas
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_venda TEXT NOT NULL UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  data_venda TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total DECIMAL(10,2) NOT NULL
);

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir acesso completo (você pode ajustar conforme necessário)
CREATE POLICY "Allow all operations on clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on servicos" ON public.servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on vendas" ON public.vendas FOR ALL USING (true) WITH CHECK (true);

-- Habilitar realtime para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.servicos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
