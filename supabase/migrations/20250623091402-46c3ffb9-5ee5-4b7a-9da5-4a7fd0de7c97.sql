
-- Criar tabela para armazenar os itens de cada venda
CREATE TABLE public.itens_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'servico')),
  item_id UUID NOT NULL, -- Referência para produto ou serviço
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir acesso completo
CREATE POLICY "Allow all operations on itens_venda" ON public.itens_venda FOR ALL USING (true) WITH CHECK (true);

-- Habilitar realtime para a tabela de itens de venda
ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_venda;
